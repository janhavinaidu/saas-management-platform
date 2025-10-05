/**
 * A utility function to get a new access token using the refresh token.
 * This is called automatically when an API request fails with a 401 Unauthorized error.
 */
const getNewAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.error("No refresh token found.");
        return null;
    }

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
        // Clear old tokens to prevent an infinite loop
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Force a redirect to the login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }
};

/**
 * This is our new, "smart" fetch function that handles authentication.
 * It automatically adds the 'Authorization' header and will attempt to
 * refresh the token and retry the request if it fails with a 401 error.
 * All secure API calls in the application should use this function.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        console.error('No access token found. Redirecting to login.');
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        // Return a dummy response to prevent further execution
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // Set up the initial request headers
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);
    // Only set Content-Type if a body is present and it's not FormData
    if (options.body && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // Make the initial API request
    let response = await fetch(url, { ...options, headers });

    // If the response is 401 (Unauthorized), our token is likely expired
    if (response.status === 401) {
        console.log('Access token expired. Attempting to refresh...');
        const newAccessToken = await getNewAccessToken();
        
        // If we successfully got a new token, retry the original request
        if (newAccessToken) {
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            console.log('Retrying the original request with new token...');
            response = await fetch(url, { ...options, headers });
        }
    }

    return response;
};

