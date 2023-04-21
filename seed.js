require('dotenv').config();
const SpotifyWebApi = require('node-spotify-api');
const { MongoClient } = require('mongodb');

// topGenres = ['pop', 'hip-hop', 'rock', 'country', 'edm', 'r&b', 'folk'];  ; // Manually specify the top genres as Spotify API doesn't provide a direct endpoint
topGenres = ['pop']

const spotifyApi = new SpotifyWebApi({
  id: process.env.SPOTIFY_CLIENT_ID,
  secret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function getTopArtists(genre) {
  try {
    const data = await spotifyApi.search({type: 'artist', query: `genre:"${genre}"`, limit: 50 });
    return data.artists.items;
  } catch (error) {
    console.error(`Error getting artists for genre: ${genre}`, error);
    return [];
  }
}

async function getTopTracks(artistId) {
  try {
    const data = await spotifyApi.request(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=us`);
    return data.tracks;
  } catch (error) {
    console.error(`Error getting top tracks for artist: ${artistId}`, error);
    return [];
  }
}

async function main() {
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db(process.env.MONGODB_DB);
  
  // wipe the tracks collection
  const trackList = await db.collections({name: 'tracks'})
  if (trackList.length > 0) {
    await db.collection('tracks').drop();
  }

  for (const genre of topGenres) {
    const topArtists = await getTopArtists(genre);

    for (const artist of topArtists) {
      const topTracks = await getTopTracks(artist.id);
      // write tracks to the db
      const collection = db.collection('tracks');
      await collection.insertMany(topTracks);
    }
  }

  mongoClient.close();
}

main();