var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
const db = require('../modules/db')

async function getHomePageData(username) {
  var activity = await db.getapi('https://www.boredapi.com/api/activity')
  var tasks = await db.getDocs('users', 'tasks', { username: username })

  var favActivities = await db.getDocs('users', 'activities', { username: username })
  var overdue = []
  var today = Date.now()
  for (var task of tasks) {
    if (task.dueDate < today) {
      overdue.push(task)
    }
    task.dueDate = dates.formatDate(task.dueDate)
  }
  return {
    overdue: overdue,
    activity: activity.activity,
    favActivities: favActivities
  }
}
/* WELLNESS */
router.get('/', function(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  getHomePageData(req.session.user).then((val) => {
    res.render('wellness', val)
  })
});
router.get('/activity/add', function(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  res.render('addactivity')
})

router.post('/activity/add', function(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  const username = req.session.user
  db.insert('users', 'activities', {
    username: username,
    activity: req.body.activity
  }).then((val) => {
    res.redirect('/wellness')
  })
})

router.get('/delete/:id', function(req, res, next) {

  if (!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  db.deleteDoc('users', 'activities', req.params.id).then((val) => {
    res.redirect('/wellness')
  })
})
module.exports = router