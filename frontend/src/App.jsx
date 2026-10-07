import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

function Menu({ cart, setCart }) {
  const [foods, setFoods] = useState([]);
  const [q, setQ] = useState('');
  const [diet, setDiet] = useState('all');

  useEffect(() => {
    fetch(`/api/foods?q=${q}&diet=${diet}`).then(r => r.json()).then(setFoods);
  }, [q, diet]);

  const add = (id) => setCart({ ...cart, [id]: (cart[id] || 0) + 1 });

  return (
    <>
      <div className="bar">
        <input placeholder="Search dishes..." value={q} onChange={e => setQ(e.target.value)} />
        <select value={diet} onChange={e => setDiet(e.target.value)}>
          <option value="all">All</option><option value="veg">Veg</option>
          <option value="non-veg">Non-veg</option><option value="vegan">Vegan</option>
        </select>
      </div>
      <div className="grid">
        {foods.map(f => (
          <div className="card" key={f.id}>
            <div className="icon">{f.icon}</div>
            <h3>{f.name}</h3>
            <p>by {f.chef} | {f.diet}</p>
            <p>Rating {f.rating} | Rs.{f.price}</p>
            <button onClick={() => add(f.id)}>Add to cart</button>
          </div>
        ))}
      </div>
    </>
  );
}

function Cart({ cart, setCart }) {
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState('');
  const [pay, setPay] = useState('cod');
  const [done, setDone] = useState(null);

  useEffect(() => { fetch('/api/foods').then(r => r.json()).then(setFoods); }, []);

  const items = foods.filter(f => cart[f.id]);
  const subtotal = items.reduce((s, f) => s + f.price * cart[f.id], 0);
  const delivery = pay === 'cod' && subtotal ? 35 : 0;
  const tax = Math.round(subtotal * 0.05);

  const place = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, paymentMethod: pay, items: items.map(f => ({ id: f.id, qty: cart[f.id] })) })
    });
    const out = await res.json();
    if (res.ok) { setDone(out); setCart({}); } else alert(out.message);
  };

  if (done) return <p className="ok">Order {done.id} placed! Total Rs.{done.total} ({done.status})</p>;
  if (!items.length) return <p>Your cart is empty. Add dishes from the menu.</p>;

  return (
    <div className="panel">
      {items.map(f => (
        <div className="row" key={f.id}>
          <span>{f.icon} {f.name} x{cart[f.id]}</span><b>Rs.{f.price * cart[f.id]}</b>
        </div>
      ))}
      <div className="row"><span>Delivery</span><span>Rs.{delivery}</span></div>
      <div className="row"><span>GST (5%)</span><span>Rs.{tax}</span></div>
      <div className="row total"><span>Total</span><b>Rs.{subtotal + delivery + tax}</b></div>
      <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
      <select value={pay} onChange={e => setPay(e.target.value)}>
        <option value="cod">Cash on delivery (+Rs.35)</option>
        <option value="upi">UPI (free delivery)</option>
      </select>
      <button disabled={!name} onClick={place}>Place order</button>
    </div>
  );
}

function Orders() {
  const [rows, setRows] = useState([]);
  useEffect(() => { fetch('/api/orders').then(r => r.json()).then(setRows); }, []);
  return (
    <table>
      <thead><tr><th>ID</th><th>Name</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>
        {rows.map(o => (
          <tr key={o.id}><td>{o.id}</td><td>{o.name}</td><td>{o.items.join(', ')}</td>
              <td>Rs.{o.total}</td><td>{o.status}</td></tr>
        ))}
        {!rows.length && <tr><td colSpan="5">No orders yet</td></tr>}
      </tbody>
    </table>
  );
}

export default function App() {
  const [cart, setCart] = useState({});
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  return (
    <BrowserRouter>
      <header>
        <h1>Rasoi</h1>
        <nav>
          <NavLink to="/" end>Menu</NavLink>
          <NavLink to="/cart">Cart ({count})</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Menu cart={cart} setCart={setCart} />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
