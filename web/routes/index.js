var express		= require('express');
var router		= express.Router();
var passport	= require('passport');

/* GET home page. */

router.get('/', function(req, res) {
	res.render('login');
});

router.post('/login', passport.authenticate('local', {
		failureRedirect : '/'
	}),
	function(req, res) {
		res.redirect('/home');
	}
);

router.get('/logout', function(req, res) {
	req.logout();
	req.redirect('/');
});

router.get('/home', ensureAuthenticated, function(req, res) {
	deviceProvider.find('device', JSON.parse('{"device":"router"}'), function(error, docs) {
        res.render('index', {
            title: 'PVS Server: Home',
            devices: docs
        });
    });
});

function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) { return next(); }
	res.redirect('/');
}

module.exports = router;
