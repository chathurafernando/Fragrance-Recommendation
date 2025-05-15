import React, { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const RegisterBusiness = () => {

  const { setOnboardingStep } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    phoneOffice: "",
    address: "",
    description: "",
    websiteURL: "",
    verification: "pending",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!imageFile) {
      setErrorMessage("Please upload an image.");
      return;
    }

    const businessData = new FormData();
    businessData.append("companyName", formData.companyName);
    businessData.append("phoneOffice", formData.phoneOffice);
    businessData.append("address", formData.address);
    businessData.append("description", formData.description);
    businessData.append("websiteURL", formData.websiteURL);
    businessData.append("verification", formData.verification);
    businessData.append("image", imageFile);

    try {
      // const user = JSON.parse(localStorage.getItem("token"));
      const token = localStorage.getItem("token");
    console.log(token);
    
      const response = await axios.post(
        "/business",
        businessData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    
      setSuccessMessage("Business registered successfully!");
      console.log(response.data);
    
      // Optionally clear form
      setFormData({
        companyName: "",
        phoneOffice: "",
        address: "",
        description: "",
        websiteURL: "",
        verification: "pending",
      });
      setImageFile(null);
    
      if (response.status === 201) {
        setOnboardingStep(response.data.onboardingstep);
        navigate("/vendor/dashboard");
      }
    
    } catch (err) {
      console.error("Error registering business:", err);
    
      const backendMessage = err.response?.data?.error || err.response?.data || "Something went wrong. Try again.";
      setErrorMessage(backendMessage);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "350px" }} className="p-4">
        <h5 className="text-center mb-4">Register Business</h5>
        {errorMessage && (
          <div className="alert alert-danger text-center p-2" role="alert">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success text-center p-2" role="alert">
            {successMessage}
          </div>
        )}

        <div className="mb-3">
          <Form.Label>Upload Business Image:</Form.Label>
          <Form.Control type="file" onChange={handleImageChange} />
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="companyName">
            <Form.Label>Company Name:</Form.Label>
            <Form.Control type="text" value={formData.companyName} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="phoneOffice">
            <Form.Label>Phone (Office):</Form.Label>
            <Form.Control type="text" value={formData.phoneOffice} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address:</Form.Label>
            <Form.Control type="text" value={formData.address} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>About:</Form.Label>
            <Form.Control as="textarea" rows={3} value={formData.description} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="websiteURL">
            <Form.Label>Website URL:</Form.Label>
            <Form.Control type="text" value={formData.websiteURL} onChange={handleChange} />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="secondary">Submit</Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default RegisterBusiness;
