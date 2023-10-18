var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
const canvas = require('../modules/canvas')

function auth(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  next()
}

router.use(auth)

router.get('/', async (req, res, next) => { 

  res.render('canvasindex')
})
router.get('/add', async (req, res, next) => {
  res.render('addCanvasKey')
})
router.post('/add', async function(req, res, next) {
  await db.updateDoc('users', 'userdata', {username: req.session.user}, {canvasKey: canvas.encryptKey(req.body.canvasKey)})
  res.redirect('/canvas')
})

module.exports = router;