import time
import json
import random
import paho.mqtt.client as mqtt
from datetime import datetime

# Configuration
MQTT_BROKER = "localhost"  # Or your cloud broker address
MQTT_PORT = 1883
DEVICE_ID = "gateway-rpi5-001"
BUILDING_ID = "building-paris-HQ"

# Topics
TOPIC_TELEMETRY = f"smartbuilding/{BUILDING_ID}/{DEVICE_ID}/telemetry"
TOPIC_COMMANDS = f"smartbuilding/{BUILDING_ID}/{DEVICE_ID}/commands"

# Simulated Sensors
sensors = {
    "temperature": 21.0,  # °C
    "presence": False,    # Boolean
    "hvac_status": "ON",  # ON/OFF
    "light_status": "OFF" # ON/OFF
}

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(TOPIC_COMMANDS)

def on_message(client, userdata, msg):
    print(f"Received command: {msg.topic} -> {msg.payload.decode()}")
    try:
        command = json.loads(msg.payload.decode())
        handle_command(command)
    except Exception as e:
        print(f"Error processing command: {e}")

def handle_command(command):
    global sensors
    cmd_type = command.get("type")
    value = command.get("value")
    
    if cmd_type == "SET_HVAC":
        sensors["hvac_status"] = value
        print(f"🔧 HVAC set to {value}")
    elif cmd_type == "SET_LIGHT":
        sensors["light_status"] = value
        print(f"💡 Light set to {value}")
    elif cmd_type == "SET_TEMP_SETPOINT":
        print(f"🌡️ Temperature setpoint changed to {value}°C")

def simulate_environment():
    global sensors
    # Simulate random fluctuation
    sensors["temperature"] += random.uniform(-0.1, 0.1)
    
    # Simulate daily cycle (simplified)
    hour = datetime.now().hour
    if 8 <= hour <= 19:
        sensors["presence"] = random.choice([True, True, False]) # Mostly present during day
    else:
        sensors["presence"] = False

    return sensors

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print(f"🚀 Gateway {DEVICE_ID} starting...")
# client.connect(MQTT_BROKER, MQTT_PORT, 60) # Uncomment when broker is ready

# Simulation Loop
try:
    # client.loop_start() # Uncomment when broker is ready
    while True:
        data = simulate_environment()
        payload = {
            "timestamp": datetime.now().isoformat(),
            "device_id": DEVICE_ID,
            "data": data
        }
        # client.publish(TOPIC_TELEMETRY, json.dumps(payload))
        print(f"📡 Published: {json.dumps(payload)}")
        time.sleep(5)
except KeyboardInterrupt:
    print("Stopping gateway...")
    # client.loop_stop()
