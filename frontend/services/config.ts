// Auto-detect environment
export const API_BASE_URL =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:8000"
    : "https://saas-management-platform-1.onrender.com";

/* -----------------------------
   REFRESH TOKEN
----------------------------- */
const getNewAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    localStorage.setItem("accessToken", data.access);
    return data.access;
  } catch {
    return null;
  }
};

/* -----------------------------
   MAIN AUTHENTICATED FETCH
----------------------------- */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.href = "/login";
    return new Response("Not authenticated", { status: 401 });
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  // Do NOT set content-type for FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    // ❌ REMOVE THIS — breaks JWT
    // credentials: "include",
  };

  let response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

  if (response.status === 401) {
    console.log("Token expired, refreshing…");

    const newToken = await getNewAccessToken();
    if (!newToken) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    headers.set("Authorization", `Bearer ${newToken}`);
    fetchOptions.headers = headers;

    response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
  }

  // Avoid HTML parsing crash → check content-type before parsing JSON
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.message || "Request failed");
    } else {
      throw new Error(`Server Error (${response.status})`);
    }
  }

  return response;
};
