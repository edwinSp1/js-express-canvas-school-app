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
const trimetApiKey = '22B3586E4A6A299799C354A58'
async function getStopsNear(location, radius) {
    var prefix = 'https://developer.trimet.org/ws/V1/stops?json=true&appid='+trimetApiKey
    var link = `${prefix}&ll=${location}&meters=${radius}`
    var res = await db.getapi(link)
    return res
}
router.get('/stopsnear', async function(req, res, next) {
  try {
    var info = req.query
    var response = await getStopsNear(info.location, info.radius)
    var stops = response.resultSet.location
    if(!stops) {
      res.json('no stops found')
      return
    }
    var result = []
    for(var i = 0; i < stops.length; i += 10) {
      var endIdx = i + 10 < stops.length ? i + 10 : stops.length
      var locIds = stops.slice(i, endIdx).map((location) => location.locid).join(',') //trimet api lets you query 10 at a time
      var stopTimes = await db.getapi(`https://developer.trimet.org/ws/v2/arrivals?appid=22B3586E4A6A299799C354A58&json=true&locIDs=${locIds}&showPosition=true`)
      result.push(stopTimes.resultSet)
    }
    res.json(result)
  } catch(e) {
    res.json('error')
  }

})
router.get('/forumPosts/:pageNum/', async function(req, res, next) {
  //sort in descending order by likes
  var query = req.query.query ? req.query.query : ''; //req.query: link.com?helloworld=no => {helloworld: no}
  var regex = query+'.*'
  var regexQuery = {
    $regex: regex,
    $options: 'i'
  }
  /*
    @db: String: database
    @collection: String: collection
    @query: Object: keyvalue pairs
    @pageNum: Number: page currently on
    @docsPerPage: Number: documents per page 
  */
  var posts = await db.getPageData('users', 'forumPosts', {
    title: regexQuery
  }, req.params.pageNum, 10)

  res.json(posts) 
});

router.get('/forumPosts/query/:query', async function(req, res, next) {
  var query = req.params.query;
  var regex = query+'.*'
  var regQuery = {$regex:regex, $options:'i'}
  var posts = await db.getDocsWithLimit('users', 'forumPosts', {title: regQuery}, 10)
  res.json(posts)
})

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
/*
CANVAS ASYNC LOADING
*/
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
router.get('/canvas/getRecent', async function(req, res, next) {
  var recent = await getMessages(req.session.user)
  res.json(recent)
})
router.get('/canvas/getUserInfo', async function(req, res, next){
  var data = await getCanvasData(req.session.user)
  res.json(data)
})
router.get('/canvas/getLogins', async function(req, res, next) {
  var logins = await getLogins(req.session.user)
  res.json(logins)
})
module.exports = router;
