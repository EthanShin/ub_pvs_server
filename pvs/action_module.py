# action_module.py

import json
import time

import mongo_module as db

def recode_time():
    now = time.localtime()
    current_time = "%04d-%02d-%02d %02d:%02d:%02d" % (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour, now.tm_min, now.tm_sec)

    return current_time


def firmware_function(mac_address, msg):
    print('action_module.py firmware_function()')

    ret = db.device_collection.find_one({'mac':mac_address}, {'fw':1, '_id':0, 'device':1, 'host':1})
    if(ret):
        if(ret['device'] == 'ap'):
            if(ret['host'] == '0'):
                print('host = None')
                return 0

            host = db.device_collection.find_one({'mac':ret['host']}, {'lastest':1})
            if(host['lastest'] == '0'):
                print('lastest = 0')
                return 0

        print(ret['fw'])
        return json.dumps(ret['fw'])
    return 0



def config_function(mac_address, msg):
    print('action_module.py config_function()')

    ret = db.device_collection.find_one({'mac':mac_address}, {'config':1, '_id':0, 'lastest':1})
    if(ret):
        if(ret['lastest'] == 1):
            print(ret['config'])
            return json.dumps(ret['config'])
    return 0



def log_function(mac_address, msg):
	print('action_module.py log_function()\n' + msg.payload.decode('utf-8'))

	ret = db.device_collection.find_one({'mac':mac_address}, {'_id':0, 'fw.fw_ver':1, 'host':1})
	if ret is None :
		return 0

	data = json.loads(msg.payload.decode('utf-8'))
	db.device_collection.update({'mac':mac_address}, {'$set':{'last_log':data}})
	data['log'] = recode_time()
	db.log_collection.insert_one(data.copy())

	if data['fw_ver'] == ret['fw']['fw_ver']:
		data['lastest'] = 1
	else:
		data['lastest'] = 0

	if 'wan_ip' in data :
		db.device_collection.update({'mac':mac_address}, {'$set':{'log':data['log'], 'lastest':data['lastest'], 'wan_ip':data['wan_ip']}})
	else :
		db.device_collection.update({'mac':mac_address}, {'$set':{'log':data['log'], 'lastest':data['lastest']}})
		if 'host' in ret:
			for number in range(0, 5) :
				command = "ap." + str(number) + ".mac"
				find_host = db.device_collection.find_one({'mac':ret['host'], command:mac_address})
				if find_host is not None :
					command = "ap." + str(number) + ".ssid"
					print(command)
					db.device_collection.update({'mac':ret['host']}, {'$set':{command:data['ssid']}})
					break
	


def ping_function(mac_address, msg):
	print('action_module.py ping_function()')
	
	data = json.loads(msg.payload.decode('utf-8'))
	data['log'] = recode_time()
	db.ping_collection.insert_one(data.copy())



def set_function(mac_address, msg):
    print('action_module.py set_function()')

    print(msg.payload.decode('utf-8'))
    ret = db.device_collection.find_one({'mac':mac_address}, {'_id':1})
    if ret is None :
        return 0
    
    data = json.loads(msg.payload.decode('utf-8'))
    for i in range(0, 5):
        if str(i) not in data['ap']:
            data['ap'][str(i)] = 'None'
        else:
            db.device_collection.update({'mac':data['ap'][str(i)]}, {'$set':{'host':mac_address}})
            ssid = db.device_collection.find_one({'mac':data['ap'][str(i)]}, {'_id':0, 'config.ssid':1})
            ap = {
                'mac': data['ap'][str(i)],
                'ssid': ssid['config']['ssid']
            }
            data['ap'][str(i)] = ap

    data['log'] = recode_time()
    print("data = ")
    print(data)
    db.device_collection.update({'mac':mac_address}, {'$set':data.copy()})

def router_config_function(mac_address, msg):
	print('action_module.py router_config_function()')
	print(msg.payload.decode('utf-8'))
	data = json.loads(msg.payload.decode('utf-8'))
	
	db.device_collection.update({'mac':mac_address}, {'$set':{'config.ssid':data['ssid'], 'config.password':data['password'], 'config.mode':data['mode'], 'config.channel':data['channel'], 'config.bandwidth':data['bandwidth'], 'config.power':data['power'], 'config.hidden':data['hidden']}})
