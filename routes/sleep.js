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

router.get('/', async function(req, res, next) {
  try {
    const sleepData = await db.getDocs('users', 'sleep', {username: req.session.user})
    const userData = await db.getDoc('users', 'userdata', {username:req.session.user})
    const schedule = userData.schedule ? userData.schedule : ['9:30PM', '7:00AM'] //default
    
    res.render('sleep', {sleepData:sleepData.reverse(), schedule:schedule})
  } catch(e) {
    db.insert('users', 'userdata', {username: req.session.username})
    res.render('sleep', {sleepData:[], schedule:['9:30PM', '7:30AM']})
  }
})
function handleUserDate(doc, username) {
  doc.sleepMin = doc.sleepMin == '0' ? '00' : doc.sleepMin
  doc.wakeMin = doc.wakeMin == '0' ? '00' : doc.wakeMin
  return {
    sleepTime:`${doc.sleepHr}:${doc.sleepMin}${doc.sleepAmPm}`,
    wakeTime: `${doc.wakeHr}:${doc.wakeMin}${doc.wakeAmPm}`,
    username: username,
    date: dates.formatDateNoHour(new Date()),
    sleepNote: doc.sleepNote,
    breakDay: doc.breakDay== 'on' ? true : false
  }
}
router.get('/add', function(req, res, next) {
  
  res.render('addSleep')
})
router.post('/add', async function(req, res, next) {

  var doc = req.body
  var newDoc = handleUserDate(doc, req.session.user)
  var result = await db.insert('users', 'sleep', newDoc)
  res.redirect('/sleep')
})

router.get('/schedule/modify', function(req, res, next) {
  res.render('modifySleepSchedule')
})

router.post('/schedule/modify', async function(req, res, next) {
  var doc = req.body
  doc['username'] = req.session.user
  doc['schedule'] = [`${doc.sleepHr}:${doc.sleepMin}${doc.sleepAmPm}`,`${doc.wakeHr}:${doc.wakeMin}${doc.wakeAmPm}`]
  doc['wakeTime'] = `${doc.wakeHr}:${doc.wakeMin}${doc.wakeAmPm}`,
  await db.upsertDoc('users', 'userdata',{username:req.session.user}, doc)
  res.redirect('/sleep')
})
module.exports = router;