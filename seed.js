const SpotifyWebApi = require('node-spotify-api');
const { MongoClient } = require('mongodb');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
  } catch (error) {
    console.error('Error getting access token', error);
  }
}

async function getTopGenres() {
  const topGenres = []; // Manually specify the top genres as Spotify API doesn't provide a direct endpoint
  return topGenres;
}

async function getTopArtists(genre) {
  try {
    const data = await spotifyApi.searchArtists(`genre:"${genre}"`, { limit: 50 });
    return data.body.artists.items;
  } catch (error) {
    console.error(`Error getting artists for genre: ${genre}`, error);
    return [];
  }
}

async function getTopSongs(artistId) {
  try {
    const data = await spotifyApi.getArtistTopTracks(artistId, 'global');
    return data.body.tracks.slice(0, 5);
  } catch (error) {
    console.error(`Error getting top songs for artist: ${artistId}`, error);
    return [];
  }
}

async function storeSongsInDb(songs, db) {
  const collection = db.collection('songs');
  await collection.insertMany(songs);
}

async function main() {
  await getAccessToken();
  const topGenres = await getTopGenres();

  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db(process.env.MONGODB_DB);

  for (const genre of topGenres) {
    const topArtists = await getTopArtists(genre);

    for (const artist of topArtists) {
      const topSongs = await getTopSongs(artist.id);
      await storeSongsInDb(topSongs, db);
    }
  }

  mongoClient.close();
}

main();