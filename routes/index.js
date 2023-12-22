var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
const db = require('../modules/db')
const canvas = require('../modules/canvas');
const encryption = require('../modules/encrypt')

async function getHomePageData(username) {
  try {
    var data = await Promise.all([db.getSortedDB('users', 'tasks', {dueDate: 1}, {username:username}), 
                                db.getDocs('users', 'preferences', {username:username}),
                                db.getapi('https://zenquotes.io/api/random')])
    var res = data[0]
    var preferences = data[1]
    var setting = preferences[0]
    var quote = data[2]
    
    return {
      preferences:setting,
      todo:res,
      quote:quote[0]
    }
  } catch(e) {
    console.log(e)
  }
}
router.get('/home', async function(req, res, next) {
  var users = await db.countDocuments('users', 'loginInfo', {})
  res.render('indexNotLoggedIn', {users: users})
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
  if(!val) return res.send('something went wrong. please try again, and if the problem persists, contact me.')
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
  
  var quote = val.quote.q
  var author = val.quote.a
  //WE RAN OUT OF API REQUESTS USE THE RET QUOTE
  if(author == "zenquotes.io") {
    quote = "Teenagers these days waste their time trying to live their life according to how their friends will like it and not how they want to live it. Living it according to your friends won't make you money in the future. Live according to your own values."
    author = "Divyansh Gupta"
  }
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
    reduceMovement: reduceMovement,
    school: form.school,
    notificationTime: form.notificationTime
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
router.post('/login', async function(req, res, next) {
  const info = req.body;
  info.username.trim()
  info.password.trim()
  var result = await db.comparePasswords(info.password, info.username) 
  if(result == false) {
    res.render('login/login', {msg: 'Wrong username or password', username: info.username, password: info.password})
  } else {
    req.session.loggedin = true
    req.session.user = info.username
    req.session.specialRole = result.specialRole

    res.redirect('/') //success
  }
  
})
router.get('/adduser', function(req, res, next) {

  res.render('login/adduser')
})
router.post('/googleAcc', async function(req, res, next) {
  var data = req.body
  
  //else return the user data
  var accesstoken = data['access_token']
  var prefix = 'https://openidconnect.googleapis.com/v1/userinfo?access_token='
  var link = prefix + accesstoken;
  var userData = await db.getapi(link)
  var acc = await db.getDoc('users', 'loginInfo', {email: userData.email})
  //email already exists
  if(acc != null) return res.redirect('/adduser')
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
      var encryptedPassword = encryption.encrypt(password)
      db.insert('users', 'loginInfo', {username:username, password: encryptedPassword, 
        email: info.email, isEncrypted: true})
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
  if(db.comparePasswords(form.oldPassword, oldCreds.password) == false) {
    res.render('changePassword', {msg: 'Old Password is wrong.'})
    return 
  } 
  await db.updateDoc('users', 'loginInfo', {username: req.session.user}, {password: encryption.encrypt(form.newPassword), isEncrypted: true})
  res.redirect('/logout')
  
})

router.get('/logout', function(req, res, next) {
  req.session.loggedin = false;
  req.session.user = null;
  res.redirect('/home')
})

module.exports = router;
