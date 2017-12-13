var express			= require('express');
var path			= require('path');
var bodyParser		= require('body-parser');
var passport		= require('passport');
var localStrategy	= require('passport-local').Strategy;
var flash			= require('connect-flash')
var session			= require('express-session');

var DeviceProvider = require('./public/javascripts/deviceProvider-mongodb').DeviceProvider;
 deviceProvider = new DeviceProvider('127.0.0.1', 27017);

var routes = require('./routes/index');
var router = require('./routes/router');
var ap = require('./routes/ap');
var setting = require('./routes/setting')

var app = express();


app.use(session({
	secret: '!@#$%^&*()',
	saveUninitialized: false,
	resave: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new localStrategy({
		usernameField : 'userid',
		passwordField : 'password',
		passReqToCallback : true
	}, function(req, userid, password, done) {
		if(userid==='baruntech' && password==='barun3760') {
			var user = { 'userid': 'baruntech' };
			return done(null, user);
		} else {
			return done(null, false);
		}
	}
));

passport.serializeUser(function(user, done) {
	console.log(user);
	done(null, user.userid);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

app.use('/', routes);

app.use('/router', router);
app.use('/ap', ap);
app.use('/setting', setting);

app.use(express.static('public'));

app.set('port', process.env.PORT || 15959);

// set up handlebars view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if(app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);  
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') +
    '; press Ctrl-C to terminate.');
});
