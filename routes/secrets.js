var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
    res.send('hi')
})
router.get('/gE', async function(req, res, next) {
    res.render('gradeEstimator.pug')
})

module.exports = router