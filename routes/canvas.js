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

const prefix = 'https://lms.pps.net/api/v1/';
async function getMessages() {
  const canvasKey = '8909~7aaxClQkMQ03UVzssR8uHrOkyO8O9CLOpGoZ0aL7QXWvFJ0mXXgYx11dmt06fWlg'
  
  var stream = []
  var url = `${prefix}users/self/activity_stream?access_token=${canvasKey}`
  var messages = await db.getapi(url)
  for(var message of messages) {
    //console.log(message)
    var text = message.message
    if (message.type == 'Message') {
      //console.log('MMESSAGE')
      text = text.split('Click here to view the assignment:')[0].trim()
      // console.log(text)
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
}
async function getCanvasData () {
  var url = 'https://lms.pps.net/api/v1/users/self?access_token=8909~7aaxClQkMQ03UVzssR8uHrOkyO8O9CLOpGoZ0aL7QXWvFJ0mXXgYx11dmt06fWlg'
  var data = await db.getapi(url)
  return {
    
  }
}
router.get('/', async (req, res, next) => {
  var messages = await getMessages()
  res.render('canvasindex', {messages: messages})
})

module.exports = router;