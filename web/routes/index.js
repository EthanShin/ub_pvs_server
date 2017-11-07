var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	deviceProvider.find('device', JSON.parse('{"device":"router"}'), function(error, docs) {
        res.render('index', {
            title: 'PVS Server: Home',
            devices: docs
        });
    });
});

module.exports = router;
