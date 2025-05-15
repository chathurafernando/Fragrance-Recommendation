import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FragranceCompare = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFragrances, setSelectedFragrances] = useState([]);
  const [compareResults, setCompareResults] = useState([]);
  const [error, setError] = useState('');
  const [topBanner, setTopBanner] = useState(null);
  const [sideBanner, setSideBanner] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const topRes = await axios.get('/advertisement/promotion/ComparePage_Top');
      const sideRes = await axios.get('/advertisement/promotion/ComparePage_Side');
      setTopBanner(topRes?.data[0]);
      setSideBanner(sideRes?.data[0]);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    }
  };

  // Search fragrances
  const handleSearch = async () => {
    try {
      const excludeIds = selectedFragrances.map(f => f.id).join(',');
      const res = await axios.get(`/fragrances/search?q=${searchQuery}&exclude=${excludeIds}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add to selected list
  const handleSelect = (fragrance) => {
    if (selectedFragrances.length >= 3) {
      setError('You can only compare up to 3 fragrances.');
      return;
    }
    setError('');
    setSelectedFragrances([...selectedFragrances, fragrance]);
    setSearchResults(searchResults.filter(f => f.id !== fragrance.id));
  };

  // Remove from selected list
  const handleRemove = (fragrance) => {
    setSelectedFragrances(selectedFragrances.filter(f => f.id !== fragrance.id));
  };

  // Fetch comparison data
  const handleCompare = async () => {
    try {
      const ids = selectedFragrances.map(f => f.id).join(',');
      const res = await axios.get(`/fragrances/compare?ids=${ids}`);
      setCompareResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="mt-4">
      {/* Top Banner */}
      {topBanner && (
        <Card className="mb-4">
          <Card.Img
            src={topBanner.bannerUrl}
            alt="Top Banner"
            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
          />
        </Card>
      )}

      <h2>Fragrance Comparison Tool</h2>

      {/* Search Input */}
      <Form className="my-3" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <Row>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="Search fragrances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col sm={4}>
            <Button variant="primary" type="submit" className="w-100">Search</Button>
          </Col>
        </Row>
      </Form>

      <Row>
        <Col sm={9}>
          {/* Search Results */}
          <Row>
            {searchResults.map(frag => (
              <Col key={frag.id} sm={4} className="mb-3">
                <Card>
                  {frag.image && (
                    <Card.Img
                      variant="top"
                      src={frag.image}
                      alt={frag.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{frag.name}</Card.Title>
                    <Button variant="success" onClick={() => handleSelect(frag)}>Add to Compare</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Selected Fragrances */}
          <h4>Selected Fragrances ({selectedFragrances.length}/3)</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          <ListGroup className="mb-3">
            {selectedFragrances.map(frag => (
              <ListGroup.Item key={frag.id} className="d-flex justify-content-between align-items-center">
                {frag.name}
                <Button variant="outline-danger" size="sm" onClick={() => handleRemove(frag)}>Remove</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {/* Compare Button */}
          <Button variant="dark" disabled={selectedFragrances.length === 0} onClick={handleCompare}>
            Compare
          </Button>

          {/* Compare Results */}
          {compareResults.length > 0 && (
            <>
              <h4 className="mt-4">Comparison Results</h4>
              <Row>
                {compareResults.map(frag => (
                  <Col key={frag.id} sm={4}>
                    <Card className="mb-3">
                      <Card.Img
                        variant="top"
                        src={frag.image}
                        alt={frag.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body>
                        <Card.Title>{frag.name}</Card.Title>
                        <Card.Text>{frag.description}</Card.Text>
                        <p><strong>Price Range:</strong> {frag.min_price} - {frag.max_price}</p>
                        <Button
                          variant="info"
                          onClick={() => navigate(`/user/fragranceDetails/${frag.id}`)}
                        >
                          Find out more
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>

        {/* Side Banner */}
        <Col sm={3}>
          {sideBanner && (
            <Card className="mb-4">
              <Card.Img
                src={sideBanner.bannerUrl}
                alt="Side Banner"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FragranceCompare;
