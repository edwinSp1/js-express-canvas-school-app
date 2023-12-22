const {MongoClient} = require('mongodb')
var ObjectId = require('mongodb').ObjectId;
const uriConnect = process.env['MONGODB_KEY']
console.log(uriConnect)
var allowed = ['Creator', 'Admin', 'Teacher']
/*
const main = async () => {
  const client = new MongoClient(uriConnect)
  await client.connect();
  const db = client.db('users')
  const coll = db.collection('loginInfo')
  var loginInfo = await coll.find().toArray()
  console.log(res)
  for(var res of  loginInfo) {
    if(typeof res.specialRole === 'string' || !res.specialRole)
    res.specialRole = [res.specialRole]
    else 
      res.specialRole = res.specialRole.flat(1000)
    await coll.updateOne({'username': res.username}, {
      $set: {
        'specialRole': res.specialRole
      }
    })
  }
  await client.close();
}
main()
*/
const fetch = require('node-fetch')
const encryption = require('./encrypt')
/**
 * Retrieves data from the specified URL using the fetch API.
 *
 * @param {string} url - The URL to fetch data from.
 * @return {Promise} A promise that resolves to the JSON data retrieved from the URL.
 */
async function getapi(url) {
  const response = await fetch(url);
  var data = await response.json();
  return data
}
/**
 * Retrieves a document from the specified collection in the given database based on the provided query.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {object} query - The query object used to filter the documents.
 * @return {object} The document that matches the query, or undefined if no document is found.
 */
async function getDoc(db, coll, query) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.findOne(query)
    return res
  } catch (e) {
    console.log(e)
  } finally {
    await client.close();
  }
}
/**
 * Retrieves documents from the specified database and collection
 * with a specified limit.
 *
 * @param {string} db - The name of the database to retrieve documents from.
 * @param {string} coll - The name of the collection to retrieve documents from.
 * @param {object} query - The query to filter the documents.
 * @param {number} lim - The maximum number of documents to retrieve.
 * @return {Promise<Array<object>|Error>} - A promise that resolves to an array
 * of documents if successful, or an Error object if an error occurs.
 */
async function getDocsWithLimit(db, coll, query, lim) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var cursor = collection.find(query).limit(lim)
    var res = []
    for await(const doc of cursor) {
      res.push(doc)
    }
    return res
  } catch (e) {
    console.log(e)
    return e
  } finally {
    await client.close();
  }
}
async function getDocs(db, coll, query) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var cursor = collection.find(query)
    var res = []
    for await(const doc of cursor) {
      res.push(doc)
    }
    return res
  } catch (e) {
    console.log(e)
    return e
  } finally {
    await client.close();
  }
}
/**
 * Updates a document in the specified collection of a database.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {object} query - The query object to find the document to update.
 * @param {object} update - The update object to apply to the document.
 * @return {object} The result of the update operation.
 */
async function updateDoc(db, coll, query, update) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.updateOne(
      query, 
      {
        $set: update
      }
    )
    return res
  } catch(e) {
    console.log(e)
  } finally {
    await client.close();
  }
}
/**
 * Modifies a document in the specified collection of a MongoDB database.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {object} query - The query used to find the document to modify.
 * @param {object} update - The update to be applied to the document.
 * @return {object} The result of the update operation.
 */
async function modifyDoc(db, coll, query, update) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.updateOne(
      query, 
      update
    )
    return res
  } catch(e) {
    console.log(e)
  } finally {
    await client.close();
  }
}
/**
 * Retrieves and returns a sorted array of documents from the specified MongoDB database and collection based on the given query and sort function.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {function} sortFx - The sort function used to sort the documents.
 * @param {object} query - The query object used to filter the documents.
 * @return {Promise<Array>} A promise that resolves to an array of sorted documents.
 */
async function getSortedDB (db, coll, sortFx, query) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var cursor = collection.find(query).sort(sortFx)

    var res = []
    for await(const doc of cursor) {
      res.push(doc)
    }
    return res
  } catch (e) {
    console.log(e)
    return e
  } finally {
    await client.close();
  }
}
/**
 * Deletes a document from the specified collection in the database.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {string} id - The ID of the document to be deleted.
 * @return {object} - The result of the delete operation.
 */
async function deleteDoc(db, coll, id) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.deleteOne({_id: new ObjectId(id)})
    return res
  } catch(e) {
      
     console.log("error deleting from DB:" + e) 
  } finally {
    await client.close()
  }
}
/**
 * Inserts a document into a specified collection in a database.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {Object} doc - The document to be inserted.
 * @return {Promise<Object>} - A Promise that resolves to the result of the insertion operation.
 */
async function insert(db, coll, doc) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.insertOne(doc)
    return res
  } catch(e) {
    console.log(e);
    return e
  } finally {
    await client.close();
  }
}
/**
 * Upserts a document into a specified collection in the given database.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {object} query - The query to determine which document(s) to update.
 * @param {object} doc - The document to upsert.
 * @return {Promise} - A promise that resolves to the result of the update operation.
 */
async function upsertDoc(db, coll, query, doc) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.updateOne(query, {
      $set: doc
    }, {
      $upsert: true
    })
    return res
  } catch(e) {
    console.log(e);
    return e
  } finally {
    await client.close();
  }

}

/** OBSOLETE
 * Retrieves data from a specified MongoDB database and collection based on the provided query parameters.
 *
 * @param {string} db - The name of the MongoDB database.
 * @param {string} coll - The name of the MongoDB collection.
 * @param {object} query - The query used to filter the data.
 * @param {number} page - The page number of the data to retrieve.
 * @param {number} docsPerPage - The number of documents to retrieve per page.
 * @return {Promise<Array>} An array of documents matching the query.
 */
async function getPageData(db, coll, query, page, docsPerPage) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    var res = []
    const collection = client.db(db).collection(coll)
    var cursor = collection.aggregate([
      {
        $match: query
      },
      {
        $sort: {_id: -1}
      },
      {
        $skip: docsPerPage * (page-1) //skip the pages already seen
      },
      {
        $limit: docsPerPage
      }
    ])
    for await (var x of cursor) { 
      res.push(x)
    }
    return res
  } catch(e) {
    console.log(e);
    return e
  } finally {
    await client.close();
  }
}

/**
 * Retrieves a page of data from a MongoDB collection based on the specified query.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {object} query - The query used to filter the data.
 * @param {number} page - The page number to retrieve.
 * @param {number} docsPerPage - The number of documents per page.
 * @return {object} - An object containing the retrieved data and the total number of documents matching the query.
 */
async function newGetPageData(db, coll, query, page, docsPerPage) {
  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var out = {
      res: [],
      totalNotes: await collection.countDocuments(query)
    }
    var cursor = collection.aggregate([
      {
        $match: query
      },
      {
        $skip: docsPerPage * (page-1) //skip the pages already seen
      },
      {
        $sort: {_id: -1}
      },
      {
        $limit: docsPerPage
      }
    ])
    for await (var x of cursor) { 
      out.res.push(x)
    }
    return out
  } catch(e) {
    console.log(e);
    return e
  } finally {
    await client.close();
  }
}
/**
 * Counts the number of documents in a given collection that match a specified query.
 *
 * @param {string} db - The name of the database.
 * @param {string} coll - The name of the collection.
 * @param {Object} query - The query used to filter the documents.
 * @return {number} The number of documents that match the query.
 */
async function countDocuments(db, coll, query) {

  const client = new MongoClient(uriConnect)
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var docs = await collection.countDocuments(query)
    return docs
  } catch(e) {
    console.log(e);
    return e
  } finally {
    await client.close();
  }

}

async function comparePasswords (password, username) {
  var loginInfo = await getDoc('users', 'loginInfo', {username: username})
  console.log(loginInfo)
  if(!loginInfo) return false
  if(loginInfo.isEncrypted) {
    loginInfo.password = encryption.decrypt(loginInfo.password)
  }
  console.log(loginInfo.password)
  if(loginInfo.password == password) return {
    specialRole: loginInfo.specialRole
  }
  return false
}
/**
 * Checks if any of the roles passed as an argument are allowed.
 *
 * @param {Array} roles - An array of roles to check.
 * @return {boolean} - Returns true if any of the roles are allowed, otherwise returns false.
 */
function isAllowed(roles) {
  for(var role of roles) {
    if(allowed.includes(role)) return true
  }
  return false
}
exports.isAllowed = isAllowed
exports.comparePasswords = comparePasswords
exports.countDocuments = countDocuments
exports.getPageData = getPageData
exports.newGetPageData = newGetPageData
exports.getDocs = getDocs
exports.updateDoc = updateDoc
exports.getSortedDB = getSortedDB
exports.deleteDoc = deleteDoc
exports.insert = insert
exports.getapi = getapi
exports.getDoc = getDoc
exports.modifyDoc = modifyDoc
exports.getDocsWithLimit = getDocsWithLimit
exports.upsertDoc = upsertDoc