import React, { useState, useEffect, Fragment } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProgressTracker from '../components/ProgressTracker';

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

  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    lookingFor: false,
    ageRange: false,
    occasion: false,
    smell: false,
    intensity: false,
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = React.useState(3); // Example: currently on step 2

    const steps = [
    { id: 1, label: 'Account Setup' },
    { id: 2, label: 'Favourite Notes' },
    { id: 3, label: 'Preferences' },
    { id: 4, label: 'Dashbaord' }
  ];

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
      toast.error('User not logged in. Please log in first.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  // Validation function
  const validateField = (name, value) => {
    if (!value || value === '') {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }
    
    if (name === 'ageRange' && value === 'below 18') {
      return 'Age must be 18 or above';
    }
    
    return '';
  };

  // Validate the entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
      if (key !== 'userId') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate the field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched = {};
    Object.keys(touched).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/taste', formData);
      
      toast.success(response.data.message || 'Preferences saved successfully!');
      
      // Reset form data
      setFormData({
        userId: formData.userId, // Keep the userId
        lookingFor: '',
        ageRange: '',
        occasion: '',
        smell: '',
        intensity: '',
      });
      
      // Reset touched states
      const resetTouched = {};
      Object.keys(touched).forEach(key => {
        resetTouched[key] = false;
      });
      setTouched(resetTouched);
      
      if (response.status === 200) {
        setOnboardingStep(response.data.onboardingstep);
        // Delay navigation to show the success toast
        setTimeout(() => navigate("/user/Dashboard"), 1500);
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.error || 'An error occurred while saving preferences.');
      } else if (err.request) {
        toast.error('Server not reachable. Please try again later.');
      } else {
        toast.error('An unexpected error occurred.');
      }
      console.error('Error submitting preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment> <ProgressTracker currentStep={currentStep} steps={steps} />
      <Container className="mt-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h5">Personal Preferences</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group controlId="lookingFor" className="mb-3">
                  <Form.Label>Looking For</Form.Label>
                  <Form.Select 
                    name="lookingFor" 
                    value={formData.lookingFor} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.lookingFor && !!errors.lookingFor}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Her">Her</option>
                    <option value="Him">Him</option>
                    <option value="Both">Both</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.lookingFor}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="ageRange" className="mb-3">
                  <Form.Label>Age Range</Form.Label>
                  <Form.Select 
                    name="ageRange" 
                    value={formData.ageRange} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.ageRange && !!errors.ageRange}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="below 18">below 18</option>
                    <option value="in 20s">in 20s</option>
                    <option value="in 30s">in 30s</option>
                    <option value="in 40s">in 40s</option>
                    <option value="in 50s">in 50s</option>
                    <option value="above 50">above 50</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.ageRange}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="occasion" className="mb-3">
                  <Form.Label>Occasion</Form.Label>
                  <Form.Select 
                    name="occasion" 
                    value={formData.occasion} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.occasion && !!errors.occasion}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Office">Office</option>
                    <option value="Club">Club</option>
                    <option value="Casual">Casual</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.occasion}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="smell" className="mb-3">
                  <Form.Label>Smell Type</Form.Label>
                  <Form.Select 
                    name="smell" 
                    value={formData.smell} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.smell && !!errors.smell}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Fruity">Fruity</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Mint">Mint</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.smell}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="intensity" className="mb-4">
                  <Form.Label>Intensity</Form.Label>
                  <Form.Select 
                    name="intensity" 
                    value={formData.intensity} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.intensity && !!errors.intensity}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="EDP">EDP</option>
                    <option value="EDT">EDT</option>
                    <option value="Parfum">Parfum</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.intensity}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Saving...
                    </>
                  ) : 'Save Preferences'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </Fragment>
    
  );
};

export default PersonalPreference;