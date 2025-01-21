import { MongoClient } from 'mongodb'

async function connectToCluster(uri) {
  let mongoClient

  try {
    mongoClient = new MongoClient(uri)
    console.log('Connecting to MongoDB Atlas cluster...')
    await mongoClient.connect()
    console.log('Successfully connected to MongoDB Atlas!')

    return mongoClient
  } catch (error) {
    console.error('Connection to MongoDB Atlas failed!', error)
    process.exit()
  }
}

async function getJobsCrawlerCollection() {
  const uri = window.localStorage.getItem('MONGO_URL')
  let mongoClient

  try {
    mongoClient = await connectToCluster(uri)
    const db = mongoClient.db('darkweb_task')
    const collection = db.collection('jobs_crawler')

    return collection
  } catch {
    console.error('Failed to connect to MongoClient.')
  }
}

async function getUsersCollection() {
  const uri = window.localStorage.getItem('MONGO_URL')
  let mongoClient

  try {
    mongoClient = await connectToCluster(uri)
    const db = mongoClient.db('darkweb_task')
    const collection = db.collection('users')

    return collection
  } catch {
    console.error('Failed to connect to MongoClient.')
  }
}

export default {
  connectToCluster,
  getJobsCrawlerCollection,
  getUsersCollection
}
