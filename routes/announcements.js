var express = require('express');
var router = express.Router();
const dates = require('../modules/dates')
var ObjectId = require('mongodb').ObjectId;
const db = require('../modules/db');

function auth (req, res, next) {
    if(!req.session.loggedin) {
        res.redirect('/home')
        return
    }
    next()
}
router.use(auth)

router.get('/', async (req, res, next) => {
    res.render('announcements')
})
router.get('/create', function(req, res, next) {
    res.render('createAnnouncement')
})
module.exports = router;