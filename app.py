import joblib
import pandas as pd
import json  # --- Import the JSON library
from flask import Flask, request, jsonify, render_template

# Initialize the Flask app
app = Flask(__name__, static_folder='static')

# Load category dictionnary
try:
    with open('data/categories.json', 'r', encoding='utf-8') as f:
        CATEGORIES = json.load(f)
    print("Categories loaded successfully from categories.json.")
except FileNotFoundError:
    print("Error: 'categories.json' not found.")
    exit()
except Exception as e:
    print(f"Error loading categories.json: {e}")
    exit()


# Load our trained model
try:
    model = joblib.load('models/xgb_model.joblib')
    print("Model loaded successfully.")
except FileNotFoundError:
    print("Error: 'models/xgb_model.joblib' not found.")
    exit()
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# Define feature lists
NUMERICAL_FEATURES = ['lat', 'long', 'Age', 'Hour', 'DayOfWeek', 'Month','vma']
CATEGORICAL_FEATURES = [
    'place', 'sexe', 'trajet', 'secu1', 'secu2', 'lum', 'agg', 
    'int', 'atm', 'col', 'catr', 'circ', 'nbv', 'vosp', 
    'prof', 'plan', 'surf', 'infra', 'situ', 'senc', 'catv', 
    'obs', 'obsm', 'choc', 'manv', 'motor'
]
MODEL_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES


@app.route('/')
def home():
    return render_template('index.html', categories=CATEGORIES)


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features_dict = data['features']
        input_df = pd.DataFrame([features_dict], columns=MODEL_FEATURES)

        for col in NUMERICAL_FEATURES:
            input_df[col] = pd.to_numeric(input_df[col])
        for col in CATEGORICAL_FEATURES:
            input_df[col] = input_df[col].astype(str)

        print(input_df)

        prediction_array = model.predict(input_df)
        probability_array = model.predict_proba(input_df)
        prediction = prediction_array[0]
        
        probability_light = probability_array[0][list(model.classes_).index(0)]
        probability_severe = probability_array[0][list(model.classes_).index(1)]

        response = {
            'prediction': 'Light' if prediction == 0 else 'Severe',
            'probability_light': round(float(probability_light), 4),
            'probability_severe': round(float(probability_severe), 4)
        }
        print(response)
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)