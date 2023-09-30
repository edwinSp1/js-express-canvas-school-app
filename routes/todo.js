var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
const db = require('../modules/db')
var ObjectId = require('mongodb').ObjectId;
function auth(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  next()
}
router.use(auth)
/* todo part */
router.get('/', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  const user = req.session.user;
  db.getSortedDB('users', 'tasks', {priority:-1, dueDate: 1}, {username:user}).then((val) => {
    for(const task of val) {
     task.dueDate = dates.formatDate(task.dueDate);
    }
    res.render('todo', {tasks: val})
  })
});

router.get('/add', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  
  res.render('addtask')
});
router.post('/add', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  const form = req.body
  var doc = {
    username:req.session.user,
    task:form.task,
    other:form.other,
    priority:form.priority == 'on' ? 1 : 0,
    dueDate:new Date(form.date)
  }
  db.insert('users', 'tasks', doc).then((val) => res.redirect('/todo'))
});

router.get('/remove/:id', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  try {
    db.deleteDoc('users', 'tasks', req.params.id).then((val) => 
    res.redirect('/todo'))
  } catch(e) {
    res.redirect('/todo') //avoid fatal errors keeping user stuck
  }
})

router.get('/update/:id', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  db.getDoc('users', 'tasks', {_id: new ObjectId(req.params.id)}).then((val) => {
    res.render('updatetask', {
      id: req.params.id,
      prev: val
    })
  })
})

router.post('/update/:id', function(req, res, next) {
  if(!req.session.loggedin) {
    res.redirect('/login')
    return
  }
  const id = req.params.id
  var form = req.body
  var update = {
    username:req.session.user,
    task:form.task,
    other:form.other,
    priority:form.priority == 'on' ? 1 : 0,
    dueDate:new Date(form.date)
  }
  db.updateDoc('users', 'tasks', {_id: new ObjectId(id)}, update).then((val) => {
    res.redirect('/todo')
  })
})
module.exports = router