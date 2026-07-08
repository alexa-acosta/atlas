const API = "http://localhost:5000";

export async function login(email, password) {
  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function signup(email, password) {
  const res = await fetch(`${API}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function logout() {
  await fetch(`${API}/api/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe() {
  const res = await fetch(`${API}/api/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}
