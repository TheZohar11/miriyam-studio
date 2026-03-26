import { redirectIfLoggedIn, setToken, setUserName } from "./auth.js";

redirectIfLoggedIn();

const API = import.meta.env.VITE_API_URL;
const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || "Login failed";
      return;
    }

    setToken(data.token);
    setUserName(data.name);
    location.href = "/";
  } catch {
    errorMsg.textContent = "Network error. Please try again.";
  }
});
