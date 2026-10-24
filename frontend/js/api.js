const BASE = "/api";
let token = localStorage.getItem("token");

export const hasToken = () => !!token;
export function setToken(t) {
  token = t;
  t ? localStorage.setItem("token", t) : localStorage.removeItem("token");
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data.detail;
    throw new Error(typeof d === "string" ? d : "Ma'lumotlarni tekshirib qayta urinib ko'ring");
  }
  return data;
}

export const api = {
  products: (params) => request("/products?" + new URLSearchParams(params)),
  categories: () => request("/products/categories"),
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  me: () => request("/auth/me"),
  createOrder: (body) => request("/orders", { method: "POST", body }),
  myOrders: () => request("/orders"),
};
