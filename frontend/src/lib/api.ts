const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:2002";

// 🔥 Universal fetch
async function doFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
    let message = "API error";

    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      const text = await res.text();
      message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

// 🚀 API METHODS
export const api = {
  // ================= AUTH =================
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

  // ================= CONTACTS =================
  getContacts: () =>
    doFetch("/contacts/contactAll", {
      method: "GET",
    }),

  createContact: (payload: {
    fullName: string;
    phoneNumber: string;
    position: string;
  }) =>
    doFetch("/contacts/createContact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateContact: (id: string, payload: object) =>
    doFetch(`/contacts/updateContact/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteContact: (id: string) =>
    doFetch(`/contacts/deleteContact?id=${id}`, {
      method: "DELETE",
    }),

  // ================= GROUPS =================
  getGroups: () =>
    doFetch("/groups/groupAll", {
      method: "GET",
    }),

  createGroup: (payload: { groupName: string }) =>
    doFetch("/groups/createGroup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateGroup: (id: string, payload: object) =>
    doFetch(`/groups/updateGroup/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteGroup: (id: string) =>
    doFetch(`/groups/deleteGroup?id=${id}`, {
      method: "DELETE",
    }),

  // ================= SMS =================
  sendSMS: (payload: {
    message: string;
    contactIds?: string[];
    groupIds?: string[];
  }) =>
    doFetch("/messages/send", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getSmsHistory: () =>
    doFetch("/messages/history", {
      method: "GET",
    }),
};