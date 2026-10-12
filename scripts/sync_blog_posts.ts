import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const BLOG_REPO = process.env.BLOG_REPO_PATH || '/Users/boole215/git/blog';
const POSTS_SRC = path.join(BLOG_REPO, 'src/content/blog');

const POSTS_OUT = path.join('..', '_posts');
const ASSETS_OUT = path.join('..', 'assets', 'blog');

const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g;

function toIsoDate(pubDate: string): string {
  const date = new Date(pubDate);
  return date.toISOString().slice(0, 10);
}

function removeManagedPosts(): void {
  if (!fs.existsSync(POSTS_OUT)) {
    fs.mkdirSync(POSTS_OUT, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(POSTS_OUT).filter((f) => f.endsWith('.md'));
  let removed = 0;

  for (const entry of entries) {
    const fullPath = path.join(POSTS_OUT, entry);
    try {
      const { data } = matter(fs.readFileSync(fullPath, 'utf-8'));
      if (!data.synced_from) {
        continue;
      }
      fs.unlinkSync(fullPath);
      if (data.slug) {
        fs.rmSync(path.join(ASSETS_OUT, data.slug), { recursive: true, force: true });
      }
      removed++;
    } catch (error) {
      console.log(`Failed to inspect ${fullPath}: ${(error as Error).message}`);
    }
  }

  console.log(`Removed ${removed} previously synced post(s).`);
}

function copyAndRewriteImages(content: string, heroImage: string | undefined, slug: string): { content: string; heroImage: string | undefined } {
  const outDir = path.join(ASSETS_OUT, slug);
  fs.mkdirSync(outDir, { recursive: true });

  function copyOne(rawPath: string): string {
    const srcPath = path.resolve(POSTS_SRC, rawPath);
    const basename = path.basename(srcPath);
    fs.copyFileSync(srcPath, path.join(outDir, basename));
    return `/assets/blog/${slug}/${basename}`;
  }

  const rewrittenContent = content.replace(IMAGE_RE, (_match, alt, imgPath, title) => {
    const newPath = copyOne(imgPath);
    return title ? `![${alt}](${newPath} "${title}")` : `![${alt}](${newPath})`;
  });

  const rewrittenHero = heroImage ? copyOne(heroImage) : undefined;

  return { content: rewrittenContent, heroImage: rewrittenHero };
}

function syncPosts(): void {
  fs.mkdirSync(ASSETS_OUT, { recursive: true });

  const files = fs
    .readdirSync(POSTS_SRC)
    .filter((f) => !f.startsWith('.') && f.endsWith('.md'));

  let synced = 0;

  for (const file of files) {
    try {
      const fullPath = path.join(POSTS_SRC, file);
      const { data, content } = matter(fs.readFileSync(fullPath, 'utf-8'));

      if (!Array.isArray(data.tags) || !data.tags.includes('dev')) {
        continue;
      }

      const slug = path.basename(file, '.md');
      const isoDate = toIsoDate(data.pubDate);

      const { content: rewrittenContent, heroImage } = copyAndRewriteImages(content, data.heroImage, slug);

      const frontMatter: Record<string, unknown> = {
        layout: 'post',
        title: data.title,
        date: isoDate,
        synced_from: `src/content/blog/${file}`,
        slug,
      };
      if (data.description) frontMatter.description = data.description;
      if (heroImage) frontMatter.heroImage = heroImage;
      if (data.tags) frontMatter.tags = data.tags;

      const outPath = path.join(POSTS_OUT, `${isoDate}-${slug}.md`);
      fs.writeFileSync(outPath, matter.stringify(rewrittenContent, frontMatter));

      console.log(`Synced ${file} -> ${outPath}`);
      synced++;
    } catch (error) {
      console.log(`Failed to sync ${file}: ${(error as Error).message}`);
    }
  }

  console.log(`Synced ${synced} dev post(s).`);
}

removeManagedPosts();
syncPosts();
