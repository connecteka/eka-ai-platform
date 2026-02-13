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

# Expose the port (Cloud Run sets PORT env var, default 8080)
ENV PORT=8080
EXPOSE $PORT

# Command to run the application using Uvicorn
# Cloud Run provides the PORT environment variable dynamically
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
