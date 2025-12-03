from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class HealthCheckView(APIView):
    """
    Simple health check endpoint to verify the API is running.
    """
    authentication_classes = []  # No authentication required
    permission_classes = []
    
    def get(self, request, format=None):
        return Response({
            'status': 'ok',
            'service': 'saas-license-manager',
            'version': '1.0.0',
        }, status=status.HTTP_200_OK)
