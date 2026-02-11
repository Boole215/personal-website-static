import { getRecentTracks, getTopArtists, getHeartedTracks } from './lastfm.ts';
import * as fs from 'fs';

let contents: string;

fs.readFile("./template.md", "utf-8", (err, data) => {
  if(err){
    console.log(err);
    return;
  } else {
    contents = data.toString();    
  }
});

const recentTracks = await getRecentTracks();
const topArtists = await getTopArtists();
const heartedTracks = await getHeartedTracks();
const today = new Date();
const currentDate = today.toLocaleDateString("en-US");

const recentTracksAsMd: string = recentTracks.reduce((acc: string, curr) => acc + " - " + curr.artist + " - " + curr.title + "\n", "");
const topArtistsAsMd: string = topArtists.reduce((acc: string, curr) => acc + ` ${curr.rank}. ` + curr.artist + "\n", "");
const heartedTracksAsMd: string = heartedTracks.reduce((acc: string, curr) => acc + " - " + curr.artist + " - " + curr.title + "\n", "");


contents = contents.replace("%LAST_UPDATED_DATE%", currentDate);
contents = contents.replace("%RECENTLY_LISTENED_TO_ARTISTS%", recentTracksAsMd);
contents = contents.replace("%CURRENT_TOP_ARTISTS%", topArtistsAsMd);
contents = contents.replace("%HEARTED_SONGS%", heartedTracksAsMd);  

fs.writeFileSync("../index.md", contents);
