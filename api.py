from flask import Flask, request, jsonify
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

# Initialize Flask app
app = Flask(__name__)

# Load the pre_trained model and scaler
script_dir = Path(__file__).parent.resolve()
with open(script_dir / 'models/lr_model.joblib', 'rb') as model_file:
    model = joblib.load(model_file)
with open(script_dir / 'models/scaler.joblib', 'rb') as scaler_file:
    scaler = joblib.load(scaler_file)

# Main page
@app.route('/')
def home():
    return "Welcome to the Prediction API!"

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the Json data from the api request & convert into dataframe
        data = request.get_json()
        features = pd.DataFrame([data])

        # Check if input data is provided
        if not data : 
            return jsonify({"error": "Input data is not provided"}), 400

        # Check if all features are provided
        required_features = ['GP', 'MIN', 'PTS', 'FGM', 'FGA', 'FG%', '3P Made', '3PA', '3P%',
                             'FTM', 'FTA', 'FT%', 'OREB', 'DREB', 'REB', 'AST', 'STL', 'BLK','TOV']
        if not all(col in features.columns for col in required_features):
            return jsonify({"error": f'Required columns missing. Required columns : {required_features}'}), 400

        # Scale the data
        scaled_features = scaler.transform(features)

        # Make prediction
        prediction = model.predict(scaled_features)

        # Response
        response = {
            'prediction': 'career length higher than 5 years' if prediction[0] == 1 else 'career length less than 5 years'
        }

        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)

