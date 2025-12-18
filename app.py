from flask import Flask, jsonify
from flask_cors import CORS
import random

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) so your frontend can connect
CORS(app)

# --- This is the core simulation logic ---
def generate_line_data(line_id, name, location):
    """Generates a dictionary of random data for a single power line."""
    
    status = "Operational" if random.random() < 0.9 else "Fault"
    
    if status == "Operational":
        # Generate normal operating values
        voltage = random.uniform(225.0, 235.0)
        current = random.uniform(10.0, 20.0)
        temperature = random.uniform(40.0, 55.0)
        # --- ADDED ---
        signal_strength = random.randint(3, 4) # Simulate a strong signal
    else: # If in a "Fault" state
        # Generate abnormal values
        voltage = random.uniform(80.0, 150.0)
        current = random.uniform(30.0, 50.0)
        temperature = random.uniform(70.0, 90.0)
        # --- ADDED ---
        signal_strength = random.randint(1, 2) # Simulate a weak signal during a fault

    # Calculate power (P = V * I) in Watts
    power = voltage * current
    
    return {
        "id": line_id,
        "name": name,
        "location": location,
        "status": status,
        "voltage": voltage,
        "current": current,
        "temperature": temperature,
        "power": power,
        "signalStrength": signal_strength # --- ADDED ---
    }

# --- This is the API Endpoint for the Live Monitor ---
@app.route('/api/data/live-monitor')
def get_live_monitor_data():
    """This function runs when the frontend requests data."""
    
    lines_data = [
        generate_line_data(1, "Feeder Line 01", "Trivandrum North"),
        generate_line_data(2, "Feeder Line 02", "Kollam Industrial"),
        generate_line_data(3, "Feeder Line 03", "Kochi Metro"),
        generate_line_data(4, "Feeder Line 04", "Palakkad Rural")
    ]
    
    return jsonify(lines_data)

# This makes the server run when you execute the file
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    from flask import Flask, jsonify
import random

app = Flask(__name__)

@app.route('/api/feeders', methods=['GET'])
def get_feeder_data():
    data = {
        "feeder1": {
            "voltage": round(random.uniform(210, 240), 2),
            "current": round(random.uniform(5, 15), 2),
            "temp": round(random.uniform(25, 45), 2),
            "power": round(random.uniform(1000, 2000), 2)
        },
        "feeder2": {
            "voltage": round(random.uniform(210, 240), 2),
            "current": round(random.uniform(5, 15), 2),
            "temp": round(random.uniform(25, 45), 2),
            "power": round(random.uniform(1000, 2000), 2)
        },
        "feeder3": {
            "voltage": round(random.uniform(210, 240), 2),
            "current": round(random.uniform(5, 15), 2),
            "temp": round(random.uniform(25, 45), 2),
            "power": round(random.uniform(1000, 2000), 2)
        },
        "feeder4": {
            "voltage": round(random.uniform(210, 240), 2),
            "current": round(random.uniform(5, 15), 2),
            "temp": round(random.uniform(25, 45), 2),
            "power": round(random.uniform(1000, 2000), 2)
        }
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
