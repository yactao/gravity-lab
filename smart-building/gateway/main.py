import time
import json
import random
import os
import paho.mqtt.client as mqtt
from datetime import datetime
from getmac import get_mac_address

# Configuration
MQTT_BROKER = os.getenv("MQTT_BROKER", "76.13.59.115")
MQTT_PORT = 1883

# Auto-discovery of the Device ID via MAC address
_mac = get_mac_address()
# Normalize MAC for MQTT topics (e.g. a1b2c3d4e5f6)
DEVICE_ID = _mac.replace(":", "").lower() if _mac else f"unknown-{random.randint(1000,9999)}"
BUILDING_ID = None

# Topics (will be initialized when BUILDING_ID is received)
TOPIC_TELEMETRY = None
TOPIC_COMMANDS = None

# Simulated Sensors
sensors = {
    "temperature": 21.0,  # °C
    "presence": False,    # Boolean
    "hvac_status": "ON",  # ON/OFF
    "light_status": "OFF" # ON/OFF
}

def on_connect(client, userdata, flags, rc):
    print(f"✅ Connected to {MQTT_BROKER} with result code {rc}")
    print(f"🚀 Initializing U-Bot Handshake for MAC: {DEVICE_ID}...")
    
    # 1. Subscribe to our private provisioning channel
    provisioning_topic = f"ubbee/provisioning/{DEVICE_ID}/config"
    client.subscribe(provisioning_topic)
    
    # 2. Publish Handshake "Hello, I am here"
    client.publish("ubbee/provisioning/handshake", json.dumps({"mac": DEVICE_ID}))

def on_message(client, userdata, msg):
    global BUILDING_ID, TOPIC_TELEMETRY, TOPIC_COMMANDS
    
    topic = msg.topic
    payload_str = msg.payload.decode()
    
    try:
        data = json.loads(payload_str)
        
        # 3. Intercept Cloud Configuration
        if topic == f"ubbee/provisioning/{DEVICE_ID}/config":
            new_building_id = data.get("building_id")
            if new_building_id and new_building_id != BUILDING_ID:
                BUILDING_ID = new_building_id
                TOPIC_TELEMETRY = f"smartbuilding/{BUILDING_ID}/{DEVICE_ID}/telemetry"
                TOPIC_COMMANDS = f"smartbuilding/{BUILDING_ID}/{DEVICE_ID}/commands"
                
                print(f"🎉 Configuration Received! Assigned to building: {BUILDING_ID}")
                # Subscribe to site-specific commands
                client.subscribe(TOPIC_COMMANDS)
                print(f"🎧 Listening to commands on: {TOPIC_COMMANDS}")
                
        # Handle Site Commands
        elif topic == TOPIC_COMMANDS:
            print(f"📥 Received command: {topic} -> {payload_str}")
            handle_command(data)
            
    except Exception as e:
        print(f"❌ Error processing message on {topic}: {e}")

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
    sensors["temperature"] += random.uniform(-0.1, 0.1)
    
    hour = datetime.now().hour
    if 8 <= hour <= 19:
        sensors["presence"] = random.choice([True, True, False])
    else:
        sensors["presence"] = False

    return sensors


if __name__ == "__main__":
    print(f"=== U-Bot Agent Starting up ===")
    print(f"Detected MAC Address: {_mac}")
    print(f"Computed Device ID: {DEVICE_ID}")
    
    client = mqtt.Client() 
    client.on_connect = on_connect
    client.on_message = on_message

    # Production TLS
    # client.tls_set()
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
    except Exception as e:
        print(f"⚠️ Failed to connect to broker {MQTT_BROKER}: {e}")
        # Optionally exit or retry

    try:
        while True:
            # We only publish telemetry if the handshake worked and we got a BUILDING_ID
            if BUILDING_ID:
                data = simulate_environment()
                payload = {
                    "timestamp": datetime.now().isoformat(),
                    "device_id": DEVICE_ID,
                    "data": data
                }
                client.publish(TOPIC_TELEMETRY, json.dumps(payload))
                print(f"📡 Published to {TOPIC_TELEMETRY}: {json.dumps(payload)}")
            else:
                print("⏳ Waiting for Cloud Configuration... (No Building_ID yet)")
                
            time.sleep(5)
    except KeyboardInterrupt:
        print("Stopping gateway...")
        client.loop_stop()
