var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
const canvas = require('../modules/canvas')
/* GET users listing. */
router.get('/forumPosts', async function(req, res, next) {
  //sort in descending order by likes
  var posts = await db.getSortedDB('users', 'forumPosts', {likes:-1}, {})
  res.json(posts)
});
router.get('/get/canvasAssignments')
router.get('/likeForumPost/:id', async function(req, res, next) {
  await db.modifyDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)}, {
    $inc: {'likes': 1}, 
    $push: {'likedBy': req.session.user}
  })

})

module.exports = router;
