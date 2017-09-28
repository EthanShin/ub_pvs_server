# main.py

import paho.mqtt.client as mqtt
import sys

import topic_module as topic
import action_module as action

mqtt_broker = 'www.baruntechpvs.com'

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))

    for sub in topic.subscribe_topics:
        client.subscribe(sub)

def on_message(client, userdata, msg):
    print('=======================================================')
    print(msg.topic + " " + str(msg.payload.decode('utf-8')))
    mac_address = msg.topic.split('/')[-1].upper().replace(':', '')

    if msg.topic.startswith(topic.sub_firmware):
        ret = action.firmware_function(mac_address, msg)
        client.publish(topic.pub_firmware + mac_address, ret)

    elif msg.topic.startswith(topic.sub_config):
        ret = action.config_function(mac_address, msg)
        client.publish(topic.pub_config + mac_address, ret)

    elif msg.topic.startswith(topic.sub_log):
        ret = action.log_function(mac_address, msg)

    elif msg.topic.startswith(topic.sub_ping):
        action.ping_function(mac_address, msg)

    elif msg.topic.startswith(topic.sub_set):
        action.set_function(mac_address, msg)


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(mqtt_broker, 1883, 60)

client.loop_forever()
