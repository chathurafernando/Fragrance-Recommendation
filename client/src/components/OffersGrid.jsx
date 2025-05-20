import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const OffersGrid = () => {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!userId) {
      setError('User is not logged in.');
      setLoading(false);
      return;
    }

    const fetchOffers = async () => {
      try {
        const res = await axios.get(`/advertisement/${userId}`);
        setOffers(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load offers.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleDelete = async (adId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!window.confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      await axios.delete(`/advertisement/${userId}/${adId}`);
      setOffers((prev) => prev.filter((ad) => ad.id !== adId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete the advertisement.');
    }
  };

const handleUpdate = (adId) => {
  navigate(`/vendor/advertisements/${adId}`);
};


  return (
    <div className="mt-4">
      <h3>Your Advertisement Offers</h3>

      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <div className="row mt-4">
        {offers.map((offer) => (
          <div className="col-12 col-md-6 col-lg-4 mb-4" key={offer.id}>
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={offer.bannerUrl} 
                style={{ height: '200px', objectFit: 'cover' }} 
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{offer.description}</Card.Title>
                <Card.Text className="flex-grow-1">
                  <strong>Placement:</strong> {offer.placement} <br />
                  <strong>Price:</strong> ${offer.price} <br />
                  <strong>Period:</strong><br />
                  {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                </Card.Text>
                <div className="d-flex justify-content-between">
{/* <Button variant="warning" onClick={() => handleUpdate(offer.id)}>Update</Button> */}
                  <Button variant="danger" onClick={() => handleDelete(offer.id)}>Delete</Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {!loading && offers.length === 0 && !error && (
        <p className="text-muted">You have not added any advertisement offers yet.</p>
      )}
    </div>
  );
};

export default OffersGrid;
