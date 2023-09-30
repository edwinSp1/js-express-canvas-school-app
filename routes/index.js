var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
const db = require('../modules/db')

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
const prefix = 'https://lms.pps.net/api/v1/';
async function getAssignments() {
  const canvasKey = '8909~7aaxClQkMQ03UVzssR8uHrOkyO8O9CLOpGoZ0aL7QXWvFJ0mXXgYx11dmt06fWlg'
  var url = `${prefix}courses?access_token=${canvasKey}`
  var courses = await db.getapi(url)
  var courseIds = []
  for(var course of courses) {
    courseIds.push(course['id'])
  }
  var canvasAssignments = []
  for(var id of courseIds) {
    url = `${prefix}courses/${id}/assignments?access_token=${canvasKey}`
    console.log(url)
    var assignments = await db.getapi(url)
    for(var task of assignments) {
      var dueDate = new Date(task.due_at)
      if(dates.inRange(dueDate.getTime(), 15)) {
        if(task.has_submitted_submissions || task.submission_types.includes('none')) continue
        canvasAssignments.push({
          task: task.name,
          other: task.description,
          dueDate: dueDate
        })
      }
    }
  }
  return canvasAssignments
}

router.get('/', async function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  var username = req.session.user
  var val = await getHomePageData(username)
  console.log(val)
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
  var canvasAssignments = await getAssignments()
  for(var task of canvasAssignments) {
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
    console.log('new Login:' + JSON.stringify(val, null, 2))
    if(val.length == 0) {
      res.render('login/login', {msg: 'Wrong username or password'})
    } else {
      req.session.loggedin = true
      req.session.user = info.username
      res.redirect('/') //success
    }
  })
})
router.get('/adduser', function(req, res, next) {
  res.render('login/adduser')
})
router.post('/adduser', function(req, res, next) {
  const info = req.body;
  info.username.trim()
  info.password.trim()
  const username = info.username, password = info.password;
  const doc = {username:username}
  db.getDocs('users', 'loginInfo', doc).then((val) => {
    if(val.length == 1) res.render('login/adduser', {msg: 'User Already Exists'})
    else {
      var defaultSettings = {
        username: username,
        reduceMovement: false,
        minDateRange: '5'
      }
      db.insert('users', 'loginInfo', {username:username, password: password})
      db.insert('users', 'preferences', defaultSettings)
      res.redirect('/')
    }
  })
})
router.get('/logout', function(req, res, next) {
  req.session.loggedin = false;
  req.session.user = null;
  res.redirect('/login')
})
module.exports = router;
/*
// Online Java Compiler
// Use this editor to write, compile and run your Java code online
import java.util.Scanner;
class HelloWorld {
    public static void main(String[] args) {
        var scan = new Scanner(System.in);
        System.out.println("enter shape and params, seperated by commas");
        String string = scan.nextLine();
        String after = string.trim().replaceAll(" +", "");
        String[] data = after.split(",");
        String shape = data[0];
        System.out.println(shape);
        if(shape == "square") {
            int sideL = Integer.parseInt(data[1]);
            System.out.println("area: " + sideL * sideL);
        } else if(shape == "rect") {
            int w = Integer.parseInt(data[1]);
            int h = Integer.parseInt(data[2]);
            System.out.println("area: " + w*h);
        }
    }
}
*/
