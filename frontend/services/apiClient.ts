// Use production backend URL as fallback if environment variable is not set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://saas-management-platform-1.onrender.com";

/**
 * Refresh token handler
 */
const getNewAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        console.error("No refresh token found.");
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Session expired. Please log in again.");
        }

        const data = await response.json();
        localStorage.setItem("accessToken", data.access);
        return data.access;
    } catch (error) {
        console.error("Token refresh failed:", error);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return null;
    }
};

/**
 * Secure authenticated API fetch wrapper
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        console.error("No access token found. Redirecting to login.");
        if (typeof window !== "undefined") window.location.href = "/login";

        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${accessToken}`);

    if (options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    try {
        let response = await fetch(`${API_BASE_URL}${url}`, { 
            ...options, 
            headers,
            credentials: 'include' // Important for sending cookies with cross-origin requests
        });

        // Handle expired accessToken
        if (response.status === 401) {
            console.log("Access token expired. Attempting to refresh...");
            const newAccessToken = await getNewAccessToken();

            if (newAccessToken) {
                headers.set("Authorization", `Bearer ${newAccessToken}`);
                response = await fetch(`${API_BASE_URL}${url}`, { 
                    ...options, 
                    headers,
                    credentials: 'include'
                });
            } else {
                // If refresh fails, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw new Error('Authentication required');
            }
        }

        // Handle other error statuses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'API request failed');
        }

        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};
