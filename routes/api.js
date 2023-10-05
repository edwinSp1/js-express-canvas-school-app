var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
const canvas = require('../modules/canvas')
/* GET users listing. */
function auth (req, res, next) {
  if(!req.session.loggedin) {
      res.redirect('/login')
      return 
  }
  next()
}
router.use(auth)

router.get('/forumPosts', async function(req, res, next) {
  //sort in descending order by likes
  var posts = await db.getSortedDB('users', 'forumPosts', {likes:-1}, {})
  res.json(posts) 
});

router.get('/likeForumPost/:id', async function(req, res, next) {
  try {
    /*
     It could be liking a post or a comment
    */
    var orig = await db.getDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)})
    if(orig) {
      if(orig.likedBy.includes(req.session.user)) return
      await db.modifyDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)}, {
        $push: {'likedBy': req.session.user}
      })
    }
    var orig = await db.getDoc('users', 'comments', {_id: new ObjectId(req.params.id)})
    if(orig) {
      if(orig.likedBy.includes(req.session.user)) return
      await db.modifyDoc('users', 'comments', {_id: new ObjectId(req.params.id)}, {
        $push: {'likedBy': req.session.user}
      })
    }
  } catch(e) {
    console.log(e)
  }
})
router.get('/unlikeForumPost/:id', async function(req, res, next) {
  try {
    await db.modifyDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)}, {$pull: {'likedBy': req.session.user}})
    await db.modifyDoc('users', 'comments', {_id: new ObjectId(req.params.id)}, {$pull: {'likedBy': req.session.user}})
  } catch(e) {
    console.log(e)
  }
})
router.get('/posts/:id/getComments', async function(req, res, next) {
  try {
    var comments = await db.getDocs('users', 'comments', {postId: req.params.id})
    res.json(comments);
  } catch (e) {
    console.log(e)
  }
})
const prefix = 'https://lms.pps.net/api/v1/';
async function getAssignments(username) {
  try {
    const canvasKey = await canvas.getCanvasKey(username)
    var url = `${prefix}courses?access_token=${canvasKey}`
    var courses = await db.getapi(url)
    var courseIds = []
    for(var course of courses) {
      courseIds.push(course['id'])
    }
    var canvasAssignments = []
    for(var id of courseIds) {
      url = `${prefix}courses/${id}/assignments?access_token=${canvasKey}`
      var assignments = await db.getapi(url)
      for(var task of assignments) {
        var dueDate = new Date(task.due_at)
        if(dates.inRange(dueDate.getTime(), 15)) {
          if(task.has_submitted_submissions || task.submission_types.includes('none')) continue
          canvasAssignments.push({
            task: task.name,
            other: task.description,
            dueDate: dueDate,
            type: 'canvasAssignment'
          })
        }
      }
    }
    return canvasAssignments
  } catch(e) {
    return []
  }
}

router.get('/getCanvasAssignments', async function(req, res, next) {
  var overdue = [], newTodo = []
  try {
    var date = new Date()
    var canvasAssignments = await getAssignments(req.session.user)
    for(var task of canvasAssignments) {
      const time = task.dueDate.getTime()
      task.dueDate = dates.formatDate(task.dueDate)
      if(time < date) overdue.push(task)
      else newTodo.push(task)
    }
    res.json({
      overdue: overdue,
      todo: newTodo
    })
  } catch(e) {
    console.log(e)
    res.json([])
  }
})

module.exports = router;
