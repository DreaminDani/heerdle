import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

export async function load({ params }) {
  let client = new MongoClient(env.MONGODB_URI)
  let clientPromise = client.connect()
  const dbConnection = await clientPromise;
  const db = dbConnection.db(env.MONGODB_DB);
  const collection = db.collection('tracks');
  const selection = db.collection('days');

  let track;
  const date = new Date();
  const today = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
  const todaysTrack = await selection.findOne({ selectedDate: today });
  console.log(todaysTrack)
  if (todaysTrack) {
    track = [todaysTrack];
  }
  else {
    track = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
    track[0].selectedDate = today;
    delete track[0]._id
    selection.insertOne(track[0])
  }
  const options = await collection.find().toArray()
  const intermediateOptions = options.map(({ _id, ...rest }) => {
    rest.searchable = `${rest.name} - ${rest.artists.map((artist) => artist.name).join(', ')}`
    return rest;
  });
  const clientReadyOptions = intermediateOptions.filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.place === value.place && t.name === value.name
  ))
)
  const clientReadyTrack = track[0];
  delete clientReadyTrack._id
  
  return {
    options: clientReadyOptions,
    track: clientReadyTrack
  };
}