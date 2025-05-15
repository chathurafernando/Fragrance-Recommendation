import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const PersonalPreference = () => {

  const { setOnboardingStep } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    userId: '',
    lookingFor: '',
    ageRange: '',
    occasion: '',
    smell: '',
    intensity: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch user ID from localStorage when component mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || null;
    if (userId) {
      setFormData((prev) => ({
        ...prev,
        userId: userId,
      }));
    } else {
      setError('User not logged in.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/taste', formData);
      setMessage(response.data.message);
      setFormData({
        userId: formData.userId, // Keep the userId
        lookingFor: '',
        ageRange: '',
        occasion: '',
        smell: '',
        intensity: '',
      });
      if (response.status === 200) {
        setOnboardingStep(response.data.onboardingstep);
        navigate("/user/Dashboard");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'An error occurred');
      } else {
        setError('Server not reachable');
      }
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h5">Personal Preferences</Card.Header>
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {/* Remove User ID input field */}

                <Form.Group controlId="lookingFor" className="mb-3">
                  <Form.Label>Looking For</Form.Label>
                  <Form.Select name="lookingFor" value={formData.lookingFor} onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="Her">Her</option>
                    <option value="Him">Him</option>
                    <option value="Both">Both</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="ageRange" className="mb-3">
                  <Form.Label>Age Range</Form.Label>
                  <Form.Select name="ageRange" value={formData.ageRange} onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="below 18">below 18</option>
                    <option value="in 20s">in 20s</option>
                    <option value="in 30s">in 30s</option>
                    <option value="in 40s">in 40s</option>
                    <option value="in 50s">in 50s</option>
                    <option value="above 50">above 50</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="occasion" className="mb-3">
                  <Form.Label>Occasion</Form.Label>
                  <Form.Select name="occasion" value={formData.occasion} onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="Office">Office</option>
                    <option value="Club">Club</option>
                    <option value="Casual">Casual</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="smell" className="mb-3">
                  <Form.Label>Smell Type</Form.Label>
                  <Form.Select name="smell" value={formData.smell} onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="Fruity">Fruity</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Mint">Mint</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="intensity" className="mb-4">
                  <Form.Label>Intensity</Form.Label>
                  <Form.Select name="intensity" value={formData.intensity} onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="EDP">EDP</option>
                    <option value="EDT">EDT</option>
                    <option value="Parfum">Parfum</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Save Preferences
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PersonalPreference;
