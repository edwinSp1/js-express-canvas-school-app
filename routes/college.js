var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
const unis = require('../modules/colleges').allUnis

function auth(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  next()
}

router.use(auth)


router.get('/', async function(req, res, next) {
  var collegeList = await db.getDocs('users', 'colleges', {username:req.session.user})
  res.render('collegePage', {collegeList: collegeList})
})
router.get('/delete/:id', async function(req, res, next) {
  await db.deleteDoc('users', 'colleges', req.params.id)
  res.redirect('/college')
})
router.get('/add', function (req, res, next) {
  res.render('addCollege')
})
router.post('/add', async function(req, res, next) {
  var form = req.body
  form['username'] = req.session.user
  await db.insert('users', 'colleges', form)
  res.redirect('/college')
})
module.exports = router;