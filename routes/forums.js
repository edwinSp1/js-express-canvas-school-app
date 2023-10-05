var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
const canvas = require('../modules/canvas');

function auth (req, res, next) {
    if(!req.session.loggedin) {
        res.redirect('/login')
        return 
    }
    next()
}
router.use(auth)

router.get('/', function(req, res, next) {
    res.render('forums', {user: req.session.user})
})
router.get('/posts/:id', async function(req, res, next) {
    try {
        var post = await db.getDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)})
        res.render('forumPost', {post: post, user: req.session.user})
    } catch(e) {
        res.send('malformed request')
    }
})
router.get('/createPost', function(req, res, next) {
    res.render('createForumPost')
})
router.post('/createPost', async function(req, res, next) {
    const form = req.body
    form['user'] = req.session.user
    form['likedBy'] = []
    await db.insert('users', 'forumPosts', form)
    res.redirect('/forums')
})
router.get('/posts/:id/comment', function(req, res, next) {
    res.render('comment', {
        postId: req.params.id
    })
}) 
router.post('/posts/:id/comment', async function(req, res, next) {
    var form = req.body
    form['user'] = req.session.user
    form['postId'] = req.params.id
    form['likedBy'] = []
    await db.insert('users', 'comments', form)
    res.redirect('/forums/posts/' + req.params.id)
})
module.exports = router