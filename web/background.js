const API_BASE = "https://api.archive.atharvdangedev.in/api";

/* ------------------ Storage Helpers ------------------ */

function getTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["accessToken", "refreshToken"], (result) => {
      resolve(result);
    });
  });
}

function setTokens(accessToken, refreshToken) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ accessToken, refreshToken }, resolve);
  });
}

function clearTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["accessToken", "refreshToken"], resolve);
  });
}

/* ------------------ Auth ------------------ */

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return { success: true };
}

async function refreshAccessToken() {
  const { refreshToken } = await getTokens();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  await chrome.storage.local.set({ accessToken: data.accessToken });
}

/* ------------------ Core API Wrapper ------------------ */

async function apiRequest(endpoint, options = {}) {
  const { accessToken } = await getTokens();
  if (!accessToken) {
    return { error: "AUTH_REQUIRED" };
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    try {
      await refreshAccessToken();
    } catch {
      await clearTokens();
      return { error: "AUTH_REQUIRED" };
    }

    const { accessToken: newAccessToken } = await getTokens();

    const retryRes = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newAccessToken}`,
        ...(options.headers || {}),
      },
    });

    if (!retryRes.ok) {
      return { error: "REQUEST_FAILED" };
    }

    return await retryRes.json();
  }

  if (!res.ok) {
    return { error: "REQUEST_FAILED" };
  }

  return await res.json();
}

/* ------------------ Save URL ------------------ */

async function saveUrl(url) {
  return apiRequest("/content", {
    method: "POST",
    body: JSON.stringify({
      type: "link",
      url,
    }),
  });
}

/* ------------------ Message Listener ------------------ */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === "LOGIN") {
        const result = await login(message.email, message.password);
        sendResponse(result);
      }

      if (message.type === "SAVE_URL") {
        const result = await saveUrl(message.url);
        sendResponse(result);
      }
    } catch (err) {
      sendResponse({ error: err.message });
    }
  })();

  return true; // keep channel open
});
