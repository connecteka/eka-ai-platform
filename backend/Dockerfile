# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Command to run the application using Uvicorn
# We bind to 0.0.0.0 to allow external connections.
# The port is dynamically set by Cloud Run via the $PORT environment variable.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
