// A utility to get a new access token using the refresh token
const getNewAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Session expired. Please log in again.');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return data.access;
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens and force re-login if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }
};

// This is our new, smart fetch function
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        throw new Error('No authentication token found.');
    }

    // Set up initial headers
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        // Make the initial request with better error handling
        console.log('Making request to:', url);
        let response = await fetch(url, { ...options, headers });
        console.log('Response status:', response.status);

        // If the response is 401, our token might be expired
        if (response.status === 401) {
            console.log('Access token expired. Attempting to refresh...');
            const newAccessToken = await getNewAccessToken();
            
            if (newAccessToken) {
                // If we got a new token, update headers and retry the request
                headers.set('Authorization', `Bearer ${newAccessToken}`);
                console.log('Retrying the original request with new token...');
                response = await fetch(url, { ...options, headers });
            }
        }

        return response;
    } catch (error) {
        console.error('Fetch error details:', error);
        console.error('Request URL:', url);
        console.error('Request options:', { ...options, headers: Object.fromEntries(headers.entries()) });
        
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error(`Network error: Unable to connect to ${url}. Please check if the backend server is running on http://127.0.0.1:8000`);
        }
        throw error;
    }
};
