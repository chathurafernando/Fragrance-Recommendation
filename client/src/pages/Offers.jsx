import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Col, Row, Container } from 'react-bootstrap';

const Offers = () => {
  const [offers, setOffers] = useState([]);

  // Fetch Offers
  const fetchOffers = async () => {
    try {
      const response = await axios.get('/offers');
      setOffers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch website URL for the offer
  const fetchWebsiteUrl = async (offerId) => {
    try {
      const response = await axios.get(`/offers/${offerId}/website`);
      console.log("Response", response.data)
      return response.data.websiteURL;
    } catch (error) {
      console.log("Error fetching website URL:", error);
      return null;
    }
  };

  const handleClaimClick = async (offerId) => {
    const websiteUrl = await fetchWebsiteUrl(offerId);
    if (websiteUrl) {
      window.open(websiteUrl, '_blank');
    } else {
      alert("Website URL not found.");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">🔥 Hot Offers Just for You!</h2>
      <Row>
        {offers.map(offer => (
          <Col key={offer.id} sm={12} md={6} lg={4}>
            <Card
              className="mb-4 shadow-sm rounded-4 border-0 h-100"
              style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Card.Img
                variant="top"
                src={offer.bannerUrl}
                className="rounded-top-4"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body style={{ flex: '1 1 auto' }}>
                <Card.Title>{offer.description}</Card.Title>
                <Button
                  variant="success"
                  className="w-100 rounded-pill"
                  onClick={() => handleClaimClick(offer.id)} // Using offer id here
                >
                  Claim Now
                </Button>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <small className="text-muted">Expires on {new Date(offer.endDate).toLocaleDateString()}</small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Offers;
