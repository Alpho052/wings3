import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

function Dashboard() {
  const [overview, setOverview] = useState({ totalStock: 0, totalRevenue: 0, totalSales: 0, products: [] });
  const [sales, setSales] = useState([]);
  const [error, setError] = useState(null); // Add error state for debugging

  useEffect(() => {
    fetchOverview();
    fetchSales();
  }, []);

  const fetchOverview = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/overview`)
      .then(res => {
        console.log('Overview fetched:', res.data);
        setOverview(res.data);
      })
      .catch(err => {
        console.error('Error fetching overview:', err);
        setError('Failed to load dashboard data. Check backend.');
      });
  };

  const fetchSales = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/sales`)
      .then(res => {
        console.log('Sales fetched:', res.data);
        setSales(res.data);
      })
      .catch(err => {
        console.error('Error fetching sales:', err);
        setError('Failed to load sales data. Check backend.');
      });
  };

  // Calculate best-selling product based on total quantity sold
  const bestSelling = sales.reduce((best, current) => {
    const currentTotal = sales.filter(s => s.productName === current.productName).reduce((sum, s) => sum + s.quantity, 0);
    const bestTotal = best ? sales.filter(s => s.productName === best.productName).reduce((sum, s) => sum + s.quantity, 0) : 0;
    return currentTotal > bestTotal ? current : best;
  }, null);

  if (error) return <Typography color="error">{error}</Typography>; // Error boundary

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome to Wings Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Available Stock</Typography>
              <Typography variant="h4">{overview.totalStock}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Total Revenue</Typography>
              <Typography variant="h4">M {overview.totalRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Total Sales</Typography>
              <Typography variant="h4">{overview.totalSales}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Best Selling</Typography>
              <Typography variant="h4">
                {bestSelling ? `${bestSelling.productName} (Qty: ${sales.filter(s => s.productName === bestSelling.productName).reduce((sum, s) => sum + s.quantity, 0)})` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Product Menu</Typography>
      <Grid container spacing={3}>
        {overview.products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card className="card">
              <CardMedia
                component="img"
                height="140"
                image={product.imageUrl || 'placeholder.jpg'} // Fallback to placeholder if no imageUrl
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>Price: M {(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</Typography>
                <Typography>Left: {product.quantity}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
