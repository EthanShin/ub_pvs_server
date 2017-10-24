# mongo_module.py

from pymongo import MongoClient

mongo_client = MongoClient()
db = mongo_client.UB

setpoint_collection = db.setPoint
device_collection = db.device
log_collection = db.log2
ping_collection = db.ping2
