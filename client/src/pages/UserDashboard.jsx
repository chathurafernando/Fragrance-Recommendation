import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.scss';

// Reusable Fragrance Card
const FragranceCard = ({ name, image, onLike, fragranceId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onLike) onLike(fragranceId);
  };

  const handleCardClick = () => {
    navigate(`/user/fragranceDetails/${fragranceId}`);
  };

  return (
    <Card className="shadow-sm" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <Card.Img
        variant="top"
        src={image}
        style={{ height: '150px', objectFit: 'cover' }}
      />
      <Card.Body>
        <Card.Title className="fs-6">{name}</Card.Title>
        <button
          onClick={handleLike}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
      </Card.Body>
    </Card>
  );
};

// Main HomePage Component
const HomePage = () => {
  const [recommendedFragrances, setRecommendedFragrances] = useState([]);
  const [popularFragrances, setPopularFragrances] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [topBanner, setTopBanner] = useState(null);
  const [rightBanner, setRightBanner] = useState(null);
  const [wishlistFragranceIds, setWishlistFragranceIds] = useState([]);

  const perPage = 8;

  const totalPages = Math.ceil(recommendedFragrances.length / perPage);
  const paginatedFragrances = recommendedFragrances.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const popularRef = useRef(null);

  useEffect(() => {
    fetchRecommended();
    fetchPopular();
    fetchNewArrivals();
    fetchBanners();
    fetchWishlist();
  }, []);

  const fetchBanners = async () => {
    try {
      const topRes = await axios.get('/advertisement/promotion/Homepage_Top');
      const rightRes = await axios.get('/advertisement/promotion/Homepage_Side');
      setTopBanner(topRes?.data[0]);
      setRightBanner(rightRes?.data[0]);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    }
  };

  const fetchRecommended = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      if (!userId) return console.error('User ID not found in local storage');
      const res = await axios.get(`/recommend/${userId}?limit=20`);
      setRecommendedFragrances(res.data);
    } catch (err) {
      console.error('Failed to fetch recommended fragrances:', err);
    }
  };

  const fetchPopular = async () => {
    try {
      const res = await axios.get(`/recommend/fragrances/popular-picks?limit=20`);
      setPopularFragrances(res.data);
    } catch (err) {
      console.error('Failed to fetch popular fragrances:', err);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const res = await axios.get(`/recommend/fragrances/new?limit=4`);
      setNewArrivals(res.data);
    } catch (err) {
      console.error('Failed to fetch new arrivals:', err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const user_id = user?.id;
      if (!user_id) return;

      const res = await axios.get(`/wishlist/user/${user_id}`);
      // Assuming the response is an array of fragrance objects with an `id` field
      const ids = res.data.map(f => f.id);
      setWishlistFragranceIds(ids);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };




  const handleLike = async (fragrance_id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const user_id = user?.id;
      if (!user_id) return alert('Please login first');

      if (wishlistFragranceIds.includes(fragrance_id)) {
        // Remove from wishlist
        await axios.post('/wishlist/remove', { user_id, fragrance_id });
        setWishlistFragranceIds(prev => prev.filter(id => id !== fragrance_id));

        // Optionally remove from UI (e.g., on profile page)
        setRecommendedFragrances(prev => prev.filter(f => f.id !== fragrance_id));
        setPopularFragrances(prev => prev.filter(f => f.id !== fragrance_id));
        setNewArrivals(prev => prev.filter(f => f.id !== fragrance_id));
      } else {
        // Add to wishlist
        await axios.post('/wishlist/add', { user_id, fragrance_id });
        setWishlistFragranceIds(prev => [...prev, fragrance_id]);
      }
    } catch (err) {
      console.error('Wishlist update error:', err);
    }
  };


  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const scrollPopular = (direction) => {
    if (popularRef.current) {
      const scrollAmount = 180 * 2;
      popularRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Container fluid className="p-4">
      <h4 className="fw-semibold">Good Morning, Chathura! 👋</h4>
      <p className="text-muted">Find your perfect fragrance today</p>

      {/* Top Banner */}
      <Row className="mb-4">
        <Col>
          {topBanner && (
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
          )}
        </Col>
      </Row>

      <Row>
        <Col md={9}>
          {/* Recommended */}
          <h5>🎯 Recommended for You</h5>
          <Row className="mb-3">
            {paginatedFragrances.map((f) => (
              <Col key={f.id} xs={12} sm={6} md={3} className="mb-3">
                <FragranceCard
                  key={f.id}
                  name={f.name}
                  image={f.image}
                  fragranceId={f.id}
                  onLike={handleLike}
                  isLiked={wishlistFragranceIds.includes(f.id)}
                />
              </Col>
            ))}
          </Row>
          <div className="d-flex justify-content-between mb-4">
            <Button variant="outline-secondary" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
              ← Prev
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button variant="outline-secondary" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
              Next →
            </Button>
          </div>

          {/* Popular Picks */}
          <h5 className="d-flex align-items-center justify-content-between">
            <span>🔥 Popular Picks</span>
            <div>
              <Button variant="light" className="me-2" onClick={() => scrollPopular('left')}>
                <ChevronLeft />
              </Button>
              <Button variant="light" onClick={() => scrollPopular('right')}>
                <ChevronRight />
              </Button>
            </div>
          </h5>
          <div ref={popularRef} style={{ overflowX: 'hidden', whiteSpace: 'nowrap' }} className="mb-4">
            {popularFragrances.map((f) => (
              <div key={f.id} style={{ display: 'inline-block', marginRight: '15px' }}>
                <FragranceCard
                  key={f.id}
                  name={f.name}
                  image={f.image}
                  fragranceId={f.id}
                  onLike={handleLike}
                  isLiked={wishlistFragranceIds.includes(f.id)}
                />
              </div>
            ))}
          </div>

          {/* New Arrivals */}
          <h5>✨ New Arrivals</h5>
          <Row className="mb-3">
            {newArrivals.map((f) => (
              <Col key={f.id} xs={12} sm={6} md={3} className="mb-3">
                <FragranceCard
                  key={f.id}
                  name={f.name}
                  image={f.image}
                  fragranceId={f.id}
                  onLike={handleLike}
                  isLiked={wishlistFragranceIds.includes(f.id)}
                />
              </Col>
            ))}
          </Row>
        </Col>

        {/* Right Banner */}
        <Col md={3}>
          <div style={{ height: '100%' }}>
            {rightBanner ? (
              <img
                src={rightBanner.bannerUrl}
                alt={rightBanner.description}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                }}
              />
            ) : (
              <div style={{
                height: '100%',
                textAlign: 'center',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <h5>Banner Placeholder</h5>
                <p className="text-muted">Advertisement space</p>
                <p className="text-muted small">300x600</p>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
