# Accident Severity Prediction API for Île-de-France

This project is a complete end-to-end data science application that predicts the severity of a road accident in the Île-de-France region.

It includes a full data processing pipeline, a machine learning model (Gradient Boosting), and a web application interface. The user can select a location on an interactive map, fill in the conditions of an accident, and the model will predict the probability of the outcome being **'Severe'** (Killed or Hospitalized) or **'Light'** (Unharmed or Lightly Injured).

## Features

* **Interactive Map UI:** A frontend built with Leaflet.js that allows a user to select a precise `lat/long` by clicking, dragging a marker, or using a street-name search.
* **Dynamic Web Form:** The entire web form is built dynamically using Flask and Jinja2, pulling all categories and labels from a central `categories.json` file.
* **ML Prediction API:** A Python Flask backend serves a pre-trained `GradientBoostingClassifier` model at a `/predict` endpoint.
* **Geospatial Prediction:** The model uses `latitude` and `longitude` as key features, alongside 31 other environmental, vehicle, and driver-related features.
* **Robust Data Pipeline:** The model was trained on three years (2021-2023) of official French government (BAAC) accident data.
* **Focused Modeling:** The dataset was meticulously cleaned and filtered to focus **only on drivers (`catu=1`)** for a more accurate and specific prediction.
* **Imbalance Handling:** The model was trained on the full, unbalanced dataset using **weighted classes** to prioritize the detection of 'Severe' cases.
* **Fully Containerized:** A `Dockerfile` is included for easy, reproducible deployment.

## Final Project Structure

your_project_folder/
├── models/
│   └── gb_model.joblib         # The trained Gradient Boosting model
├── static/
│   └── js/
│       └── app.js              # Frontend logic (map, form submission)
├── templates/
│   └── index.html              # Dynamic HTML frontend (uses Jinja2)
├── app.py                      # The Flask API backend (serves HTML & predictions)
├── categories.json             # All form categories and labels
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Recipe for building the Docker image
├── .dockerignore               # Files to ignore during Docker build
└── README.md                   # This file

## Setup & Installation

This project requires Python 3.9+ and Docker.

### 1. Project Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mmarclin/car_crash_project.git
    cd your_project_folderS
    ```

2.  **Add Your Model:**
    Place your trained model (e.g., `gb_model.joblib`) into the `models/` folder.

3.  **Install Dependencies (using Conda or venv):**

    *Using Conda:*
    ```bash
    conda create --name accident_api python=3.10
    conda activate accident_api
    pip install -r requirements.txt
    ```

    *Using venv:*
    ```bash
    python -m venv venv
    source venv/bin/activate  # (or .\venv\Scripts\activate on Windows)
    pip install -r requirements.txt
    ```

### 2. Running the Application (Local)

1.  **Run the Flask app:**
    ```bash
    python app.py
    ```
    (The app will load the `gb_model.joblib` and `categories.json` files on startup.)

2.  **Open your browser:**
    Go to `http://127.0.0.1:5000/`. You should see the full web application.

### 3. Running with Docker (Recommended)

This is the simplest way to run the application, as it builds the entire environment for you.

1.  **Build the Docker Image:**
    (Make sure Docker Desktop is running)
    ```bash
    docker build -t accident-api .
    ```

2.  **Run the Docker Container:**
    ```bash
    docker run -d -p 5000:5000 accident-api
    ```
    * `-d` runs the container in detached (background) mode.
    * `-p 5000:5000` maps your computer's port 5000 to the container's port 5000.

3.  **Open your browser:**
    Go to `http://localhost:5000/`. The application is now served from inside the Docker container.

---

## API Endpoint: `/predict`

This is the core of the API. It only accepts `POST` requests with a JSON payload.

* **URL:** `/predict`
* **Method:** `POST`
* **Body (JSON):** The body must contain a single key, `"features"`, which is an object of all 33 required features.

    *Note: All categorical features must be sent as **strings** (e.g., `"vma": "50"`).*

    **Example Request Body:**
    ```json
    {
      "features": {
        "lat": 48.8584,
        "long": 2.2945,
        "Age": 28.0,
        "Hour": 17,
        "DayOfWeek": 5,
        "Month": 11,
        "place": "1",
        "sexe": "1",
        "trajet": "5",
        "secu1": "1",
        "secu2": "0",
        "lum": "1",
        "agg": "2",
        "int": "1",
        "atm": "1",
        "col": "6",
        "catr": "3",
        "circ": "2",
        "nbv": "2",
        "vosp": "0",
        "prof": "1",
        "plan": "1",
        "surf": "1",
        "infra": "0",
        "situ": "1",
        "vma": "50",
        "senc": "1",
        "catv": "7",
        "obs": "0",
        "obsm": "2",
        "choc": "1",
        "manv": "1",
        "motor": "1"
      }
    }
    ```

* **Success Response (JSON):**
    ```json
    {
      "prediction": "Severe",
      "probability_light": 0.3201,
      "probability_severe": 0.6799
    }
    ```