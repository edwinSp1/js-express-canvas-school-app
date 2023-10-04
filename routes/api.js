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
router.get('/get/canvasAssignments')

router.get('/likeForumPost/:id', async function(req, res, next) {
  try {
    var orig = await db.getDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)})
    if(orig.likedBy.includes(req.session.user)) return
    await db.modifyDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)}, {
      $push: {'likedBy': req.session.user}
    })
  } catch(e) {
    console.log(e)
  }
})
router.get('/unlikeForumPost/:id', async function(req, res, next) {
  try {
    console.log(req.session.user)
    await db.modifyDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)}, {$pull: {'likedBy': req.session.user}})
  } catch(e) {
    console.log(e)
  }
})

module.exports = router;
