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
const axios = require('axios');


async function checkBadWords(str) {
    const encodedParams = new URLSearchParams();
    encodedParams.set('content', str);
    encodedParams.set('censor-character', '*');

    const options = {
        method: 'POST',
        url: 'https://neutrinoapi-bad-word-filter.p.rapidapi.com/bad-word-filter',
        headers: {
            'content-type': 'application/x-www-form-urlencoded', 
            'X-RapidAPI-Key': 'd2d1d02457msh62eb20ab5040fe8p180b2bjsn8a42e0a56651',
            'X-RapidAPI-Host': 'neutrinoapi-bad-word-filter.p.rapidapi.com'
        },
        data: encodedParams,
    };
  try {
    const response = await axios.request(options);
    return response.data
  } catch (error) {
    console.error(error);
  }
}
router.get('/', function(req, res, next) {
    //default
    res.redirect('/forums/1')
})
router.get('/:page', function(req, res, next) {
    if(req.params.page < 1) {
        res.render('404')
        return
    }
    var query = req.query.query
    res.render('forums', {
        user: req.session.user, 
        specialRole: req.session.specialRole, 
        pageNum: req.params.page,
        query: query
    })
})
/*
Wrap ObjectIds in tryCatch because it throws error if it isn't a correct input(24byte char array)
*/
router.get('/posts/:id', async function(req, res, next) {
    try {
        var post = await db.getDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)})
        res.render('forumPost', {post: post, user: req.session.user, specialRole: req.session.specialRole})
    } catch(e) {
        res.send('malformed request')
    }
})
router.get('/posts/:id/delete', async function (req, res, next) {
    var canDelete = ['Creator', 'Admin']
    try {
        var role = req.session.specialRole
        if(!canDelete.includes(role)) {
            res.send('unauthorized')
            return
        }
        await db.deleteDoc('users', 'forumPosts', req.params.id)
        res.redirect('/forums')
    } catch (e) {
        res.send('malformed request')
    }
})
router.get('/createPost', function(req, res, next) {
    res.render('createForumPost')
})
router.post('/createPost', async function(req, res, next) {
    const form = req.body
    try {
        var titleRes = await checkBadWords(form.title)
        var contentRes = await checkBadWords(form.content)
        form['title'] = titleRes['censored-content']
        form['content'] = contentRes['censored-content']
        form['user'] = req.session.user
        form['specialRole'] = req.session.specialRole
        form['likedBy'] = []
        form['date'] = dates.formatDateNoHour(new Date())
        await db.insert('users', 'forumPosts', form)
        res.redirect('/forums')
    } catch(e) {
        console.error(e)
    }
})
router.get('/posts/:id/comment', async function(req, res, next) {
    var post = await db.getDoc('users', 'forumPosts', {_id: new ObjectId(req.params.id)})
    res.render('comment', {
        postId: req.params.id,
        content: post.content
    })
}) 
router.post('/posts/:id/comment', async function(req, res, next) {
    var form = req.body
    var contentRes = await checkBadWords(form.content)
    form['user'] = req.session.user
    form['postId'] = req.params.id
    form['specialRole'] = req.session.specialRole
    form['likedBy'] = []
    form['content'] = contentRes['censored-content']
    await db.insert('users', 'comments', form)
    res.redirect('/forums/posts/' + req.params.id)
})
router.get('/comment/:id/delete', async function(req, res, next) {
    var postID = req.query.postID
    var allowed = ['Admin', 'Creator']
    if(!allowed.includes(req.session.specialRole)) {
        res.send('unauthorized')
        return
    }
    await db.deleteDoc('users', 'comments', req.params.id)
    res.redirect('/forums/posts/' + postID)
})

module.exports = router