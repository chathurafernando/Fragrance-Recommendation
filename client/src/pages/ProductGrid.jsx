import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || null;

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

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/products/${vendorId}/manipulate/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete the product.');
    }
  };


  const ProductCard = ({
    product,
    showFragranceDetails = true,
    showVendorActions = false,
    onDelete
  }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
      if (showFragranceDetails && product.fragrance?.id) {
        navigate(`/user/fragranceDetails/${product.fragrance.id}`);
      }
    };

    return (
      <Card
        className={`h-100 shadow-sm text-center ${showFragranceDetails ? 'cursor-pointer' : ''}`}
        onClick={showFragranceDetails ? handleCardClick : undefined}
      >
        <Card.Img
          variant="top"
          src={product.fragrance?.image}
          style={{
            height: '150px',
            objectFit: 'contain',
            backgroundColor: '#f8f9fa',
            margin: '0 auto'
          }}
        />
        <Card.Body className="d-flex flex-column align-items-center">
          <Card.Title className="fs-6 mb-1">{product.fragrance?.name}</Card.Title>

          {showFragranceDetails && (
            <Card.Text className="text-muted small mb-2">
              {typeof product.fragrance?.brand === 'object'
                ? product.fragrance.brand.name
                : product.fragrance?.brand}
            </Card.Text>
          )}

          <Card.Text className="text-start small w-100 mb-3">
            <strong>Availability:</strong> {product.availability} <br />
            <strong>Price:</strong> ${product.price}<br />
            {product.warranty && <><strong>Warranty:</strong> {product.warranty}</>}
          </Card.Text>

          {showFragranceDetails && !showVendorActions && (
            <Button variant="info" size="sm">
              Find out more
            </Button>
          )}

          {showVendorActions && (
            <div className="d-flex justify-content-between w-100 gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="flex-grow-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/vendor/edit-products/${product.id}`);
                }}
              >
                <FaEdit className="me-1" /> Edit
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="flex-grow-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
              >
                <FaTrash className="me-1" /> Delete
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="mt-4">
      <h3>Your Products</h3>

      {loading && <Spinner animation="border" variant="primary" />}

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <div className="row mt-4">
        {products.map((product) => (
          <div className="col-12 col-md-6 col-lg-4 mb-4" key={product.id}>

            <ProductCard
              product={product}
              showFragranceDetails={false}
              showVendorActions={true}
              onDelete={handleDelete}
            />

          </div>
        ))}
      </div>

      {(!loading && products.length === 0 && !error) && (
        <p className="text-muted">You have not added any products yet.</p>
      )}
    </div>
  );
};

export default ProductGrid;
