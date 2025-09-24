import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Snackbar, Alert } from '@mui/material';

function Reporting() {
  const [reporting, setReporting] = useState({ sales: [], totalRevenue: 0, lowStock: [] });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    console.log('Attempting to fetch reporting data...'); // Start of fetch log
    axios.get(`${process.env.REACT_APP_API_URL}/reporting`)
      .then(res => {
        console.log('Raw API response:', res.data); // Log raw response
        const data = res.data || {};
        const sales = Array.isArray(data.sales) ? data.sales : [];
        const totalRevenue = typeof data.totalRevenue === 'number' ? data.totalRevenue : 0;
        const lowStock = Array.isArray(data.lowStock) ? data.lowStock : [];
        console.log('Processed data:', { sales, totalRevenue, lowStock }); // Log processed data
        setReporting({ sales, totalRevenue, lowStock });
        if (lowStock.length > 0) setOpenSnackbar(true);
      })
      .catch(err => {
        console.error('API error details:', err.message); // Log error details
        setError(`Failed to load reporting data: ${err.message}. Check backend or network.`);
      })
      .finally(() => {
        console.log('Fetch completed.'); // End of fetch log
        setLoading(false);
      });
  }, []);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  if (loading) return <Typography>Loading reporting data...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reporting</Typography>
      {reporting.sales.length === 0 && reporting.lowStock.length === 0 ? (
        <Typography>No reporting data available.</Typography>
      ) : (
        <>
          <Typography variant="h6">Total Revenue: M {reporting.totalRevenue.toFixed(2)}</Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Sales History</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Quantity Sold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reporting.sales.map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                  <TableCell>{sale.productName || 'N/A'}</TableCell>
                  <TableCell>{sale.quantity || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Low Stock Products</Typography>
          <ul>
            {reporting.lowStock.map(product => (
              <li key={product.id} className="low-stock">{product.name} - Quantity: {product.quantity}</li>
            ))}
          </ul>
        </>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
          Low stock alert! Check reporting for details.
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Reporting;
