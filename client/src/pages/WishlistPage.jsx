import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // import navigation hook

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const [sideBanner, setSideBanner] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  const navigate = useNavigate(); // init navigation

  const totalPages = Math.ceil(wishlist.length / perPage);
  const paginatedWishlist = wishlist.slice((currentPage - 1) * perPage, currentPage * perPage);

const FragranceCard = ({ name, image, fragranceId }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/user/fragranceDetails/${fragranceId}`);
  };

  return (
    <Card className="shadow-sm" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <Card.Img
        variant="top"
        src={image}
        style={{
          height: '150px',
          objectFit: 'contain',
          backgroundColor: '#f8f9fa'
        }}
      />
      <Card.Body>
        <Card.Title className="fs-6">{name}</Card.Title>
      </Card.Body>
    </Card>
  );
};

  useEffect(() => {
    if (userId) {
      fetchWishlist();
      fetchBanner();
    } else {
      console.error('User not found in localStorage');
      setLoading(false);
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`/wishlist/${userId}`);
      setWishlist(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    }
  };

  const fetchBanner = async () => {
    try {
      const res = await axios.get('/advertisement/promotion/Wishlist_Side');
      setSideBanner(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch side banner:', err);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleCompare = () => {
    navigate('/user/compare'); // navigate to compare page
  };

  if (loading) return <div>Loading your wishlist...</div>;

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Your Wishlist</h2>
        <Button variant="primary" onClick={handleCompare}>
          Compare Fragrances
        </Button>
      </div>

      <Row>
        {/* Main Wishlist */}
        <Col md={9}>
          {wishlist.length === 0 ? (
            <p>You haven’t liked any fragrances yet.</p>
          ) : (
            <>
              <Row>
                {paginatedWishlist.map((item) => (
                  
                  <Col key={item.id} xs={12} sm={6} md={3} className="mb-3">
                    {/* <Card className="h-100 d-flex flex-column" style={{ minHeight: '320px' }}>
                      <Card.Img
                        variant="top"
                        src={item.fragrance.image}
                        alt={item.fragrance.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <Card.Title className="fs-6 text-center mb-3">{item.fragrance.name}</Card.Title>
                        <Button
                          variant="info"
                          onClick={() => navigate(`/user/fragranceDetails/${item.fragrance.id}`)}
                        >
                          Find out more
                        </Button>
                      </Card.Body>
                    </Card> */}

                    <FragranceCard
                  key={item.fragrance.id}
                  name={item.fragrance.name}
                  image={item.fragrance.image}
                  fragranceId={item.fragrance.id}
                />

                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button variant="outline-secondary" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
                  ← Prev
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline-secondary" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
                  Next →
                </Button>
              </div>
            </>
          )}
        </Col>

        {/* Side Banner */}
        <Col md={3}>
          {sideBanner ? (
            <img
              src={sideBanner.bannerUrl}
              alt={sideBanner.description}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
              }}
            />
          ) : null}
        </Col>
      </Row>
    </div>
  );
};

export default WishlistPage;
