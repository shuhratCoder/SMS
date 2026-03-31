const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:2002";

async function doFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = token;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

export const api = {
  login: (username: string, pass: string) =>
    doFetch("/users", {
      method: "POST",
      body: JSON.stringify({ username, pass }),
    }),
  createUser: (username: string, pass: string) =>
    doFetch("/users/create", {
      method: "POST",
      body: JSON.stringify({ username, pass }),
    }),

  getContacts: () => doFetch("/contacts/contactAll", { method: "GET" }),
  createContact: (payload: object) =>
    doFetch("/contacts/createContact", { method: "POST", body: JSON.stringify(payload) }),
  updateContact: (id: string | number, payload: object) =>
    doFetch(`/contacts/updateContact/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteContact: (id: string | number) =>
    doFetch(`/contacts/deleteContact?id=${id}`, { method: "DELETE" }),

  getGroups: () => doFetch("/groups/groupAll", { method: "GET" }),
  createGroup: (payload: object) =>
    doFetch("/groups/createGroup", { method: "POST", body: JSON.stringify(payload) }),
}
