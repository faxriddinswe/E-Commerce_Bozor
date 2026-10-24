// Savat holati: localStorage'da saqlanadi, o'zgarganda obunachilarga xabar beradi.
let items = [];
try { items = JSON.parse(localStorage.getItem("cart")) || []; } catch { items = []; }
const listeners = new Set();

const commit = () => {
  localStorage.setItem("cart", JSON.stringify(items));
  listeners.forEach((fn) => fn(items));
};

export const cart = {
  get items() { return items; },
  get count() { return items.reduce((s, i) => s + i.qty, 0); },
  get total() { return items.reduce((s, i) => s + i.qty * i.price, 0); },
  subscribe(fn) { listeners.add(fn); fn(items); },
  add(p) {
    const found = items.find((i) => i.id === p.id);
    if (found) found.qty = Math.min(found.qty + 1, Math.min(20, p.stock));
    else items.push({ id: p.id, name: p.name, price: p.price, emoji: p.emoji, stock: p.stock, qty: 1 });
    commit();
  },
  setQty(id, qty) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    if (qty < 1) items = items.filter((i) => i.id !== id);
    else it.qty = Math.min(qty, it.stock, 20);
    commit();
  },
  remove(id) { items = items.filter((i) => i.id !== id); commit(); },
  clear() { items = []; commit(); },
};
