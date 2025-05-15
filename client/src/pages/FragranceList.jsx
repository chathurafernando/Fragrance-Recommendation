import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const FragranceList = () => {
  const [fragrances, setFragrances] = useState([]);
  const [brands, setBrands] = useState([]);

  const [brandId, setBrandId] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingFragrances, setLoadingFragrances] = useState(false);

  const [topBanner, setTopBanner] = useState(null);
const navigate = useNavigate(); // init navigation
  // ✅ Fetch brands (method)
  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await axios.get('/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // ✅ Fetch fragrances (method)
  const fetchFragrances = async () => {
    setLoadingFragrances(true);
    try {
      const params = {};
      if (brandId) params.brandId = brandId;
      if (availability) params.availability = availability;
      if (sortBy) params.sortBy = sortBy;

      const response = await axios.get('/fragrances/filter', { params });
      setFragrances(response.data);
    } catch (error) {
      console.error('Error fetching fragrances', error);
    } finally {
      setLoadingFragrances(false);
    }
  };

  // ✅ Fetch top banner
  const fetchTopBanner = async () => {
    try {
      const res = await axios.get('/advertisement/promotion/PerfumeExplorer_Top');
      setTopBanner(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch top banner:', err);
    }
  };

  // 🔥 useEffect only calls method
  useEffect(() => {
    fetchBrands();
    fetchTopBanner();
  }, []);

  useEffect(() => {
    fetchFragrances();
  }, [brandId, availability, sortBy]);

  return (
    <Container>
      <h2 className="my-4">Fragrance Collection</h2>

      {/* 🔥 Top Banner */}
      {topBanner && (
        <div className="mb-4">
          <img
            src={topBanner.bannerUrl}
            alt={topBanner.description}
            style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="">All Availability</option>
            <option value="In stock">In Stock</option>
            <option value="Out of stock">Out of Stock</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Default Sort</option>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button variant="secondary" onClick={() => {
            setBrandId('');
            setAvailability('');
            setSortBy('');
          }}>Reset Filters</Button>
        </Col>
      </Row>

      {/* 🔄 Loading Spinner */}
      {(loadingBrands || loadingFragrances) && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Cards */}
      <Row>
        {fragrances.map((fragrance) => (
          <Col key={fragrance.id} md={4} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={fragrance.image || 'https://via.placeholder.com/300x200'}
                style={{ width: '100%', height: '250px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{fragrance.name}</Card.Title>
                <Card.Text>
                  Brand ID: {fragrance.bid} <br />
                  Created At: {new Date(fragrance.createdAt).toLocaleDateString()}
                </Card.Text>
                 <Button
                      variant="info"
                      onClick={() => navigate(`/user/fragranceDetails/${fragrance.id}`)}
                    >
                      Find out more
                    </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FragranceList;
