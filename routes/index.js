var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
const db = require('../modules/db')
const canvas = require('../modules/canvas');
const { access } = require('fs');

async function getHomePageData(username) {
  try {
    var res = await db.getSortedDB('users', 'tasks', {dueDate: 1}, {username:username})
    
    var preferences = await db.getDocs('users', 'preferences', {username:username})
    var setting = preferences[0]
    var quote = await db.getapi('https://zenquotes.io/api/random')
    return {
      preferences:setting,
      todo:res,
      quote:quote[0]
    }
  } catch(e) {
    console.log(e)
  }
}
router.get('/home', function(req, res, next) {
  res.render('indexNotLoggedIn')
})
/*
ISSUE REPORTS
*/
router.post('/issue', async function(req, res, next) {
  await db.insert('users', 'issues', req.body)
  res.redirect('/home')
})
router.get('/', async function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/home')
    return
  }
  
  var username = req.session.user
  var val = await getHomePageData(username)
  var todo = val.todo
  const date = Date.now()
  var overdue = [], newTodo = []
  for(var i = 0; i < todo.length; i++) {
    var task = todo[i]
    const time = task.dueDate.getTime()
    task.dueDate = dates.formatDate(task.dueDate)
    if(time < date) overdue.push(task)
    else {
      if(dates.inRange(time, val.preferences ? val.preferences.recentDateRange : 5)) newTodo.push(task)
    }
  }
  
  const quote = val.quote.q
  const author = val.quote.a
  
  res.render('index', {
    recent:newTodo,
    overdue:overdue,
    quote: quote,
    author: author,
    user:username,
    reduceMovement: val.preferences ? val.preferences.reduceMovement : null
  })
})

  
router.get('/canvasIntegrationInfo', function(req, res, next) {
  res.send('Canvas assignments are taken using your canvas token. For security reasons, this app does not access your assignments and cannot mark them complete.')
})
/* PREFERENCES/SETTINGS */

router.get('/settings', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  db.getDocs('users', 'preferences', {username: req.session.user}).then(val => {
    const settings = val[0]
    
    res.render('settings', settings)
  })
})




router.post('/settings', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  const form = req.body
  var minDate = form.minDate, reduceMovement = form.reduceMovement == 'on' ? true : false
  db.updateDoc('users', 'preferences', {
    username: req.session.user
    }, {
    username: req.session.user,
    recentDateRange: minDate,
    reduceMovement: reduceMovement
  }).then((val) => {
    res.redirect('/')
  })
})


/*
LOGIN HANDLING
In app.js, there are new lines of code adding "express-session" to the app. The express-session should be unique for every single user.

*/

router.get('/login', function(req, res, next) {
  if(req.session.loggedin) {
    res.redirect('/')
  } else {
    res.render('login/login')
  }
})
router.post('/login', function(req, res, next) {
  const info = req.body;
  info.username.trim()
  info.password.trim()
  db.getDocs('users', 'loginInfo', {'username': info.username, 'password': info.password}).then((val) => {
    if(val.length == 0) {
      res.render('login/login', {msg: 'Wrong username or password', username: info.username, password: info.password})
    } else {
      req.session.loggedin = true
      req.session.user = info.username
      console.log(val, val[0].specialRole)
      req.session.specialRole = val[0].specialRole

      res.redirect('/') //success
    }
  })
})
router.get('/adduser', function(req, res, next) {

  console.log(req.query)
  res.render('login/adduser')
})
router.post('/googleAcc', async function(req, res, next) {
  var data = req.body
  var acc = db.getDoc('users', 'loginInfo', {email: req.body.email})
  //email already exists
  if(acc != null) return res.redirect('/adduser')

  //else return the user data
  var accesstoken = data['access_token']
  var prefix = 'https://openidconnect.googleapis.com/v1/userinfo?access_token='
  var link = prefix + accesstoken;
  var userData = await db.getapi(link)
  res.json(userData)
})

router.post('/adduser', function(req, res, next) {
  req.session = null //logout
  const info = req.body;
  info.username.trim()
  info.password.trim()
  const username = info.username, password = info.password;
  const doc = {username:username}
  db.getDocs('users', 'loginInfo', doc).then((val) => {
    if(val.length >= 1) res.render('login/adduser', {msg: 'User Already Exists', username: info.username, password: info.password})
    else {
      var defaultSettings = {
        username: username,
        reduceMovement: false,
        minDateRange: '5'
      }
      db.insert('users', 'loginInfo', {username:username, password: password, 
        email: info.email})
      db.insert('users', 'preferences', defaultSettings)
      db.insert('users', 'userdata', {
        username:username,
        realName: info.name
      })
      res.redirect('/')
    }
  })
})
/*
CHANGE PASSWORD
*/
router.get('/changePassword', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  res.render('changePassword')
})
router.post('/changePassword', async function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  var oldCreds = await db.getDoc('users', 'loginInfo', {username: req.session.user})
  var form = req.body    
  if(form.oldPassword != oldCreds.password) {
    res.render('changePassword', {msg: 'Old Password is wrong.'})
    return 
  } 
  await db.updateDoc('users', 'loginInfo', {username: req.session.user}, {password: form.newPassword})
  res.redirect('/logout')
  
})

router.get('/logout', function(req, res, next) {
  req.session.loggedin = false;
  req.session.user = null;
  res.redirect('/home')
})
module.exports = router;

