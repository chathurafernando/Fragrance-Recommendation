import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Spinner, Alert } from 'react-bootstrap';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || null;
      console.log("User Id", userId);

      if (!userId) {
        setError('User is not logged in.');
        setLoading(false);
        return;
      }

      setVendorId(userId);
    } catch (e) {
      setError('Failed to read user info.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!vendorId) return;

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`/products/${vendorId}`);
        setProducts(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load products.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendorId]);

  return (
    <div className="mt-4">
      <h3>Your Products</h3>

      {loading && <Spinner animation="border" variant="primary" />}

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {/* Products Grid */}
      <div className="row mt-4">
        {products.map((product) => (
          <div className="col-12 col-md-6 col-lg-4 mb-4" key={product.id}>
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={product.fragrance?.image} 
                style={{ height: '200px', objectFit: 'cover' }} 
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{product.fragrance?.name}</Card.Title>
                <Card.Text className="flex-grow-1">
                  <strong>Type:</strong> {product.fragrance?.type} <br />
                  <strong>Price:</strong> ${product.price}
                </Card.Text>
                <div>
                  <span className="badge bg-success">Active</span>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* No Products */}
      {(!loading && products.length === 0 && !error) && (
        <p className="text-muted">You have not added any products yet.</p>
      )}
    </div>
  );
};

export default ProductGrid;
