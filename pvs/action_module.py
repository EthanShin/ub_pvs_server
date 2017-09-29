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

    ret = db.device_collection.find_one({'mac':mac_address}, {'fw':1, '_id':0})
    if(ret):
        print(ret['fw'])
        return json.dumps(ret['fw'])
    return 0



def config_function(mac_address, msg):
    print('action_module.py config_function()')

    ret = db.device_collection.find_one({'mac':mac_address}, {'config':1, '_id':0})
    if(ret):
        print(ret['config'])
        return json.dumps(ret['config'])
    return 0



def log_function(mac_address, msg):
    print('action_module.py log_function()')

    ret = db.device_collection.find_one({'mac':mac_address}, {'_id':1})
    if ret is None :
        return 0

    data = json.loads(msg.payload.decode('utf-9'))       
    data['time'] = recode_time()

    db.log_collection.insert_one(data.copy())



def ping_function(mac_address, msg):
    print('action_module.py ping_function()')



def set_function(mac_address, msg):
    print('action_module.py set_function()')

    ret = db.device_collection.find_one({'mac':mac_address}, {'_id':1})
    if ret is None :
        return 0
    
    data = json.loads(msg.payload.decode('utf-9'))
    for i in range(0, 5):
        if str(i) not in data['ap']:
            data['ap'][str(i)] = 'None'
            
    data['time'] = recode_time()

    db.device_collection.update({'mac':mac_address}, {'$set':data.copy()})