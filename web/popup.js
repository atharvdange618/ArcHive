const statusEl = document.getElementById("status");
const loginSection = document.getElementById("loginSection");
const loggedInSection = document.getElementById("loggedInSection");

function showStatus(message, isSuccess) {
  statusEl.textContent = message;
  statusEl.className = isSuccess ? "success" : "error";
  setTimeout(() => {
    statusEl.textContent = "";
    statusEl.className = "";
  }, 3000);
}

function updateUIBasedOnAuth(isLoggedIn) {
  if (isLoggedIn) {
    loginSection.style.display = "none";
    loggedInSection.style.display = "flex";
  } else {
    loginSection.style.display = "flex";
    loggedInSection.style.display = "none";
  }
}

// Check login status on popup load
chrome.storage.local.get(["accessToken"], (result) => {
  const isLoggedIn = !!result.accessToken;
  updateUIBasedOnAuth(isLoggedIn);
});

document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  chrome.runtime.sendMessage({ type: "LOGIN", email, password }, (response) => {
    if (response?.success) {
      showStatus("Logged in successfully!", true);
      updateUIBasedOnAuth(true);
      // Clear password field for security
      document.getElementById("password").value = "";
    } else {
      showStatus("Login failed. Please try again.", false);
    }
  });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  chrome.storage.local.remove(["accessToken", "refreshToken"], () => {
    updateUIBasedOnAuth(false);
    showStatus("Logged out successfully!", true);
    // Clear email and password fields
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  });
});

document.getElementById("saveBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    chrome.runtime.sendMessage({ type: "SAVE_URL", url }, (response) => {
      if (response?.error === "AUTH_REQUIRED") {
        showStatus("Please login first.", false);
        return;
      }

      if (response?.error) {
        showStatus("Failed to save. Please try again.", false);
        return;
      }

      showStatus("Page saved successfully!", true);
    });
  });
});
