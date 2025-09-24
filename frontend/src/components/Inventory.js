import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Box, Typography, Card, CardContent } from '@mui/material';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]); // To calculate available stock
  const [error, setError] = useState(null); // Add error state for debugging

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/inventory`)
      .then(res => {
        console.log('Inventory fetched:', res.data); // Debug log
        setInventory(res.data);
      })
      .catch(err => {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory. Check backend.');
      });
  };

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

  const handleEdit = (entry) => {
    const newQuantity = prompt(`Enter new quantity for ${entry.productName} (current: ${entry.quantity}):`);
    if (newQuantity !== null && !isNaN(newQuantity)) {
      // For simplicity, we'll just log this intent; actual edit would require backend support
      console.log('Edit intent:', { ...entry, quantity: Number(newQuantity) });
      setError('Editing inventory transactions is not fully implemented. Contact support.');
    }
  };

  const handleDelete = (index) => {
    if (window.confirm(`Are you sure you want to delete this inventory entry for ${inventory[index].productName}?`)) {
      // For simplicity, we'll remove from state locally; actual delete requires backend support
      const newInventory = [...inventory];
      newInventory.splice(index, 1);
      setInventory(newInventory);
      setError('Deleting inventory transactions is not fully implemented. Contact support.');
    }
  };

  if (error) return <Typography color="error">{error}</Typography>; // Error boundary

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Inventory Management</Typography>
      
      {/* Available Stock Summary at the Top */}
      <Typography variant="h5" gutterBottom>Available Stock</Typography>
      {products.length > 0 ? (
        products.map(product => (
          <Card key={product.id} className="card" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{product.name}</Typography>
              <Typography>Quantity: {product.quantity}</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No products available.</Typography>
      )}

      {/* Inventory Transactions Table with Edit/Delete */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Inventory Transactions</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Quantity Changed</TableCell>
            <TableCell>Previous Stock</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventory.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(entry.date).toLocaleString()}</TableCell>
              <TableCell>{entry.productName}</TableCell>
              <TableCell>{entry.type}</TableCell>
              <TableCell>{entry.quantity}</TableCell>
              <TableCell>{entry.previousQuantity}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(entry)}>Edit</Button>
                <Button onClick={() => handleDelete(index)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default Inventory;
