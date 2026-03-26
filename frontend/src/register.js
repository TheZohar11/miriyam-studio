import { redirectIfLoggedIn, setToken, setUserName } from "./auth.js";

redirectIfLoggedIn();

const API = import.meta.env.VITE_API_URL;
const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || "Registration failed";
      return;
    }

    setToken(data.token);
    setUserName(data.name);
    location.href = "/";
  } catch {
    errorMsg.textContent = "Network error. Please try again.";
  }
});
