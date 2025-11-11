// Wait for the HTML document to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', function() {
    
    // --- MAP SETUP ---
    const idfLat = 48.8566; // Paris center
    const idfLong = 2.3522;

    const latField = document.getElementById('lat');
    const longField = document.getElementById('long');
    
    // Set initial values for the form
    latField.value = idfLat;
    longField.value = idfLong;

    const map = L.map('map').setView([idfLat, idfLong], 9); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([idfLat, idfLong], {
        draggable: true
    }).addTo(map);

    const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Search for a street...',
        query: 'Paris, France', 
        bounds: L.latLngBounds(L.latLng(48.1, 1.9), L.latLng(49.0, 3.1))
    }).on('markgeocode', function(e) {
        const coords = e.geocode.center;
        map.setView(coords, 16); 
        marker.setLatLng(coords);
        updateFields(coords);
    }).addTo(map);

    // --- MAP EVENT HANDLERS ---
    
    // Helper function to update text fields
    function updateFields(coords) {
        latField.value = coords.lat.toFixed(6);
        longField.value = coords.lng.toFixed(6);
    }
    
    // Helper function to update map from text fields
    function updateMapFromFields() {
        const lat = parseFloat(latField.value);
        const lng = parseFloat(longField.value);
        
        if (lat && lng) {
            const newCoords = L.latLng(lat, lng);
            marker.setLatLng(newCoords);
            map.panTo(newCoords);
        }
    }

    // 1. Update fields when marker is dragged
    marker.on('dragend', function(e) {
        updateFields(e.target.getLatLng());
    });

    // 2. Update fields when map is clicked
    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        updateFields(e.latlng);
    });

    // 3. Update map when user types in 'lat' field
    latField.addEventListener('input', updateMapFromFields);
    // 4. Update map when user types in 'long' field
    longField.addEventListener('input', updateMapFromFields);

    // Get the main elements
    const form = document.getElementById('prediction-form');
    const resultContainer = document.getElementById('result-container');
    const resultDiv = document.getElementById('result');

    // Add an event listener for the form's 'submit' event
    form.addEventListener('submit', function(event) {
        // Prevent the default form submission (which reloads the page)
        event.preventDefault();

        // --- 1. Define the API endpoint URL ---
        const API_URL = '/predict'; // Relative path for deployed app

        // --- 2. Collect all 33 features from the form ---
        // This function now collects all 33 features from their IDs
        function getFeaturePayload() {
            const elements = form.elements;
            const payload = {};
            
            // Get numerical features
            payload['lat'] = parseFloat(elements.lat.value);
            payload['long'] = parseFloat(elements.long.value);
            payload['Age'] = parseFloat(elements.Age.value);
            payload['Hour'] = parseInt(elements.Hour.value);
            payload['DayOfWeek'] = parseInt(elements.DayOfWeek.value);
            payload['Month'] = parseInt(elements.Month.value);
            
            // Get categorical features
            const cat_ids = [
                'place', 'sexe', 'trajet', 'secu1', 'secu2', 'lum', 'agg', 
                'int', 'atm', 'col', 'catr', 'circ', 'nbv', 'vosp', 
                'prof', 'plan', 'surf', 'infra', 'situ', 'vma', 'senc', 'catv', 
                'obs', 'obsm', 'choc', 'manv', 'motor'
            ];
            
            cat_ids.forEach(id => {
                payload[id] = elements[id].value;
            });
            
            return payload;
        }

        const featurePayload = getFeaturePayload();

        // --- 3. Send the data to the Flask API ---
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'features': featurePayload })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { 
                    throw new Error(err.error || 'Unknown error'); 
                });
            }
            return response.json(); 
        })
        .then(data => {
            // --- 4. Display the result ---
            console.log(data);
            let probability = 0;
            let alertClass = 'alert-success'; 
            
            if (data.prediction === 'Severe') {
                probability = data.probability_severe;
                alertClass = 'alert-danger';
            } else {
                probability = data.probability_light;
                alertClass = 'alert-primary';
            }
            
            resultDiv.innerHTML = `
                <strong>Prediction: ${data.prediction}</strong>
                <br>
                Confidence: ${ (probability * 100).toFixed(1) }%
            `;
            resultDiv.className = `alert ${alertClass}`;
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            // --- 5. Handle errors ---
            console.error('Error:', error);
            resultDiv.innerHTML = `<strong>Error:</strong> Could not get prediction. <br> ${error.message}`;
            resultDiv.className = 'alert alert-warning';
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        });
    });

});