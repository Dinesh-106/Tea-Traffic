// ---------------------------------------------------------------------------
// Tea Traffic — localStorage service (prototype, no backend required)
// ---------------------------------------------------------------------------

const ORDERS_KEY = 'tt_orders';

// Hard-coded staff credentials (for prototype)
const USERS = [
  { email: 'employee@teatraffic.com', password: 'pwd', role: 'OrderStaff' },
  { email: 'chef@teatraffic.com',     password: 'pwd', role: 'Chef',         staticCode: 'cheff@12' },
  { email: 'bill@teatraffic.com',     password: 'pwd', role: 'BillingStaff', staticCode: 'bill@12'  },
];

// ── Auth ──────────────────────────────────────────────────────────────────

export function login({ email, password, role, staticCode }) {
  const user = USERS.find(u => u.email === email && u.role === role);

  if (!user) throw new Error('User not found for this role');
  if (user.password !== password) throw new Error('Invalid credentials');
  if (user.staticCode && user.staticCode !== staticCode)
    throw new Error('Invalid authorization code');

  // Store session
  const token = btoa(`${email}:${role}:${Date.now()}`); // simple fake token
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('email', email);

  return { token, role, email };
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
}

export function getSession() {
  return {
    token: localStorage.getItem('token'),
    role:  localStorage.getItem('role'),
    email: localStorage.getItem('email'),
  };
}

// ── Orders ────────────────────────────────────────────────────────────────

function getAllOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAllOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrders(status = null) {
  const orders = getAllOrders();
  return status ? orders.filter(o => o.status === status) : orders;
}

export function createOrder({ tableNumber, items }) {
  const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    _id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    tableNumber,
    items,
    status: 'Pending',
    totalCost,
    createdAt: new Date().toISOString(),
  };
  const orders = getAllOrders();
  orders.unshift(order);
  saveAllOrders(orders);
  return order;
}

export function updateOrderStatus(id, status) {
  const orders = getAllOrders();
  const idx = orders.findIndex(o => o._id === id);
  if (idx === -1) throw new Error('Order not found');
  orders[idx] = { ...orders[idx], status };
  saveAllOrders(orders);
  return orders[idx];
}
