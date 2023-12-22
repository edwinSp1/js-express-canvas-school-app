var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
const db = require('../modules/db')
const canvas = require('../modules/canvas')
/*

router.get('/', async function(req, res, next) {
    var tutorials = await db.getDocs('users', 'tutorials', {})
    
    res.render("tutorials", {tutorials: tutorials})
})

*/
router.get('/create', async function(req, res, next) {
    res.render("createTutorial")
})
/*
router.post('/create', async function(req, res, next) {
    console.log('creating tutorial')
    console.log(req.body)
    var data = req.body;
    var markdown = data.markdown;
    var html = data.html;
    var title = data.title
    await db.insert('users', 'tutorials', {
        markdown: markdown,
        html: html,
        title: title
    })
    res.send('ok')
})
router.get('/:id', async function(req, res, next) {
    var tutorial = await db.getDoc('users', 'tutorials', {_id: req.params.id})
    res.render("tutorial", {tutorial: tutorial})
})
*/
module.exports = router;