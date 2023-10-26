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
var allowed = ['Creator', 'Admin', 'Teacher']
router.get('/', async (req, res, next) => {
    res.render('infoIndex')
})
router.get('/trimet', async function(req, res, next) {
    res.render('trimet')
})
router.get('/trimet/settings', function(req, res, next) {
    res.render('trimetSettings')
})
router.post('/trimet/settings', async function(req, res, next) {
    var info = req.body
    info.includeAlerts = info.includeAlerts == 'on' ? true : false
    await db.updateDoc('users', 'preferences', {username: req.session.user}, info)
    res.redirect('/info/trimet')
})
router.get('/announcements', async function(req, res, next) {
    var announcements = await db.getDocsWithLimit('users', 'announcements', {}, 15)
    res.render('announcements', {announcements: announcements, role: req.session.specialRole})
})
router.get('/announcements/add', async function(req, res, next) {
    
    if(!allowed.includes(req.session.specialRole)) {
        res.send('Unauthorized: Must be creator, admin, or teacher')
        return
    }
    res.render('addAnnouncement')
})
router.post('/announcements/add', async function(req, res, next) {
    if(!allowed.includes(req.session.specialRole)) return res.send('Unauthorized')
    await db.insert('users', 'announcements', req.body)
    res.redirect('/info/announcements')
})
router.get('/announcements/delete/:id', async function(req, res, next) {
    if(!allowed.includes(req.session.specialRole)) return res.send('Unauthorized')
    await db.deleteDoc('users','announcements', req.params.id)
    res.redirect('/info/announcements')
})

router.get('/events', function(req, res, next) {
    res.render('events')
})

module.exports = router;