// AddVendorForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Alert, Spinner, Container, Card } from "react-bootstrap";

const AddVendorForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.access_token || null;

    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    if (image) data.append("img", image);

    try {
      const res = await axios.post("/vendors", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setFeedback({ type: "success", message: res.data.message });
      setFormData({ username: "", email: "", phone: "" });
      setImage(null);
    } catch (err) {
      setFeedback({
        type: "danger",
        message: err.response?.data || "Error adding vendor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <Card className="p-4">
        <h3>Add Vendor</h3>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
              type="file"
              name="file"
              onChange={handleImageChange}
              required
            />
          </Form.Group>

          <Button type="submit" variant="success" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Add Vendor"}
          </Button>

          {feedback.message && (
            <Alert className="mt-3" variant={feedback.type}>
              {feedback.message}
            </Alert>
          )}
        </Form>
      </Card>
    </Container>
  );
};

export default AddVendorForm;
