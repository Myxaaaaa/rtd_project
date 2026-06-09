const AUTH_KEY = "lifegift_admin_auth";
const PASS_KEY = "lifegift_admin_pass";

function adminHeaders() {
  const password = sessionStorage.getItem(PASS_KEY);
  return password ? { "X-Admin-Password": password } : {};
}

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export async function fetchSiteDataFromApi() {
  const res = await fetch("/api/site-data");
  return parseJson(res);
}

export async function saveSiteDataToApi(data) {
  const res = await fetch("/api/site-data", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(data),
  });
  return parseJson(res);
}

export async function resetSiteDataOnApi() {
  const res = await fetch("/api/site-data/reset", {
    method: "POST",
    headers: adminHeaders(),
  });
  return parseJson(res);
}

export async function fetchLeadsFromApi() {
  const res = await fetch("/api/leads", { headers: adminHeaders() });
  return parseJson(res);
}

export async function submitLeadToApi(entry) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  return parseJson(res);
}

export async function deleteLeadOnApi(id) {
  const res = await fetch(`/api/leads/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  return parseJson(res);
}

export async function clearLeadsOnApi() {
  const res = await fetch("/api/leads", {
    method: "DELETE",
    headers: adminHeaders(),
  });
  return parseJson(res);
}

export async function isApiAvailable() {
  try {
    const res = await fetch("/api/health");
    return res.ok;
  } catch {
    return false;
  }
}

export function setAdminSession(password) {
  sessionStorage.setItem(AUTH_KEY, "1");
  sessionStorage.setItem(PASS_KEY, password);
}

export function clearAdminSession() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(PASS_KEY);
}

export function hasAdminSession() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export { AUTH_KEY, PASS_KEY };
