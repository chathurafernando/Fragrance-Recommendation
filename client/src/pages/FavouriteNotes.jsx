import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const FavouriteNotes = () => {

  const { setOnboardingStep } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || null;  // Dynamically get the user ID

  // console.log("User Id:",userId)

  // Fetch notes from the backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get('/notes'); // Replace with your API endpoint
        setNotes(response.data);  // Assuming the response is an array of notes
      } catch (error) {
        console.error('Error fetching notes:', error);
        setErrorMessage('Failed to fetch notes. Please try again.');
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
    if (!userId) {
      setErrorMessage('User not logged in');
      return;
    }

    if (selectedNotes.length === 0) {
      setErrorMessage('Please select at least one note!');
      return;
    }
console.log("Selected Notes :",selectedNotes)
    try {
      const response = await axios.post('/favourite', {
        userId,
        noteIds: selectedNotes,
      });

     
      if (response.status === 200) {
        setOnboardingStep(response.data.onboardingstep);
        navigate("/user/personal-preferences");
      }
    } catch (error) {
      console.error('Error submitting favorite notes:', error);
      setErrorMessage('Failed to add favorite notes. Please try again.');
    }
  };

  return (
    <Container className="mt-5">
      <h3>Select Your Favorite Notes</h3>
      {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
      
      <Row className="my-4">
        {notes.map((note) => (
          <Col xs={12} sm={6} md={3} key={note.id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={note.image} alt={note.name} />
              <Card.Body>
                <Card.Title>{note.name}</Card.Title>
                <Card.Text>{note.description}</Card.Text>
                <Form.Check
                  type="checkbox"
                  label="Select as Favorite"
                  onChange={() => handleSelectNote(note.id)}
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Button variant="primary" onClick={handleSubmit}>Submit</Button>
    </Container>
  );
};

export default FavouriteNotes;
