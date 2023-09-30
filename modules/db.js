const {MongoClient} = require('mongodb')
var ObjectId = require('mongodb').ObjectId;
const uriConnect = 'mongodb+srv://admin:bedumble3@cluster0.dcug42s.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(uriConnect)
async function getapi(url) {
  const response = await fetch(url);
  var data = await response.json();
  return data
}
async function getDoc(db, coll, query) {
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.findOne(query)
    return res
  } catch (e) {
    console.log(e)
    return e
  } finally {
    await client.close();
  }
}
async function getDocs(db, coll, query) {
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
async function updateDoc(db, coll, query, update) {
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.updateOne(
      query, 
      {
        $set: update
      },
      {
        upsert: true
      }
    )
    return res
  } catch(e) {
    console.log(e)
  } finally {
    await client.close();
  }
}
async function modifyDoc(db, coll, query, update) {
  await client.connect();
  try {
    const collection = client.db(db).collection(coll)
    var res = await collection.updateOne(
      query, 
      update,
      {
        upsert: true
      }
    )
    return res
  } catch(e) {
    console.log(e)
  } finally {
    await client.close();
  }
}
async function getSortedDB (db, coll, sortFx, query) {
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
async function deleteDoc(db, coll, id) {
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
async function insert(db, coll, doc) {
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



exports.getDocs = getDocs
exports.updateDoc = updateDoc
exports.getSortedDB = getSortedDB
exports.deleteDoc = deleteDoc
exports.insert = insert
exports.getapi = getapi
exports.getDoc = getDoc
exports.modifyDoc = modifyDoc