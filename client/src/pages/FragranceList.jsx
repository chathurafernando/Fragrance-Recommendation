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
  const [search, setSearch] = useState('');

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingFragrances, setLoadingFragrances] = useState(false);

  const [topBanner, setTopBanner] = useState(null);

  // Fetch brands
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

  // Fetch fragrances with filters and search
  const fetchFragrances = async () => {
    setLoadingFragrances(true);
    try {
      const params = {};
      if (brandId) params.brandId = brandId;
      if (availability) params.availability = availability;
      if (sortBy) params.sortBy = sortBy;
      if (search.trim() !== '') params.search = search.trim();

      const response = await axios.get('/fragrances/filter', { params });
      setFragrances(response.data);
    } catch (error) {
      console.error('Error fetching fragrances', error);
    } finally {
      setLoadingFragrances(false);
    }
  };

  // Fetch top banner
  const fetchTopBanner = async () => {
    try {
      const topRes = await axios.get('/advertisement/promotion/PerfumeExplorer_Top');

      // For top banner
      if (topRes?.data && topRes.data.length > 0) {
        const randomTopIndex = Math.floor(Math.random() * topRes.data.length);
        setTopBanner(topRes.data[randomTopIndex]);
      }    } catch (err) {
      console.error('Failed to fetch top banner:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBrands();
    fetchTopBanner();
  }, []);

  // Refetch fragrances when filters change
  useEffect(() => {
    fetchFragrances();
  }, [brandId, availability, sortBy]);

const FragranceCard = ({ fragrance }) => {
  const { name, image, brand, id } = fragrance;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/user/fragranceDetails/${id}`);
  };

  return (
    <Card key={id} className="shadow-sm text-center">
      <Card.Img
        variant="top"
        src={image}
        style={{
          height: '150px',
          objectFit: 'contain',
          backgroundColor: '#f8f9fa',
          margin: '0 auto'
        }}
      />
      <Card.Body className="d-flex flex-column align-items-center">
        <Card.Title className="fs-6 mb-1">{name}</Card.Title>
        <Card.Text className="text-muted small mb-2">
          {typeof brand === 'object' ? brand.name : brand}
        </Card.Text>
        <Button
          variant="info"
          onClick={handleCardClick}
        >
          Find out more
        </Button>
      </Card.Body>
    </Card>
  );
};
  return (
    <Container fluid>
      <h2 className="my-4">Fragrance Collection</h2>

      {/* Top Banner */}
{topBanner && (
        <Card className="mb-4"  style={{ maxHeight: '350px', overflow: 'hidden', borderRadius: '8px' }}>
          <Card.Img
            src={topBanner.bannerUrl}
            alt="Top Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Card>
      )}
      
      {/* Search Bar */}
      <Form className="mb-3" onSubmit={(e) => { e.preventDefault(); fetchFragrances(); }}>
        <Row>
          <Col md={10}>
            <Form.Control
              type="text"
              placeholder="Search fragrances by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Button variant="primary" type="submit" className="w-100">
              Search
            </Button>
          </Col>
        </Row>
      </Form>


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
          <Button
            variant="secondary"
            onClick={() => {
              setBrandId('');
              setAvailability('');
              setSortBy('');
              setSearch('');
              fetchFragrances();
            }}
          >
            Reset Filters
          </Button>
        </Col>
      </Row>

      {/* Loading Spinner */}
      {(loadingBrands || loadingFragrances) && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Fragrance Cards */}
      <Row>
        {fragrances.length === 0 && !loadingFragrances && (
          <div className="text-center w-100">
            <p>No fragrances found for the selected criteria.</p>
          </div>
        )}
        {fragrances.map((fragrance) => (
          <Col key={fragrance.id} md={4} className="mb-4">


            <FragranceCard fragrance={fragrance} />

          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FragranceList;
