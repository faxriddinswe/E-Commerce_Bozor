import { api, setToken, hasToken } from "./api.js";
import { cart } from "./cart.js";

const $ = (s) => document.querySelector(s);
const money = (n) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const state = { q: "", category: "", sort: "new", user: null, products: [] };

function toast(msg, type = "") {
  const t = Object.assign(document.createElement("div"), { className: `toast ${type}`, textContent: msg });
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 3200);
}

/* ---------- Katalog ---------- */
async function loadChips() {
  const cats = ["", ...(await api.categories())];
  $("#chips").innerHTML = cats
    .map((c) => `<button class="chip ${c === state.category ? "active" : ""}" data-cat="${esc(c)}">${c || "Hammasi"}</button>`)
    .join("");
}

async function loadProducts() {
  $("#grid").innerHTML = '<div class="skeleton"></div>'.repeat(4);
  try {
    state.products = await api.products({ q: state.q, category: state.category, sort: state.sort });
  } catch (e) {
    $("#grid").innerHTML = `<p class="empty">${esc(e.message)}</p>`;
    return;
  }
  $("#grid").innerHTML = state.products.length
    ? state.products.map(card).join("")
    : '<p class="empty">Hech narsa topilmadi. Boshqa so\'z bilan qidirib ko\'ring.</p>';
}

const card = (p) => `
  <article class="card">
    <div class="pic" style="--h:${(p.id * 47) % 360}">${p.emoji}${p.stock > 0 && p.stock < 15 ? `<span class="tag">${p.stock} ta qoldi</span>` : ""}</div>
    <div class="info">
      <h3>${esc(p.name)}</h3>
      <p class="desc">${esc(p.description)}</p>
      <span class="rate">★ ${p.rating.toFixed(1)}</span>
      <div class="buy">
        <span class="price">${money(p.price)}</span>
        <button class="add" data-add="${p.id}" ${p.stock ? "" : "disabled"}>${p.stock ? "Savatga" : "Tugagan"}</button>
      </div>
    </div>
  </article>`;

/* ---------- Savat ---------- */
function renderCart() {
  $("#cartCount").textContent = cart.count;
  $("#cartTotal").textContent = money(cart.total);
  $("#checkoutBtn").disabled = !cart.count;
  $("#cartItems").innerHTML = cart.count
    ? cart.items.map((i) => `
      <div class="line">
        <div class="ic">${i.emoji}</div>
        <div><strong>${esc(i.name)}</strong><br><small>${money(i.price)}</small>
          <div class="qty"><button data-dec="${i.id}" aria-label="Kamaytirish">−</button><span>${i.qty}</span><button data-inc="${i.id}" aria-label="Ko'paytirish">+</button></div>
        </div>
        <button class="rm" data-rm="${i.id}">O'chirish</button>
      </div>`).join("")
    : '<p class="empty">Savat bo\'sh. Katalogdan mahsulot tanlang.</p>';
}

const toggleDrawer = (on) => {
  $("#drawer").classList.toggle("on", on);
  $("#overlay").classList.toggle("on", on);
};

/* ---------- Modal ---------- */
const openModal = (html) => { $("#modalBox").innerHTML = html; $("#modal").classList.add("on"); $("#modalBox").querySelector("input,button")?.focus(); };
const closeModal = () => $("#modal").classList.remove("on");

function authModal(mode = "login") {
  const reg = mode === "register";
  openModal(`
    <h2>${reg ? "Ro'yxatdan o'tish" : "Kirish"}</h2>
    <div class="tabs"><button data-tab="login" class="${reg ? "" : "on"}">Kirish</button><button data-tab="register" class="${reg ? "on" : ""}">Ro'yxatdan o'tish</button></div>
    <form id="authForm" novalidate>
      ${reg ? '<label class="field">Ismingiz<input name="name" required minlength="2"></label>' : ""}
      <label class="field">Email<input name="email" type="email" required></label>
      <label class="field">Parol<input name="password" type="password" required minlength="6"></label>
      <p class="err" id="formErr"></p>
      <button class="btn accent wide">${reg ? "Hisob yaratish" : "Kirish"}</button>
    </form>`);
  $("#authForm").onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      const res = await (reg ? api.register(body) : api.login(body));
      setToken(res.access_token);
      state.user = res.user;
      renderAuth();
      closeModal();
      toast(`Xush kelibsiz, ${res.user.name}!`);
    } catch (err) { $("#formErr").textContent = err.message; }
  };
}

function checkoutModal() {
  openModal(`
    <h2>Buyurtmani tasdiqlash</h2>
    <p style="margin-bottom:14px">${cart.count} ta mahsulot · <strong>${money(cart.total)}</strong></p>
    <form id="orderForm">
      <label class="field">Yetkazib berish manzili<input name="address" required minlength="5" placeholder="Shahar, ko'cha, uy"></label>
      <p class="err" id="formErr"></p>
      <button class="btn accent wide">Buyurtma berish</button>
    </form>`);
  $("#orderForm").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const order = await api.createOrder({
        address: new FormData(e.target).get("address"),
        items: cart.items.map((i) => ({ product_id: i.id, qty: i.qty })),
      });
      cart.clear(); closeModal(); toggleDrawer(false); loadProducts();
      toast(`Buyurtma #${order.id} qabul qilindi`);
    } catch (err) { $("#formErr").textContent = err.message; }
  };
}

async function ordersModal() {
  try {
    const orders = await api.myOrders();
    openModal(`<h2>Buyurtmalarim</h2>` + (orders.length ? orders.map((o) => `
      <div class="order">
        <header><span>#${o.id} · ${new Date(o.created_at + "Z").toLocaleDateString("uz-UZ")}</span><span class="badge">${esc(o.status)}</span></header>
        <p>${o.items.map((i) => `${esc(i.name)} ×${i.qty}`).join(", ")}</p>
        <strong>${money(o.total)}</strong>
      </div>`).join("") : '<p class="empty">Hali buyurtma bermagansiz.</p>')
      + '<button class="btn ghost wide" id="logoutBtn" style="margin-top:16px">Chiqish</button>');
    $("#logoutBtn").onclick = () => { setToken(null); state.user = null; renderAuth(); closeModal(); toast("Tizimdan chiqdingiz"); };
  } catch (e) { toast(e.message, "err"); }
}

function renderAuth() { $("#authBtn").textContent = state.user ? state.user.name.split(" ")[0] : "Kirish"; }

/* ---------- Hodisalar ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-cat],[data-add],[data-inc],[data-dec],[data-rm],[data-tab],[data-close]");
  if (!t) return;
  const d = t.dataset;
  if (d.cat !== undefined) { state.category = d.cat; loadChips(); loadProducts(); }
  else if (d.add) {
    cart.add(state.products.find((p) => p.id == d.add));
    $("#cartBtn").classList.remove("bump"); void $("#cartBtn").offsetWidth; $("#cartBtn").classList.add("bump");
    toast("Savatga qo'shildi");
  }
  else if (d.inc) cart.setQty(+d.inc, cart.items.find((i) => i.id == d.inc).qty + 1);
  else if (d.dec) cart.setQty(+d.dec, cart.items.find((i) => i.id == d.dec).qty - 1);
  else if (d.rm) cart.remove(+d.rm);
  else if (d.tab) authModal(d.tab);
  else if ("close" in d) toggleDrawer(false);
});

$("#cartBtn").onclick = () => toggleDrawer(true);
$("#overlay").onclick = () => toggleDrawer(false);
$("#modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); toggleDrawer(false); } });
$("#authBtn").onclick = () => (state.user ? ordersModal() : authModal());
$("#checkoutBtn").onclick = () => (state.user ? checkoutModal() : (toast("Avval tizimga kiring", "err"), authModal()));
$("#sort").onchange = (e) => { state.sort = e.target.value; loadProducts(); };
let timer;
$("#search").oninput = (e) => { clearTimeout(timer); timer = setTimeout(() => { state.q = e.target.value.trim(); loadProducts(); }, 300); };

/* ---------- Boshlash ---------- */
cart.subscribe(renderCart);
(async () => {
  if (hasToken()) { try { state.user = await api.me(); } catch { setToken(null); } }
  renderAuth();
  await Promise.all([loadChips(), loadProducts()]);
})();
