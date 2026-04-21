const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.8.222:2002";

async function doFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers.Authorization = token;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

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

// Простейший кеш: для каждого GET-ключа храним Promise.
// Первый вызов запускает fetch, остальные — возвращают тот же Promise.
// Мутации вызывают invalidate() и сбрасывают ключи.
const cache = new Map<string, Promise<any>>();

function getCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing) return existing as Promise<T>;
  const p = loader().catch((e) => {
    cache.delete(key);
    throw e;
  });
  cache.set(key, p);
  return p;
}

function invalidate(...keys: string[]) {
  if (keys.length === 0) {
    cache.clear();
    return;
  }
  for (const k of keys) cache.delete(k);
}

export const api = {
  clearCache: () => invalidate(),

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

  getContacts: () =>
    getCached("contacts", () => doFetch("/contacts/contactAll")),

  createContact: async (payload: {
    fullName: string;
    phoneNumber: string;
    position: string;
  }) => {
    const r = await doFetch("/contacts/createContact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    invalidate("contacts", "groups");
    return r;
  },

  updateContact: async (id: string, payload: object) => {
    const r = await doFetch(`/contacts/updateContact/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    invalidate("contacts", "groups");
    return r;
  },

  deleteContact: async (id: string) => {
    const r = await doFetch(`/contacts/deleteContact?id=${id}`, {
      method: "DELETE",
    });
    invalidate("contacts", "groups");
    return r;
  },

  getGroups: () => getCached("groups", () => doFetch("/groups/groupAll")),

  createGroup: async (payload: { groupName: string }) => {
    const r = await doFetch("/groups/createGroup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    invalidate("groups");
    return r;
  },

  updateGroup: async (id: string, payload: object) => {
    const r = await doFetch(`/groups/updateGroup/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    invalidate("groups");
    return r;
  },

  deleteGroup: async (id: string) => {
    const r = await doFetch(`/groups/deleteGroup/${id}`, { method: "DELETE" });
    invalidate("groups", "contacts");
    return r;
  },

  addContactsToGroup: async (groupId: string, contactIds: string[]) => {
    const r = await doFetch(`/groups/addContacts/${groupId}`, {
      method: "POST",
      body: JSON.stringify({ contactIds }),
    });
    invalidate("groups");
    return r;
  },

  removeContactsFromGroup: async (groupId: string, contactIds: string[]) => {
    const r = await doFetch(`/groups/removeContacts/${groupId}`, {
      method: "POST",
      body: JSON.stringify({ contactIds }),
    });
    invalidate("groups");
    return r;
  },

  sendSMS: async (payload: {
    message: string;
    contactIds?: string[];
    groupIds?: string[];
  }) => {
    const r = await doFetch("/messages/send", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    invalidate("sms:all", "groups");
    return r;
  },

  getSmsHistory: () =>
    getCached("sms:all", () => doFetch("/messages/history?date=all")),
};
