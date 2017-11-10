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
			if (file.originalname.substr(0, 17) == 'MULTICUBE_ROUTER_') {
				console.log('This is Router\'s firmware ' + file.originalname);
				file['type'] = 'router';
				cb(null, file.originalname);
			} else {
				console.log('This is invalid firmware file');
			}
		}
	}
});

var upload = multer({storage: storage}).single('router_firmware')

/* GET home page. */
router.get('/', function(req, res) {
    deviceProvider.find('device', JSON.parse('{"device": "router"}'), function(error, docs) {
        res.render('router', {
            title: 'PVS Server: Router',
            devices: docs,
			time: Date.now()
        });
    });
});

router.get('/setting', function(req, res, next) {
    deviceProvider.find('setPoint', JSON.parse('{"device":"router"}'), function(error, device) {
        res.render('setting_router', {
            title: 'PVS Server: Setting',
            device: device[0]
        });
    });
});

router.get('/:mac', function(req, res) {
    deviceProvider.findByMac('device', req.params.mac, function(error, device) {
        res.render('router_field', {
            title: device.mac,
            device: device
        });
    });
});

router.post('/setting/upload', function(req, res, next) {
	upload(req, res, function(err) {
		if(err) {
			res.redirect('/router/setting');
			return
		} else {
			deviceProvider.firmware_update(req.file.originalname, req.file.type);
		}
	});
	res.redirect('/router/setting');
});

router.post('/setting/update', function(req, res, next) {
	deviceProvider.config_update({
		config: {
			op_mode: req.body.op_mode,
			ip_addr: req.body.ip_addr,
			dhcp_client_start: req.body.dhcp_client_start,
			dhcp_client_end: req.body.dhcp_client_end,
			pvs_period: req.body.pvs_period
		}
	}, 'router', function(error, docs) {
		if(error) console.log(error);
	});
	res.redirect('/router/setting');
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
			config_ver: req.body.config_ver,
			op_mode: req.body.op_mode,
			ip_addr: req.body.ip_addr,
			dhcp_client_start: req.body.dhcp_client_start,
			dhcp_client_end: req.body.dhcp_client_end,
			pvs_period: req.body.pvs_period
		}
	}, function(error, docs) {
		if(error) console.log(error);
	});
	res.redirect('/router');
});

router.post('/:mac/reboot', function(req, res) {
	var opt = {
        args: req.body.mac
    }
    PythonShell.run('public/python/reboot_device.py', opt, function(error, results) {
        if(error) console.log(error);
            console.log(results);
    });
	res.redirect('/router');
});

module.exports = router;
