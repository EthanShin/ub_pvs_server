var express = require('express');
var router = express.Router();

var PythonShell = require('python-shell');
var multer = require('multer');

var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '/var/www/html');
	},
	
	filename: function(req, file, cb) {
		if(file.originalname.substr(-3, file.originalname.length) == 'bin') {
			if(file.originalname.substr(0, 13) == 'MULTICUBE_AP_') {
				console.log('This is AP\'s firmware ' + file.originalname);
				file['type'] = 'ap';
				cb(null, file.originalname);
			} else {
				console.log('This is invalid firmware file');
			}
		}
	}
});

var upload = multer({storage: storage}).single('ap_firmware')

/* GET home page. */
router.get('/', function(req, res) {
    deviceProvider.find('device', JSON.parse('{"device":"ap"}'), function(error, docs) {
        res.render('ap', {
            title: 'PVS Server: AP',
            devices: docs
        });
    });
});

router.get('/setting', function(req, res, next) {
    deviceProvider.find('setPoint', JSON.parse('{"device":"ap"}'), function(error, device) {
        res.render('setting_ap', {
            title: 'PVS Server: Setting',
            device: device[0]
        });
    });
});

router.get('/:mac', function(req, res) {
    deviceProvider.findByMac('device', req.params.mac, function(error, device) {
        res.render('ap_field', {
            title: device.mac,
            device: device
        });
    });
});

router.post('/setting/upload', function(req, res, next) {
	upload(req, res, function(err) {
		if(err) {
			res.redirect('/ap/setting');
			return
		} else {
			deviceProvider.firmware_update(req.file.originalname, req.file.type);
		}
	});
	res.redirect('/ap/setting');
});

router.post('/setting/update', function(req, res, next) {
	deviceProvider.config_update({
		config: {
			op_mode: req.body.op_mode,
			ssid: req.body.ssid,
			password: req.body.password,
			hidden: req.body.hidden,
			mode: req.body.mode,
			bandwidth: req.body.bandwidth,
			channel: req.body.channel,
			power: req.body.power,
			pvs_period: req.body.pvs_period
		}
	}, 'ap', function(error, docs) {
		if(error) console.log(error);
	});
	res.redirect('/ap/setting');
});

router.post('/:mac/update', function(req, res) {
	deviceProvider.update(req.body._id, {
		mac: req.body.mac,
		fw: {
			fw_name: req.body.fw_name,
			fw_ver: req.body.fw_ver,
			fw_download_path: req.body.fw_download_path,
			fw_md5: req.body.fw_md5
		},
		config: {
			op_mode: req.body.op_mode,
			ssid: req.body.ssid,
			password: req.body.password,
			hidden: req.body.hidden,
			mode: req.body.mode,
			bandwidth: req.body.bandwidth,
			channel: req.body.channel,
			power: req.body.power,
			pvs_period: req.body.pvs_period
		}
	}, function(error, docs) {
		if(error) console.log(error);
	});

	var opt = {
		args: req.body.mac
	}
	PythonShell.run('public/python/submit_config.py', opt, function(error, results) {
		if(error) console.log(error);
			console.log(results);
	});
	res.redirect('/ap');
});

module.exports = router;
