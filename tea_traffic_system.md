# Tea Traffic - Complete System Architecture & Code

## Architecture
- **Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js)
- **Frontend:** React for SPA navigation, JWT for state management (auth), CSS for clean UI.
- **Backend:** Node.js with Express.js for REST API.
- **Database:** MongoDB (Mongoose ODM).
- **Authentication:** JWT-based system handling Order Staff, Chef, and Billing Staff roles.

## Database Schema (MongoDB / Mongoose)
```javascript
// models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['OrderStaff', 'Chef', 'BillingStaff'], required: true }
});
module.exports = mongoose.model('User', UserSchema);

// models/Menu.js
const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Drinks', 'Veg Food', 'Non-Veg Food', 'Snacks', 'Shakes', 'Tea', 'Coffee'] },
  price: { type: Number, required: true }
});
module.exports = mongoose.model('Menu', MenuSchema);

// models/Order.js
const OrderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  items: [
    { name: String, quantity: Number, price: Number }
  ],
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Billed'], default: 'Pending' },
  totalCost: { type: Number, default: 0 }
});
module.exports = mongoose.model('Order', OrderSchema);
```

## API Routes
```javascript
// server.js - Express API setup
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = 'teatraffic_secret_key';

// -- Authentication Logic --
app.post('/api/auth/login', async (req, res) => {
  const { email, password, staticCode, role } = req.body;
  
  if (role === 'Chef' && staticCode !== 'cheff@12') {
    return res.status(403).json({ message: 'Invalid Chef static code' });
  }
  if (role === 'BillingStaff' && staticCode !== 'bill@12') {
    return res.status(403).json({ message: 'Invalid Billing static code' });
  }

  // Find or create user logic... (Simplified for MVP)
  const token = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, role });
});

// -- Order Flow --
// Order Staff: Submit Order
app.post('/api/orders', async (req, res) => {
  const { tableNumber, items } = req.body;
  const totalCost = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const order = new Order({ tableNumber, items, totalCost, status: 'Pending' });
  await order.save();
  res.status(201).json(order);
});

// Chef Dashboard: Get Pending Orders
app.get('/api/orders/chef', async (req, res) => {
  const orders = await Order.find({ status: 'Pending' });
  res.json(orders);
});

// Chef: Accept or Reject
app.patch('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body; // 'Accepted' or 'Rejected'
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(order);
});

// Billing Dashboard: Get Accepted Orders
app.get('/api/orders/billing', async (req, res) => {
  const orders = await Order.find({ status: 'Accepted' });
  res.json(orders);
});

// Billing: Finalize Bill
app.patch('/api/orders/:id/bill', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'Billed' }, { new: true });
  res.json(order);
});

mongoose.connect('mongodb://localhost:27017/teatraffic', () => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});
```

## Frontend Structure
- **App.js:** Maintains global state and React Router Setup.
- **Login.js:** Form for Email, Password, Role, and Static Code.
- **OrderPage.js:** Component for order staff to input table number and add items.
- **ChefDashboard.js:** Polls `/api/orders/chef` and shows Accept/Reject buttons.
- **BillingDashboard.js:** Views updated Accepted orders. Total cost is pre-calculated.

## Full Code (React Frontend MVPs)
```jsx
// src/pages/ChefDashboard.jsx
import React, { useEffect, useState } from 'react';

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders/chef')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const updateStatus = (id, status) => {
    fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(() => {
       if (status === 'Rejected') alert('Item not available right now.');
       setOrders(orders.filter(o => o._id !== id));
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chef Dashboard</h1>
      {orders.map(order => (
        <div key={order._id} className="border p-4 mb-2">
          <p>Table: {order.tableNumber}</p>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>{item.name} x {item.quantity}</li>
            ))}
          </ul>
          <button onClick={() => updateStatus(order._id, 'Accepted')} className="bg-green-500 text-white px-2 py-1 mr-2">Accept</button>
          <button onClick={() => updateStatus(order._id, 'Rejected')} className="bg-red-500 text-white px-2 py-1">Reject</button>
        </div>
      ))}
    </div>
  );
}
```

```jsx
// src/pages/Login.jsx
import React, { useState } from 'react';

export default function Login() {
  const [role, setRole] = useState('OrderStaff');
  const [staticCode, setStaticCode] = useState('');
  // ... other login states (email, password)

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'test@test.com', password: 'pass', role, staticCode })
    }).then(res => {
       if (res.ok) alert('Logged In!');
       else alert('Invalid Login Credits/Static Code');
    });
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <select value={role} onChange={v => setRole(v.target.value)}>
        <option value="OrderStaff">Order Staff</option>
        <option value="Chef">Chef</option>
        <option value="BillingStaff">Billing Staff</option>
      </select>
      {(role === 'Chef' || role === 'BillingStaff') && (
        <input placeholder="Static Code" value={staticCode} onChange={e => setStaticCode(e.target.value)} />
      )}
      <button type="submit" className="bg-blue-600 text-white p-2">Login</button>
    </form>
  );
}
```
