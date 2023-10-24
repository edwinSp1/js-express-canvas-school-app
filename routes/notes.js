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

/* NOTES */
router.get('/', function(req, res, next) {
  res.redirect('/notes/1')
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
    val = val ?? []
    res.render('newdoc', {link: `/notes/add`, categories: val.categories ?? []})
  })
}); 
const cheerio = require("cheerio")
const axios = require("axios")

async function performScraping(college) {
  // downloading the target web page
  // by performing an HTTP GET request in Axios
  //college may not be valid
  try {
    function dashCase(str) {
      return str.toLowerCase().replace(/\s+/g, '-')
    }
    var dashCased = dashCase(college)
    console.log('https://bigfuture.collegeboard.org/colleges/' + dashCased)
    const axiosResponse = await axios.request({
        method: "GET",
        url: "https://bigfuture.collegeboard.org/colleges/" + dashCased,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    })
    const $ = cheerio.load(axiosResponse.data)
    /*
      This took way too long to figure out.
    */
    var ele = $('.sc-6c2841e-2, .cfFoyV').toArray()[0]
    var desc = ele.children[0].data
    var infoEles = $('main div div div div div div .sc-a3223d0f-0 div div .cb-roboto-medium')
    var corresponding = ['', '% graduation rate', ' average per year after aid', ' SAT']
    var info = new Array(4)
    var i = 0
    for(var ele of infoEles) {
      info[i] = (ele ? ele.children[0].data : 'Unknown') + corresponding[i]
      i++
    }
    return {
      college: college,
      description: desc,
      stats: info
    }
  } catch (e) {
    return {
      college: college,
      description: "No description found.",
      stats: new Array(4)
    }
  }
}
router.get('/collegeDoc/add', function(req, res, next) {
  db.getDoc('users', 'userdata', {username:req.session.user}).then(async (val) => {
    val = val ?? []
    var collegeInfo = await performScraping(req.query.college)
    res.render('newCollegeDoc', {link: `/notes/add`, categories: val.categories ?? [], collegeInfo: collegeInfo})
  })
})

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
  userData = userData ?? []
  userData['categories']  = userData['categories'] ?? []
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
async function getHomePageData(username, pageNum, query, filters) {
  var finalQuery = {
    username: username, 
    $or: [{title: query}, {college: query}]
  }
  if(filters != 'invalid filters')
    finalQuery['category'] = {$in: filters}
  var docs = await db.newGetPageData('users', 'notes', finalQuery, pageNum, 10)
  //check if the userdata already exists
  var userData = await db.getDoc('users', 'userdata', {username:username})
  if(!userData) {
    var defaultData = {
      user: username,
      categories: []
    }
    userData = defaultData
    await db.insert('users', 'userdata', defaultData)
  }
  var categories = userData.categories ?? []
  categories.push('none') //include the default
  if(filters == 'invalid filters') {
    categories = categories.map((category) => {
      var res = {}
      res['category'] = category
      res['checked'] = true;
      return res
    })
  } else {
    categories = categories.map((category) => {
      var res = {}
      res['category'] = category
      if(filters.includes(category)) 
        res['checked'] = true;
      else 
        res['checked'] = false;

      return res
        
    })
  }
  var rawQuery = query.$regex.slice(0, query.$regex.length-2)
  
  return {
    docs: docs.res,
    categories: categories ?? [''],
    pageNum: pageNum,
    query: rawQuery,
    totalNotes: docs.totalNotes,
  }
}
router.get('/:pageNum', function(req, res, next) {
  //Why trycatch? Because query parameters are supplied by user. If req.query.filters is null, then the code will crash.
  try {
    var query = req.query.query ? req.query.query : ''; //req.query: link.com?helloworld=no => {helloworld: no}
    var regex = query+'.*'
    query = {
      $regex: regex,
      $options: 'i'
    }
    var filters;
    if(req.query.filters)
      filters = req.query.filters.split(',')
    else 
      filters = 'invalid filters'
    getHomePageData(req.session.user, req.params.pageNum, query, filters).then((val) => {
      res.render('notes', val)
    })
  } catch(e) {
    res.redirect('/notes/1')
  }
})
module.exports = router