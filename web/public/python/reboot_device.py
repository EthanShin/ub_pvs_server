import sys
sys.path.append('/usr/local/lib/python3.4/dist-packages')

import subprocess

# argument[1] is ap's mac address
mac = sys.argv[1]

server_address = subprocess.check_output('cat ../server_address', shell = True)[0:-1]

command = 'mosquitto_pub -h ' + server_address + ' -t PVS/server/reboot/' + mac + ' -m ""'
print(command)
subprocess.call(command, shell = True)
