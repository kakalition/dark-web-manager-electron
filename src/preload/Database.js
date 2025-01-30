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
    // process.exit()
  }
}

async function getJobsCrawlerCollection() {
  let mongoClient

  try {
    mongoClient = await connectToCluster(getMongoURI())
    const db = mongoClient.db('allnewdarkweb')
    const collection = db.collection('jobs_crawler')

    return collection
  } catch {
    console.error('Failed to connect to MongoClient.')
  }
}

async function getUsersCollection() {
  let mongoClient

  try {
    mongoClient = await connectToCluster(getMongoURI())
    const db = mongoClient.db('allnewdarkweb')
    const collection = db.collection('users')

    return collection
  } catch {
    console.error('Failed to connect to MongoClient.')
  }
}

function getMongoURI() {
  const temp = `mongodb://${window.localStorage.getItem('DWC_MONGO_USER')}:${window.localStorage.getItem('DWC_MONGO_PASS')}@${window.localStorage.getItem('DWC_MONGO_HOST')}:${window.localStorage.getItem('DWC_MONGO_PORT')}/allnewdarkweb?directConnection=true`
  console.log(temp)

  return temp
}

export default {
  connectToCluster,
  getJobsCrawlerCollection,
  getUsersCollection
}
