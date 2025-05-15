import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const FragranceDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [topBanner, setTopBanner] = useState(null);
  const [sideBanner, setSideBanner] = useState(null);

  useEffect(() => {
    if (id) {
      fetchFragranceData(id);
    }
    fetchBanners();
  }, [id]);

  const fetchFragranceData = async (fragranceId) => {
    try {
      const res = await axios.get(`/associated-vendors/${fragranceId}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching fragrance data', err);
    }
  };

  const fetchBanners = async () => {
    try {
      const topRes = await axios.get('/advertisement/promotion/ProductPage_Top');
      const sideRes = await axios.get('/advertisement/promotion/ProductPage_Side');

      setTopBanner(topRes?.data[0]);
      setSideBanner(sideRes?.data[0]);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    }
  };

  if (!data) return <p className="text-center mt-5">Loading fragrance details...</p>;

  const { fragrance, min_price, max_price, vendors } = data;

  return (
    <Container className="mt-4">
      {/* Top Banner */}
      {topBanner && (
        <Row className="mb-4">
          <Col>
            <img
              src={topBanner.bannerUrl}
              alt={topBanner.description}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
              }}
            />
          </Col>
        </Row>
      )}

      <Row>
        {/* Fragrance Info */}
        <Col md={9}>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Img
                  variant="top"
                  src={fragrance?.image || 'https://via.placeholder.com/300x400?text=No+Image'}
                  alt={fragrance?.name}
                />
              </Card>
            </Col>
            <Col md={8}>
              <h3 className="fw-bold">{fragrance?.name || 'Fragrance Name'}</h3>
              <p className="text-muted mb-2">
                <strong>Price Range:</strong> {Number(min_price || 0).toLocaleString()} - {Number(max_price || 0).toLocaleString()} LKR
              </p>
              <p>{fragrance?.description || 'No description available for this fragrance.'}</p>
            </Col>
          </Row>

          {/* Company Price Comparison */}
          <h5 className="mb-3">Compare {fragrance?.name} prices in Sri Lanka</h5>

          {vendors?.length > 0 ? (
            vendors.map((item, index) => (
              <Card key={index} className="mb-3 shadow-sm">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={2} xs={4}>
                      <img
                        src={item?.company?.image || 'https://via.placeholder.com/80x50?text=Company'}
                        alt="Company Logo"
                        className="img-fluid rounded"
                      />
                    </Col>
                    <Col md={5} xs={8}>
                      <h6 className="mb-1">{item?.company?.companyName || 'Company Name'}</h6>
                      <small className="text-muted">{item?.company?.description || 'Trusted seller in Sri Lanka'}</small>
                    </Col>
                    <Col md={3} xs={6} className="mt-3 mt-md-0">
                      <h5 className="text-success">{Number(item?.price || 0).toLocaleString()} LKR</h5>
                      <small className="text-muted">{item?.availability || 'Availability unknown'}</small><br />
                      <small className="text-muted">Warranty: {item?.warranty || 'N/A'}</small>
                    </Col>
                    <Col md={2} xs={6} className="mt-3 mt-md-0 text-end">
                      <Button
                        variant="primary"
                        size="sm"
                        href={item?.purchaseLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Shop
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No company offers available right now.</p>
          )}
        </Col>

        {/* Side Banner */}
        <Col md={3}>
          {sideBanner && (
            <img
              src={sideBanner.bannerUrl}
              alt={sideBanner.description}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
              }}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FragranceDetail;
