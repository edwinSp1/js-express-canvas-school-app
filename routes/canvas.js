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
const prefix = 'https://lms.pps.net/api/v1/';
async function getMessages(username) {
  try {
    var canvasKey = await canvas.getCanvasKey(username)
    
    var stream = [] 
    var url = `${prefix}users/self/activity_stream?access_token=${canvasKey}`
    var messages = await db.getapi(url)
    for(var message of messages) {
      var text = message.message
      if (message.type == 'Message') {
        text = text.split('Click here to view the assignment:')[0].trim()
      }
      if(message.notification_category == 'Grading Policies') {
        text = text.split('You can see details here:')[0].trim()
      }
      var res = {
        title: message.title, 
        message: text,
        type: message.type,
        date: dates.formatDate(new Date(message.created_at)),
        url: message.html_url
      }
      if(message.type=='Submission') {
        var max = message.assignment.points_possible
        res['grade'] = `${message.entered_grade}/${max}`
        res['course'] = message.course.name
      }
      stream.push(res)
    }
    return stream
  } catch (e) {
    return [{title: 'Not Seeing Anything? Link your canvas up.'}]
  }
}
async function getCanvasData (username) {
  try {
    var canvasKey = await canvas.getCanvasKey(username)
    var url = `${prefix}users/self?access_token=${canvasKey}`
    var data = await db.getapi(url)
    if(!data.avatar_url) return {
      img_url:'https://www.publicdomainpictures.net/pictures/40000/velka/question-mark.jpg',
      name: 'Not Set'
    }
    return {
      img_url: data.avatar_url,
      name: `${data.first_name} ${data.last_name}`
    }
  } catch (e) {
    return {}
  }
}
async function getLogins (username) {
  try {
    var canvasKey = await canvas.getCanvasKey(username)
    var url = `${prefix}audit/authentication/users/self?access_token=${canvasKey}`
    var data = await db.getapi(url)
    if(!data.events) return []
    return data.events
  } catch (e) {
    return []
  }
}
router.get('/', async (req, res, next) => {
  var messages = await getMessages(req.session.user)
  var profile = await getCanvasData(req.session.user)
  var logins = await getLogins(req.session.user)
  res.render('canvasindex', {messages: messages, profile:profile, logins: logins})
})
router.get('/add', async (req, res, next) => {
  res.render('addCanvasKey')
})
router.post('/add', async function(req, res, next) {
  await db.updateDoc('users', 'userdata', {username: req.session.user}, {canvasKey: canvas.encryptKey(req.body.canvasKey)})
  res.redirect('/canvas')
})

module.exports = router;