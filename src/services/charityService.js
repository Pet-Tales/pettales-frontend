import { API_BASE_URL } from "@/utils/constants";

const base = API_BASE_URL || "http://127.0.0.1:3000";

const jsonHeaders = { "Content-Type": "application/json" };

const CharityService = {
  // Public
  listEnabled: async () => {
    const res = await fetch(`${base}/api/charities`, { credentials: "include" });
    return res.json();
  },
  // Admin
  listAll: async () => {
    const res = await fetch(`${base}/api/charities/admin`, { credentials: "include" });
    return res.json();
  },
  create: async (payload) => {
    const res = await fetch(`${base}/api/charities/admin`, {
      method: "POST",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  update: async (id, payload) => {
    const res = await fetch(`${base}/api/charities/admin/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  remove: async (id) => {
    const res = await fetch(`${base}/api/charities/admin/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.json();
  },
  toggle: async (id) => {
    const res = await fetch(`${base}/api/charities/admin/${id}/toggle`, {
      method: "PATCH",
      credentials: "include",
    });
    return res.json();
  },
};

export default CharityService;

