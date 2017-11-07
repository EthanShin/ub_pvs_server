var express = require('express');
var router = express.Router();

var XLSX = require('xlsx');
var PythonShell = require('python-shell');

var multer = require('multer');

var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '/home/baruntech-pvs/dev/ub/server');
	},
	
	filename: function(req, file, cb) {
		if(file.originalname.substr(-4, file.originalname.length) == 'xlsx') {
			console.log('xlsxa');
			cb(null, file.originalname);
		} else {
			console.log('invalid file');
		}
	},
});

var upload = multer({storage: storage}).single("list_file");

/* GET home page. */
router.get('/', function(req, res, next) {
    deviceProvider.find('setPoint', JSON.parse('{}'), function(error, docs) {
        res.render('setting', {
            title: 'PVS Server: Basic Setting',
            versions: docs
        });
    });
});

router.post('/upload', function(req, res) {
	upload(req, res, function(error) {
		if(error) console.log(error);
		else {
			console.log('list file upload success!');
			var workbook = XLSX.readFile('../' + req.file.originalname);
    		var worksheet = workbook.Sheets[workbook.SheetNames[0]];

			var columnRouter = [];
			var columnAP = [];
		    for(let z in worksheet) {
				if(z.toString()[0] === 'G') {
					columnRouter.push(worksheet[z].v);
				} else if(z.toString()[0] === 'D') {
					columnAP.push(worksheet[z].v);
				}
			}
			columnRouter = columnRouter.slice(2, columnRouter.length);
			columnAP = columnAP.slice(1, columnAP.length);
			
			var opt = {
				args: [columnRouter, columnAP]
			}
			PythonShell.run('public/python/init_device.py', opt, function(error, results) {
				if(error) console.log(error);
				console.log(results);
			});
		}
	});
	res.redirect('/');
});

router.post('/drop', function(req, res) {
	deviceProvider.drop(function(error) {
		if(error) console.log(error);
	});
	res.redirect('/');
});

module.exports = router;
