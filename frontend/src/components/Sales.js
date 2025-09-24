import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Box, Typography } from '@mui/material';

function Sales() {
  const [products, setProducts] = useState([]);
  const [saleForm, setSaleForm] = useState({ productName: '', quantity: 1 });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/products')
      .then(res => {
        console.log('Products fetched:', res.data);
        setProducts(res.data.filter(product => product.quantity > 0));
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Check backend.');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaleForm({ ...saleForm, [name]: value });
  };

  const handleSell = () => {
    axios.post('http://localhost:5000/sales', saleForm)
      .then(() => {
        setSaleForm({ productName: '', quantity: 1 });
        fetchProducts();
      })
      .catch(err => {
        console.error('Error recording sale:', err);
        setError('Failed to record sale. Check product name and stock.');
      });
  };

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sales Management</Typography>
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Product Name</InputLabel>
          <Select
            name="productName"
            value={saleForm.productName}
            onChange={handleChange}
            label="Product Name"
            disabled={products.length === 0}
          >
            {products.map(product => (
              <MenuItem key={product.id} value={product.name}>
                {product.name} (Stock: {product.quantity})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={saleForm.quantity}
          onChange={handleChange}
          inputProps={{ min: 1 }}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleSell} disabled={!saleForm.productName || saleForm.quantity <= 0 || products.length === 0}>
          Record Sale
        </Button>
      </Box>
    </Box>
  );
}

export default Sales;