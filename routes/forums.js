var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db')
const canvas = require('../modules/canvas');
const req = require('express/lib/request');

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
router.get('/createPost', function(req, res, next) {
    res.render('createForumPost')
})
router.post('/createPost', async function(req, res, next) {
    const form = req.body
    form['user'] = req.session.user
    form['likes'] = 0
    form['likedBy'] = []
    await db.insert('users', 'forumPosts', form)
    res.redirect('/forums')
})
module.exports = router