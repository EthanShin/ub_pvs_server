import sys
sys.path.append('/usr/local/lib/python3.4/dist-packages')

from pymongo import MongoClient
import json

# Init Variable
mongo_client = MongoClient()
db = mongo_client.UB

settingCollection = db.setPoint
deviceCollection = db.device

router_list = sys.argv[1].split(',')
ap_list = sys.argv[2].split(',');


'''
Router Registration
'''
# Load Router's MAC address

# Load Router's Default setting values
setting = settingCollection.find_one({'device': 'router'}, {'_id': 0})

# Insert MongoDB
for x in router_list:
	if deviceCollection.find_one({'mac': x, 'device': 'router'}) == None:
		setting.update({'mac': x})
		deviceCollection.insert_one(setting.copy())



'''
AP Registration
'''
# Load AP's MAC address

# Load AP's Default setting values
setting = settingCollection.find_one({'device': 'ap'}, {'_id': 0})

# Insert MongoDB
for x in ap_list:
	if deviceCollection.find_one({'mac': x, 'device': 'ap'}) == None:
		setting.update({'mac': x})
		deviceCollection.insert_one(setting.copy())
