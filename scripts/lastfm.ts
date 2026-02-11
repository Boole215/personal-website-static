const API_BASE = "http://ws.audioscrobbler.com/2.0/?method={$method}&user=%user%&api_key=%api_key%&format=json"
const API_KEY = ""

const constructAddress = (method) => `http://ws.audioscrobbler.com/2.0/?method=${method}&user=kreitmire&api_key=${API_KEY}&format=json`


interface Image {
  size: ["small", "medium", "large", "extralarge"];
  "#text": String;
}

interface Track {
  artist: {
    mbid: String;
    "#name": String;
  },
  streamable: String;
  image: {
    [key: string]: Image
  };
  album: {
    mbid: String;   
    "#text": String;
  };
  name: String;
  "@attr"?: {
    nowplaying: "true";
  };
  date?: {
    uts: String;
    "#text": String;
  };  
}

interface RecentTracks {
  recenttracks: {
    track: {
      [key: string]: Track
    };
    "@attr":{
      user: String;
      totalPages: String;
      page: String;
      perPage: String;
      total: String;
    }
  }
}

interface TopArtist {
  streamable: string;
  image: {
    [key: string]: Image
  };
  mbid: string;
  url: string;
  playcount: string;
  "@attr": {
    rank: string
  };
  name: string;
}

interface GetTopArtists {
  topartists: {
    artist: {
      [key: string]: TopArtist
    };
  };
}

interface FormattedTopArtist{
  name: string;
  rank: number;
}

interface FormattedTrack {
  artist: String;
  title: String;
}

interface HeartedTrack {
  artist: {
    url: string;
    name: string;
    mbid: string;
  };
  date: {
    uts: string;
    "#text": text;
  };
  mbid: string;
  url: string;
  name: string;
}

// From StackOverflow - 2450954
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

export async function getRecentTracks(): Promise<FormattedTrack[]> {
  try {
    const method = "user.getrecenttracks&limit=8"
    const url = constructAddress(method);
    const response = await fetch(url);
    if (!response.ok){
      throw new Error(`Bad response to getRecentTracks: ${response.status}`);
    }

    const result: RecentTracks = await response.json();    
    const track = result.recenttracks.track;
    const formattedTracks = [];

    for(let i = 0; i < Object.keys(track).length; i++){
      const currentTrack: FormattedTrack =
        { "artist": track[i].artist["#text"],
          "title": track[i].name,
        };
      formattedTracks.push(currentTrack);
    }
    return formattedTracks
  } catch(error){
    console.log(error.message);
  }
}

export async function getTopArtists(): Promise<FormattedArtist[]> {
  try {
    const method = "user.gettopartists&limit=6"
    const url = constructAddress(method);
    const response = await fetch(url);
    if (!response.ok){
      throw new Error(`Bad response to getTopArtists: ${response.status}`);
    }

    const result: getTopArtists = await response.json();    
    const artist = result.topartists.artist;
    const formattedArtists = [];

    for(let i = 0; i < Object.keys(artist).length; i++){
      const currentArtist: FormattedArtist =
        { artist: artist[i].name,
          rank: artist[i]["@attr"].rank,
        };
      formattedArtists.push(currentArtist);
    }
    return formattedArtists
  } catch(error){
    console.log(error.message);
  }
}

export async function getHeartedTracks(): Promise<FormattedTrack[]> {
  try {
    const method = "user.getlovedtracks"
    const url = constructAddress(method);
    const response = await fetch(url);
    if (!response.ok){
      throw new Error(`Bad response to getLovedTracks: ${response.status}`);
    }

    const result: HeartedTracks = await response.json();    
    const track = result.lovedtracks.track;
    const formattedTracks = [];

    for(let i = 0; i < Object.keys(track).length; i++){
      const currentTrack: FormattedTrack =
        { "artist": track[i].artist.name,
          "title": track[i].name,
        };
      formattedTracks.push(currentTrack);
    }

    const shuffledFormattedTracks = shuffle(formattedTracks);
    return formattedTracks.slice(0,10);
  } catch(error){
    console.log(error.message);
  }
}
