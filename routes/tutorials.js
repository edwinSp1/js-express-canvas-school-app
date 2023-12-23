var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
const db = require('../modules/db')
const canvas = require('../modules/canvas')
const ObjectId = require("mongodb").ObjectId

router.get('/', async function(req, res, next) {
    var tutorials = await db.getDocs('users', 'tutorials', {})
    tutorials = tutorials.map((tutorial) => {
        tutorial.date = dates.formatDate(tutorial._id.getTimestamp())
        tutorial.title = tutorial.title ? tutorial.title : 'Untitled'
        return tutorial;
    })
    res.render("tutorials", {tutorials: tutorials})
})


router.get('/create', async function(req, res, next) {
    res.render("createTutorial")
})

router.post('/create', async function(req, res, next) {
    var data = req.body;
    var markdown = data.markdown;
    var html = data.html;
    var title = data.title
    var user = req.session.user;
    await db.insert('users', 'tutorials', {
        markdown: markdown,
        html: html,
        title: title,
        user:user
    })
    res.send('ok')
})
router.get('/:id', async function(req, res, next) {
    var tutorial = await db.getDoc('users', 'tutorials', {_id: new ObjectId(req.params.id)})
    res.render("tutorial", {tutorial: tutorial})
})

module.exports = router;