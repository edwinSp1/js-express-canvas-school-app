var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
const canvas = require('../modules/canvas')
/* GET users listing. */
router.get('/forumPosts', async function(req, res, next) {
  var posts = await db.getDocs('users', 'forumPosts', {})
  res.json(posts)
});

module.exports = router;
