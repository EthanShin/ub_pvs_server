var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var DeviceProvider = require('./public/javascripts/deviceProvider-mongodb').DeviceProvider;
 deviceProvider = new DeviceProvider('127.0.0.1', 27017);

var routes = require('./routes/index');
var router = require('./routes/router');
var ap = require('./routes/ap');
var setting = require('./routes/setting')

var app = express();

// set up handlebars view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', routes);
app.use('/router', router);
app.use('/ap', ap);
app.use('/setting', setting);

app.use(express.static('public'));

app.set('port', process.env.PORT || 15959);

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

