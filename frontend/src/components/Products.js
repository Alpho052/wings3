import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Typography } from '@mui/material';

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: 0, quantity: 0, imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null); // Add error state for debugging

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/products`)
      .then(res => {
        console.log('Products fetched:', res.data); // Debug log
        setProducts(res.data);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Check backend.');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price' || name === 'quantity') {
      // Convert to number and allow decimal input
      const numericValue = value === '' ? 0 : Number(value);
      setForm({ 
        ...form, 
        [name]: name === 'price' ? numericValue : numericValue // Price will be formatted on blur or submit
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      const numericValue = value === '' ? 0 : Number(value);
      setForm(prev => ({
        ...prev,
        [name]: Number(numericValue.toFixed(2)) // Enforce 0.00 format on blur
      }));
    }
  };

  const handleSubmit = () => {
    const formattedForm = { ...form, price: Number(form.price.toFixed(2)) }; // Ensure price is formatted before submission
    if (editingId) {
      axios.put(`${process.env.REACT_APP_API_URL}/products/${editingId}`, formattedForm)
        .then(fetchProducts)
        .catch(err => setError('Failed to update product.'));
      setEditingId(null);
    } else {
      axios.post(`${process.env.REACT_APP_API_URL}/products`, formattedForm)
        .then(fetchProducts)
        .catch(err => setError('Failed to add product.'));
    }
    setForm({ name: '', description: '', category: '', price: 0, quantity: 0, imageUrl: '' });
  };

  const handleEdit = (product) => {
    // Format price with 2 decimals when editing
    setForm({ ...product, price: Number(product.price.toFixed(2)) });
    setEditingId(product.id);
  };

  const handleDelete = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`)
      .then(fetchProducts)
      .catch(err => setError('Failed to delete product.'));
  };

  if (error) return <Typography color="error">{error}</Typography>; // Error boundary

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Product Management</Typography>
      <Box component="form" sx={{ mb: 4 }}>
        <TextField label="Name" name="name" value={form.name} onChange={handleChange} />
        <TextField label="Description" name="description" value={form.description} onChange={handleChange} />
        <TextField label="Category" name="category" value={form.category} onChange={handleChange} />
        <TextField 
          label="Price (M)" 
          name="price" 
          type="number" 
          value={form.price} 
          onChange={handleChange}
          onBlur={handleBlur} // Apply 0.00 format when focus leaves the field
          inputProps={{ step: "0.01" }} // Allows decimal input
        />
        <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        <TextField label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price (M)</TableCell> {/* Fixed closing tag from <TextCell> to <TableCell> */}
            <TableCell>Quantity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(product)}>Edit</Button>
                <Button onClick={() => handleDelete(product.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default Products;
