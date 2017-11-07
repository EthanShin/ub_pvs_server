var Db = require('mongodb').Db;
var Connection = require ('mongodb').Connection ;
var Server = require ('mongodb').Server;
var BSON = require ('mongodb').BSON;
var ObjectID = require ('mongodb').ObjectID;

DeviceProvider = function (host, port) {
	this.db = new Db('UB', new Server(host, port, {auto_reconnect: true}), {safe:false});
	this.db.open(function(error) {
		if(!error) {
			console.log ("We are connected");
		} else {
			console.log (error);
		}
	});
}

DeviceProvider.prototype.getCollection= function(collections, callback) {
	this.db.collection(collections, function(error, device_collection) {
		if (error) callback(error);
		else callback(null, device_collection);
	});
};

DeviceProvider.prototype.find = function(collections, query, callback) {
	this.getCollection(collections, function(error, collection_results) {
		if(error) callback(error);
		else {
			collection_results.find(query).toArray(function(error, results) {
				if(error) callback(error);
				else callback(null, results);
			});
		}
	});
};

DeviceProvider.prototype.findAll = function (collections, callback) {
    this.getCollection(collections, function (error, device_collection) {
        if (error) callback(error);
        else {
            device_collection.find().toArray(function(error, results){
                if (error) callback(error);
                else callback(null, results);
			});
		}
	});
};

DeviceProvider.prototype.findByMac = function(collections, dev_mac, callback) {
	this.getCollection(collections, function (error, device_collection) {
		if(error) callback(error);
		else {
			device_collection.findOne({mac: dev_mac}, function(error, result) {
				if (error) callback (error);
				else callback(null, result);
			});
		}
	});
};


DeviceProvider.prototype.findById = function(collections, id, callback) {
	this.getCollection(collections, function (error, device_collection) {
		if(error) callback(error);
		else {
			device_collection.findOne({_id: ObjectID.createFromHexString(id)}, function(error, result) {
				if (error) callback (error);
				else callback(null, result);
			});
		}
	});
};

DeviceProvider.prototype.remove = function (deviceId, callback) {
	this.getCollection('device', function(error, device_collection) {
		if (error) callback (error);
		else {
			device_collection.remove({_id: ObjectID.createFromHexString(deviceId)}, function() {
				callback(null, deviceId);
			});
		}
	});
}

DeviceProvider.prototype.firmware_update = function(file_name, device_type, callback) {
	var query = '';
	var version = '';
	var md5 = '';
	var data = '';
	this.getCollection('setPoint', function(error, setPoint_collection) {
		// 펌웨어 구분(Router, AP)
		if(device_type == 'router') {
			query = {'device':'router'}
			version = file_name.slice(17, -4)
		} else if(device_type == 'ap') {
			query = {'device':'ap'}
			version = file_name.slice(13, -4)
		}
		console.log('function start!');

		
		var child_process = require('child_process').execSync;
		md5 = child_process('md5sum /var/www/html/' + file_name + ' | cut -f1 -d\' \'').toString().slice(0, -1);
		data = {'$set':{'fw.fw_ver':version, 'fw.fw_name':file_name, 'fw.fw_md5':md5}}
		console.log('%j, %j', query, data);
		

		setPoint_collection.update(query, data, function(error, defaultSetting) {
			if(error) console.log(error);
		});
	});
	this.getCollection('device', function(error, device_collection) {
		device_collection.updateMany(query, data, function(error, updateSetting) {
			if(error) console.log(error);
		});
	});
}

DeviceProvider.prototype.config_update = function(config, device_type, callback) {
	var query = ''
	var data = ''

	if(device_type == 'router') {
		query = {'device':'router'}
	} else if(device_type == 'ap') {
		query = {'device':'ap'}
	}

	config = config.config;
	data = {'$set':{config}}

	this.getCollection('device', function(error, device_collection) {
		device_collection.updateMany(query, data, function(error, updateSetting) {
			if(error) console.log(error);
		});
	});
	this.getCollection('setPoint', function(error, setPoint_collection) {
		setPoint_collection.update(query, data, function(error, defaultSetting) {
			if(error) console.log(error);
		});
	});
}

DeviceProvider.prototype.update = function (deviceId, devices, callback){
	this.getCollection('device', function(error, device_collection) {
		if (error) callback (error);
		else {
			if ( typeof (devices.length)== "undefined")
				devices = [devices];

			for (var i=0;i <devices.length;i++)
				device = devices[i];

			device_collection.update({
				_id: ObjectID.createFromHexString(deviceId)
			}, {"$set": device}, function (error, device){
				if (error ) callback(error);
				else callback (null , device);
			});
		}
	});
}

DeviceProvider.prototype.save = function (devices, callback) {
	this.getCollection('device', function (error, device_collection)  {
		if (error) callback (error);
		else {
			if(typeof (devices.length)== "undefined")
				devices = [devices];

			for (var i=0;i <devices.length;i++) {
				device = devices[i];
			}

			device_collection.insert(devices, function() {
				callback(null, devices);
			});
		}
	});
};

DeviceProvider.prototype.drop = function(callback) {
	this.getCollection('device', function(error, device_collection) {
		if(error) callback (error);
		else {
			device_collection.drop();
		}
	});
};

exports.DeviceProvider = DeviceProvider;
