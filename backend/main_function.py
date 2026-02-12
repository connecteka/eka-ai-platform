# Cloud Function entry point wrapper for FastAPI
import functions_framework
from main import app

@functions_framework.http
def eka_ai_api(request):
    """HTTP Cloud Function entry point."""
    from werkzeug.serving import run_wsgi
    from io import BytesIO
    
    # Convert Cloud Function request to WSGI
    environ = request.environ
    
    # Create response buffer
    response_buffer = BytesIO()
    
    # Call FastAPI app
    def start_response(status, headers):
        response_buffer.write(f"HTTP/1.1 {status}\r\n".encode())
        for header, value in headers:
            response_buffer.write(f"{header}: {value}\r\n".encode())
        response_buffer.write(b"\r\n")
    
    # This is a simplified wrapper - for production use a proper ASGI adapter
    return app
