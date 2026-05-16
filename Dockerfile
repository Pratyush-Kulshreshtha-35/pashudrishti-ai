# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy everything from your project into the container
COPY . .

# Install dependencies from the backend folder
RUN pip install --no-cache-dir -r backend/requirements.txt

# Set the working directory to the backend folder where app.py lives
WORKDIR /app/backend

# Set environment variables
ENV FLASK_APP=app.py
ENV PORT=7860

# Expose the port
EXPOSE 7860

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]
