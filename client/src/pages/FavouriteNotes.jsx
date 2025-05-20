import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProgressTracker from '../components/ProgressTracker';

const FavouriteNotes = () => {
  const { setOnboardingStep } = useAuth();
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = React.useState(2); // Example: currently on step 2

    const steps = [
    { id: 1, label: 'Account Setup' },
    { id: 2, label: 'Favourite Notes' },
    { id: 3, label: 'Preferences' },
    { id: 4, label: 'Dashbaord' }
  ];
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || null;
  
  // Fetch notes from the backend
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to fetch notes. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, []);
  
  // Handle note selection
  const handleSelectNote = (noteId) => {
    setSelectedNotes((prevSelectedNotes) => {
      if (prevSelectedNotes.includes(noteId)) {
        return prevSelectedNotes.filter((id) => id !== noteId); // Deselect note
      } else {
        return [...prevSelectedNotes, noteId]; // Select note
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate user is logged in
    if (!userId) {
      toast.error('User not logged in. Please login to continue.');
      navigate('/login');
      return;
    }
    
    // Validate minimum note selection
    if (selectedNotes.length < 3) {
      toast.warning('Please select at least 3 notes!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/favourite', {
        userId,
        noteIds: selectedNotes,
      });
      
      if (response.status === 200) {
        toast.success('Favorite notes saved successfully!');
        setOnboardingStep(response.data.onboardingstep);
        
        // Short delay before navigation to allow toast to be seen
        setTimeout(() => {
          navigate("/user/personal-preferences");
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting favorite notes:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with an error status code
        const message = error.response.data.message || 'Failed to add favorite notes.';
        toast.error(message);
      } else if (error.request) {
        // No response received from the server
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        toast.error('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" className="mb-3" />
        <p>Loading notes...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    );
  }
  
  // Render error state when no notes found
  if (notes.length === 0 && !isLoading) {
    return (
      <Container className="mt-5 text-center">
        <h3>No Notes Available</h3>
        <p>We couldn't find any notes to display. Please try again later.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>Refresh</Button>
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    );
  }
  
  return (

    <Fragment>
    <ProgressTracker currentStep={currentStep} steps={steps} />

    <Container className="mt-5">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="mb-4">
        <h3>Select Your Favorite Notes</h3>
        <p className="text-muted">Please select at least 3 notes to continue</p>
        <div className="bg-light p-2 rounded">
          <strong>Selected: </strong>{selectedNotes.length} / {notes.length} 
          {selectedNotes.length < 3 && (
            <span className="text-danger"> (Minimum 3 required)</span>
          )}
        </div>
      </div>
      
      <Row className="my-4">
        {notes.map((note) => (
          <Col xs={12} sm={6} md={3} key={note.id} className="mb-4">
            <Card 
              className={selectedNotes.includes(note.id) ? "border-primary" : ""}
              onClick={() => handleSelectNote(note.id)}
              style={{ cursor: 'pointer' }}
            >
              {note.image && (
                <Card.Img variant="top" src={note.image} alt={note.name} />
              )}
              <Card.Body>
                <Card.Title>{note.name}</Card.Title>
                <Card.Text>{note.description}</Card.Text>
                <Form.Check 
                  type="checkbox" 
                  label="Select as Favorite" 
                  checked={selectedNotes.includes(note.id)}
                  onChange={() => handleSelectNote(note.id)} 
                  id={`note-check-${note.id}`}
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <div className="d-grid gap-2 col-md-4 mx-auto mb-5">
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={selectedNotes.length < 3 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Saving...
            </>
          ) : 'Continue'}
        </Button>
      </div>
    </Container>
    </Fragment>
  );
};

export default FavouriteNotes;