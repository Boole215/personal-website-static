---
title: Blog
layout: default
---
<link rel="stylesheet" href="bundle.css">

{% include navbar.html %}

# Blog

A dev-focused cut of my [personal blog](https://tr-edge.com) &mdash; personal projects and other technical endeavours

<div id="post-list">
  <ul>
    {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span class="post-meta">{{ post.date | date: "%B %-d, %Y" }}</span>
      {% if post.description %}<p>{{ post.description }}</p>{% endif %}
    </li>
    {% endfor %}
  </ul>
  {% if site.posts.size == 0 %}
  <p><em>Nothing posted yet &mdash; check back soon.</em></p>
  {% endif %}
</div>
