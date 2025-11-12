# Step 1: Start from an official Python base image.
# 'slim' is a lightweight version, which is good for production.
FROM python:3.10-slim

# Step 2: Set the working directory inside the container.
# This is where our app's files will live.
WORKDIR /app

# Step 3: Copy all your project files into the container.
# This copies everything: app.py, requirements.txt, models/, templates/, etc.
COPY . .

# Step 4: Install the Python dependencies.
# We use --no-cache-dir to keep the image size small.
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Expose the port that your Flask app runs on.
# We told Flask to use port 5000 in app.py.
EXPOSE 5000

# Step 6: Define the command to run your application.
# We use 'gunicorn' (which is in requirements.txt) as it's a
# production-ready server, unlike the default Flask server.
# It runs your 'app.py' file and looks for the 'app' variable inside it.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]