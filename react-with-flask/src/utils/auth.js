const API = "";

async function readApiResponse(res) {
  const rawBody = await res.text();

  if (!rawBody) {
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}.`);
    }

    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}.`);
    }

    throw new Error("The server returned an invalid response.");
  }
}

export async function login(email, password) {
  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await readApiResponse(res);
  if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}.`);
  return data;
}

export async function signup(email, password) {
  const res = await fetch(`${API}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await readApiResponse(res);
  if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}.`);
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
  return readApiResponse(res);
}

export async function getScans() {
  const res = await fetch(`${API}/api/scans`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.scans;
}
