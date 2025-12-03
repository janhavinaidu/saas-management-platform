import { API_BASE_URL } from "./config";

/* -----------------------------
   REFRESH TOKEN FUNCTION
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
   MAIN AUTH FETCH HANDLER
----------------------------- */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {

  // AUTO-FIX URL JOINING (prevents double or missing slashes)
  const finalUrl =
    url.startsWith("/")
      ? `${API_BASE_URL}${url}`
      : `${API_BASE_URL}/${url}`;

  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.href = "/login";
    return new Response("Not authenticated", { status: 401 });
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(finalUrl, fetchOptions);

  /* -----------------------------
     HANDLE TOKEN EXPIRATION
  ----------------------------- */
  if (response.status === 401) {
    console.log("🔁 Token expired — refreshing...");

    const newToken = await getNewAccessToken();
    if (!newToken) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    headers.set("Authorization", `Bearer ${newToken}`);
    fetchOptions.headers = headers;

    response = await fetch(finalUrl, fetchOptions);
  }

  /* -----------------------------
     SAFELY PARSE ONLY JSON RESPONSES
  ----------------------------- */
  if (!response.ok) {
    const ct = response.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail ||
          errorData.message ||
          errorData.error ||
          "Request failed"
      );
    } else {
      throw new Error(`Server error: ${response.status}`);
    }
  }

  return response;
};
