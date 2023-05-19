// @ts-nocheck
import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';
import { defaultGameState } from '$lib/defaults.js';

async function getCleanTrack(collection, selection, workingTrack, date) {
  let track;
  if (workingTrack) {
    track = [workingTrack];
  }
  else {
    track = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
    track[0].selectedDate = date;
    delete track[0]._id
    selection.insertOne(track[0])
  }
  const clientReadyTrack = track[0];
  delete clientReadyTrack._id

  return clientReadyTrack;
}

export async function load({ cookies }) {
  let client = new MongoClient(env.MONGODB_URI)
  let clientPromise = client.connect()
  const dbConnection = await clientPromise;
  const db = dbConnection.db(env.MONGODB_DB);
  const collection = db.collection('tracks');
  const selection = db.collection('days');

  const date = new Date();
  const yesterdayDate = new Date(Date.now() - 864e5);
  const yesterday = `${yesterdayDate.getFullYear()}-${yesterdayDate.getMonth() + 1}-${yesterdayDate.getDate()}`;
  const yesterdaysTrack = await selection.findOne({ selectedDate: yesterday })
  const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  const todaysTrack = await selection.findOne({ selectedDate: today });
  const tomorrowDate = new Date(Date.now() + 864e5);
  const tomorrow = `${tomorrowDate.getFullYear()}-${tomorrowDate.getMonth() + 1}-${tomorrowDate.getDate()}`;
  const tomorrowsTrack = await selection.findOne({ selectedDate: tomorrow });

  // get tracks
  const cleanYesterday = await getCleanTrack(collection, selection, yesterdaysTrack, tomorrow);
  const cleanToday = await getCleanTrack(collection, selection, todaysTrack, today);
  const cleanTomorrow = await getCleanTrack(collection, selection, tomorrowsTrack, tomorrow);
  const tracks = {};
  tracks[yesterday] = cleanYesterday;
  tracks[today] = cleanToday;
  tracks[tomorrow] = cleanTomorrow;

  // get options
  const options = await collection.find().toArray()
  const intermediateOptions = options.map(({ _id, ...rest }) => {
    rest.searchable = `${rest.name} - ${rest.artists.map((artist) => artist.name).join(', ')}`
    return rest;
  });
  const clientReadyOptions = intermediateOptions.filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.id === value.id
  ))
)
  

  let gamestate;
  const storedGameState = cookies.get('gamestate')
  if (storedGameState) {
    gamestate = JSON.parse(storedGameState);
  } else {
    cookies.set('gamestate', JSON.stringify(defaultGameState), { path: '/', httpOnly: false });
    gamestate = defaultGameState;
  }

  dbConnection.close();
  return {
    gamestate,
    options: clientReadyOptions,
    tracks,
  };
}