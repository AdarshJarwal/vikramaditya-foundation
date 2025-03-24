from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'vikramaditya_foundation')
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/api/volunteer', methods=['POST'])
def submit_volunteer():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['volunteer_type', 'full_name', 'phone', 'locality', 'district', 'city', 'state']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field.replace("_", " ").title()} is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert volunteer data
        sql = """
        INSERT INTO volunteers (
            volunteer_type, full_name, phone, 
            locality, district, city, state, 
            email, message
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['volunteer_type'],
            data['full_name'],
            data['phone'],
            data['locality'],
            data['district'],
            data['city'],
            data['state'],
            data.get('email'),
            data.get('message')
        )

        cursor.execute(sql, values)
        conn.commit()
        return jsonify({'message': 'Volunteer application submitted successfully'}), 201

    except mysql.connector.IntegrityError as e:
        return jsonify({'error': 'Phone number already exists in our system'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()





# donate
@app.route('/api/donate', methods=['POST'])
def submit_donation():
    data = request.get_json()
    
    required_fields = [
        'donation_type', 'full_name', 'phone',
        'locality', 'district', 'city', 'state'
    ]
    
    # Validate required fields
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field.replace("_", " ").title()} is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
        INSERT INTO donations (
            donation_type, description, full_name,
            phone, locality, district, city, state,
            email, message
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Simplified values handling
        values = (
            data['donation_type'],
            data.get('description'),
            data['full_name'],
            data['phone'],
            data['locality'],
            data['district'],
            data['city'],
            data['state'],
            data.get('email') or None,  # Explicit None for NULL
            data.get('message') or None
        )

        cursor.execute(sql, values)
        conn.commit()
        return jsonify({'message': 'Donation submitted successfully'}), 201

    except mysql.connector.IntegrityError as e:
        return jsonify({'error': 'Phone number already exists in our system'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()



if __name__ == '__main__':
    app.run(debug=True, port=5000)