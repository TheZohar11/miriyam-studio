const API = import.meta.env.VITE_API_URL;

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getUserName() {
  return localStorage.getItem("userName");
}

export function setUserName(name) {
  localStorage.setItem("userName", name);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  location.href = "/login.html";
}

export function requireAuth() {
  if (!getToken()) {
    location.href = "/login.html";
    return false;
  }
  return true;
}

export function redirectIfLoggedIn() {
  if (getToken()) {
    location.href = "/";
    return true;
  }
  return false;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  if (!token) {
    logout();
    return;
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    logout();
    return;
  }

  return res;
}
