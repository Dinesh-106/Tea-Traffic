const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'teatraffic_secret_key';

// --- Models ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['OrderStaff', 'Chef', 'BillingStaff'], required: true }
});
const User = mongoose.model('User', UserSchema);

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Drinks', 'Veg Food', 'Non-Veg Food', 'Snacks', 'Shakes', 'Tea', 'Coffee'] },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true }
});
const Menu = mongoose.model('Menu', MenuSchema);

const OrderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  items: [
    { name: String, quantity: Number, price: Number }
  ],
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Billed'], default: 'Pending' },
  totalCost: { type: Number, default: 0 }
});
const Order = mongoose.model('Order', OrderSchema);

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, staticCode } = req.body;
    if (role === 'Chef' && staticCode !== 'cheff@12') return res.status(403).json({ message: 'Invalid Chef static code' });
    if (role === 'BillingStaff' && staticCode !== 'bill@12') return res.status(403).json({ message: 'Invalid Billing static code' });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role, staticCode } = req.body;
    
    if (role === 'Chef' && staticCode !== 'cheff@12') return res.status(403).json({ message: 'Invalid Chef static code' });
    if (role === 'BillingStaff' && staticCode !== 'bill@12') return res.status(403).json({ message: 'Invalid Billing static code' });
    
    const user = await User.findOne({ email, role });
    if (!user) return res.status(404).json({ message: 'User not found for this role' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Menu Routes ---
app.get('/api/menu', async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed Menu
app.post('/api/menu/seed', async (req, res) => {
  try {
    const count = await Menu.countDocuments();
    if (count === 0) {
      await Menu.insertMany([
        { name: 'Masala Tea', category: 'Tea', price: 20 },
        { name: 'Cold Coffee', category: 'Coffee', price: 50 },
        { name: 'Samosa', category: 'Snacks', price: 15 },
        { name: 'Paneer Tikka', category: 'Veg Food', price: 150 },
        { name: 'Chicken Biryani', category: 'Non-Veg Food', price: 250 },
        { name: 'Oreo Shake', category: 'Shakes', price: 90 },
        { name: 'Lemon Soda', category: 'Drinks', price: 40 }
      ]);
    }
    res.json({ message: 'Menu seeded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Order Routes ---
app.post('/api/orders', async (req, res) => {
  try {
    const { tableNumber, items } = req.body;
    const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = new Order({ tableNumber, items, totalCost });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Server Startup ---
const { MongoMemoryServer } = require('mongodb-memory-server');

async function startServer() {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log('MongoDB Memory Server Connected');
    
    // Seed initial users
    const hashedPassword = await bcrypt.hash('pwd', 10);
    const existingCount = await User.countDocuments();
    if (existingCount === 0) {
      await User.insertMany([
        { email: 'employee@teatraffic.com', password: hashedPassword, role: 'OrderStaff' },
        { email: 'chef@teatraffic.com', password: hashedPassword, role: 'Chef' },
        { email: 'bill@teatraffic.com', password: hashedPassword, role: 'BillingStaff' }
      ]);
      console.log('Database seeded with default users.');
      
      // Seed menu automatically
      await Menu.insertMany([
        { name: 'Masala Tea', category: 'Tea', price: 20 },
        { name: 'Cold Coffee', category: 'Coffee', price: 50 },
        { name: 'Samosa', category: 'Snacks', price: 15 },
        { name: 'Paneer Tikka', category: 'Veg Food', price: 150 },
        { name: 'Chicken Biryani', category: 'Non-Veg Food', price: 250 },
        { name: 'Oreo Shake', category: 'Shakes', price: 90 },
        { name: 'Lemon Soda', category: 'Drinks', price: 40 }
      ]);
      console.log('Menu seeded.');
    }
    
    app.listen(5000, () => console.log('Server running on port 5000'));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
