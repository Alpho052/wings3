const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const productsPath = path.join(__dirname, 'data/products.json');
const salesPath = path.join(__dirname, 'data/sales.json');
const inventoryPath = path.join(__dirname, 'data/inventory.json');

// Helper functions
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Products Routes
app.get('/products', (req, res) => {
  const products = readJson(productsPath).map(p => ({ ...p, price: Number(p.price) })); // Ensure price is a number
  res.json(products);
});

app.post('/products', (req, res) => {
  const products = readJson(productsPath);
  const newProduct = { ...req.body, id: Date.now().toString(), price: Number(req.body.price) }; // Parse price as number
  products.push(newProduct);
  writeJson(productsPath, products);
  res.json(newProduct);
});

app.put('/products/:id', (req, res) => {
  let products = readJson(productsPath);
  const index = products.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body, price: Number(req.body.price) }; // Parse price as number
    writeJson(productsPath, products);
    res.json(products[index]);
  } else {
    res.status(404).send('Product not found');
  }
});

app.delete('/products/:id', (req, res) => {
  let products = readJson(productsPath);
  products = products.filter(p => p.id !== req.params.id);
  writeJson(productsPath, products);
  res.sendStatus(204);
});

// Sales Routes
app.get('/sales', (req, res) => res.json(readJson(salesPath)));

app.post('/sales', (req, res) => {
  const sales = readJson(salesPath);
  const products = readJson(productsPath).map(p => ({ ...p, price: Number(p.price) })); // Ensure price is a number
  const { productName, quantity } = req.body;
  const product = products.find(p => p.name === productName);
  if (product && product.quantity >= quantity) {
    product.quantity -= quantity;
    writeJson(productsPath, products);
    const newSale = { date: new Date().toISOString(), productName, quantity, price: product.price, revenue: product.price * quantity };
    sales.push(newSale);
    writeJson(salesPath, sales);

    // Update inventory
    const inventory = readJson(inventoryPath);
    inventory.push({ date: new Date().toISOString(), productName, type: 'deduction', quantity, previousQuantity: product.quantity + quantity });
    writeJson(inventoryPath, inventory);

    res.json(newSale);
  } else {
    res.status(400).send('Insufficient stock or product not found');
  }
});

// Inventory Routes (for additions)
app.get('/inventory', (req, res) => res.json(readJson(inventoryPath)));

app.post('/inventory/add', (req, res) => {
  const products = readJson(productsPath).map(p => ({ ...p, price: Number(p.price) })); // Ensure price is a number
  const inventory = readJson(inventoryPath);
  const { productName, quantity } = req.body;
  const product = products.find(p => p.name === productName);
  if (product) {
    const previousQuantity = product.quantity;
    product.quantity += quantity;
    writeJson(productsPath, products);
    inventory.push({ date: new Date().toISOString(), productName, type: 'addition', quantity, previousQuantity });
    writeJson(inventoryPath, inventory);
    res.json({ success: true });
  } else {
    res.status(404).send('Product not found');
  }
});

// Reporting (calculated on the fly)
app.get('/reporting', (req, res) => {
  const sales = readJson(salesPath);
  const products = readJson(productsPath).map(p => ({ ...p, price: Number(p.price) })); // Ensure price is a number
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.revenue, 0);
  const lowStock = products.filter(p => p.quantity < 5); // Threshold for low stock
  res.json({ sales, totalRevenue, lowStock });
});

// Overview for Dashboard
app.get('/overview', (req, res) => {
  const products = readJson(productsPath).map(p => ({ ...p, price: Number(p.price) })); // Ensure price is a number
  const sales = readJson(salesPath);
  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.revenue, 0);
  const totalSales = sales.length;
  res.json({ totalStock, totalRevenue, totalSales, products });
});

app.listen(5000, () => console.log('Server running on port 5000'));