from django.middleware.csrf import get_token
from django.utils.deprecation import MiddlewareMixin

class CSRFCookieMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Skip for API requests
        if request.path.startswith('/api/'):
            return response
            
        # Set CSRF token in cookie for frontend
        if not request.META.get('CSRF_COOKIE'):
            get_token(request)
        
        # Set CORS headers
        response['Access-Control-Allow-Credentials'] = 'true'
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        
        return response
