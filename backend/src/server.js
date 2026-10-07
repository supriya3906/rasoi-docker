import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Short sample of the Rasoi catalog (chefs + dishes)
const chefs = [
  { id: 'c1', name: 'Meenakshi Sundaram', city: 'Madurai',  cuisine: 'South Indian', rating: 4.8 },
  { id: 'c2', name: 'Harpreet Kaur',      city: 'Ludhiana', cuisine: 'Punjabi',      rating: 4.9 },
  { id: 'c3', name: 'Ayesha Begum',       city: 'Hyderabad', cuisine: 'Hyderabadi',  rating: 4.9 }
];
const foods = [
  { id: 'f01', name: 'Dal & Ghee Phulka Thali',     category: 'lunch',  chefId: 'c2', icon: '🍛', price: 180, rating: 4.9, diet: 'veg' },
  { id: 'f02', name: 'South Indian Veg Thali',      category: 'lunch',  chefId: 'c1', icon: '🍱', price: 170, rating: 4.7, diet: 'veg' },
  { id: 'f03', name: 'Punjabi Rajma Chawal',        category: 'lunch',  chefId: 'c2', icon: '🍚', price: 150, rating: 4.8, diet: 'veg' },
  { id: 'f04', name: 'Butter Chicken (Home-style)', category: 'dinner', chefId: 'c3', icon: '🍗', price: 240, rating: 4.9, diet: 'non-veg' },
  { id: 'f07', name: 'Claypot Paneer Dum Biryani',  category: 'dinner', chefId: 'c3', icon: '🍲', price: 230, rating: 4.9, diet: 'veg' },
  { id: 'f08', name: 'Hyderabadi Chicken Biryani',  category: 'dinner', chefId: 'c3', icon: '🍚', price: 260, rating: 4.9, diet: 'non-veg' },
  { id: 'f09', name: 'Lemon Coconut Rice',          category: 'lunch',  chefId: 'c1', icon: '🍋', price: 120, rating: 4.5, diet: 'vegan' },
  { id: 'f10', name: 'Butter Garlic Naan (2 pc)',   category: 'dinner', chefId: 'c2', icon: '🫓', price: 60,  rating: 4.7, diet: 'veg' }
];
const orders = [];

// Same pricing rules as Rasoi: 5% GST on food, Rs.35 delivery only for cash on delivery
const DELIVERY_FEE = 35, TAX_RATE = 0.05;

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'Rasoi API' }));

app.get('/api/chefs', (req, res) => res.json(chefs));

app.get('/api/foods', (req, res) => {
  const { q = '', diet = 'all' } = req.query;
  const list = foods
    .filter(f => (diet === 'all' || f.diet === diet) && f.name.toLowerCase().includes(String(q).toLowerCase()))
    .map(f => ({ ...f, chef: chefs.find(c => c.id === f.chefId).name }));
  res.json(list);
});

app.get('/api/orders', (req, res) => res.json(orders));

app.post('/api/orders', (req, res) => {
  const { items = [], paymentMethod = 'cod', name } = req.body;
  if (!name || !items.length) return res.status(400).json({ message: 'name and items are required' });
  const lines = items.map(i => ({ food: foods.find(f => f.id === i.id), qty: Number(i.qty) || 1 }));
  if (lines.some(l => !l.food)) return res.status(400).json({ message: 'Unknown dish in cart' });

  const subtotal = lines.reduce((s, l) => s + l.food.price * l.qty, 0);
  const delivery = paymentMethod === 'cod' ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const order = {
    id: `RS${1000 + orders.length + 1}`, name, paymentMethod,
    items: lines.map(l => `${l.food.name} x${l.qty}`),
    subtotal, delivery, tax, total: subtotal + delivery + tax, status: 'Preparing'
  };
  orders.unshift(order);
  res.status(201).json(order);
});

app.listen(PORT, () => console.log(`Rasoi API running on http://localhost:${PORT}`));
