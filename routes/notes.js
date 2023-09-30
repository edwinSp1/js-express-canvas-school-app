var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
function auth(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  next()
}

router.use(auth)
async function getHomePageData(username) {
  var docs = await db.getDocs('users', 'notes', {username: username})
  var userData = await db.getDoc('users', 'userdata', {username:username})
  if(!userData) {
    var defaultData = {
      user: username,
      categories: []
    }
    userData = defaultData
    await db.insert('users', 'userdata', defaultData)
  }
  var categories = userData.categories
  return {
    docs: docs,
    categories: categories
  }
}
/* NOTES */
router.get('/', function(req, res, next) {
  getHomePageData(req.session.user).then((val) => {
    res.render('notes', val)
  })
});
async function getDocData(id, username) {
  var doc = await db.getDoc('users', 'notes', {_id: new ObjectId(id)})
  if(!doc) return null
  var userData = await db.getDoc('users', 'userdata', {username:username})
  if(!userData) {
    var defaultData = {
      username: username,
      categories: []
    }
    userData = defaultData
    await db.insert('users', 'userdata', defaultData)
  }
  var categories = userData.categories
  return {
    prev:doc,
    categories: categories
  }
}
router.get('/docs/:id', async function(req, res, next) {
  var id = req.params.id;

  
  const doc = await getDocData(id, req.session.user)
  res.render('updateDoc', doc)
})

router.post('/docs/:id', function(req, res, next) {

  const doc = req.body
  doc.metadata = JSON.parse(doc.metadata)
  const id = req.params.id
  db.updateDoc('users', 'notes', {_id: new ObjectId(id)}, doc).then((val) => {
    res.redirect('/notes')
  }) 
})
router.get('/docs/delete/:id', function(req, res, next) {

  const id = req.params.id
  db.deleteDoc('users', 'notes', id).then((val) => {
    res.redirect('/notes')
  })
}) 
router.get('/add', function(req, res, next) {

  db.getDoc('users', 'userdata', {username:req.session.user}).then((val) => {
    res.render('newdoc', {link: `/notes/add`, categories: val.categories})
  })
}); 

router.post('/add', function(req, res, next) {

  const doc = req.body
  doc['username'] = req.session.user
  doc.metadata = JSON.parse(doc.metadata)
  db.insert('users', 'notes', doc).then((val) => {
    res.redirect('/notes')
  })
})
router.get('/categories', async function(req, res, next) {

  var userData = await db.getDoc('users', 'userdata', {username: req.session.user})
  console.log(userData)
  res.render('manageCategories', {userData: userData})
})

router.get('/categories/add', function(req, res, next) {

  res.render('addCategory')
})

router.post('/categories/add', async function(req, res, next) {

  await db.modifyDoc('users', 'userdata', {username: req.session.user}, {$push: {categories: req.body.category}})
  res.redirect('/notes/categories')
})


router.get('/categories/delete/:category', async function(req, res, next) {

  await db.modifyDoc('users', 'userdata', {username:req.session.user}, {$pull: {categories: req.params.category}})
  res.redirect('/notes/categories')
})
module.exports = router