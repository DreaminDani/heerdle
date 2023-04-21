import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  console.log(process.env['MONGODB_URI'])
  let client = new MongoClient(env.MONGODB_URI)
  let clientPromise = client.connect()
  const dbConnection = await clientPromise;
  const db = dbConnection.db(env.MONGODB_DB);
  const collection = db.collection('tracks');
  
  const track = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
  const clientReadyTrack = track[0];
  delete clientReadyTrack._id
  
  return {
    track: clientReadyTrack
  };
}