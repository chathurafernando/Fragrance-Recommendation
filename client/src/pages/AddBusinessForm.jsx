import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert, Spinner, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";

const AddBusinessForm = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    companyName: "",
    phoneOffice: "",
    description: "",
    address: "",
    websiteURL: "",
    image: null,
    vendorId: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token || null;
  const role = user?.role?.toLowerCase();

  const showToast = (message, type = "success") => {
    const newToast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^\d{10}$/;
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!formData.phoneOffice.trim()) {
      errors.phoneOffice = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneOffice)) {
      errors.phoneOffice = "Phone number must be 10 digits";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 20) {
      errors.description = "Description should be at least 20 characters";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }
    if (!formData.websiteURL.trim()) {
      errors.websiteURL = "Website is required";
    }


    if (formData.websiteURL && !urlRegex.test(formData.websiteURL)) {
      errors.websiteURL = "Please enter a valid URL";
    }

    if (!formData.image) {
      errors.image = "Business image is required";
    }

    if (role === "admin" && !formData.vendorId) {
      errors.vendorId = "Please select a vendor";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchVendors = async () => {
      if (role === "admin") {
        setApiLoading(true);
        try {
          const res = await axios.get("/vendors", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setVendors(res.data);
        } catch (err) {
          console.error("Failed to fetch vendors", err);
          showToast("Failed to load vendors. Please try again.", "danger");
        } finally {
          setApiLoading(false);
        }
      }
    };

    fetchVendors();
  }, [role, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    const businessData = new FormData();
    businessData.append("companyName", formData.companyName);
    businessData.append("phoneOffice", formData.phoneOffice);
    businessData.append("description", formData.description);
    businessData.append("address", formData.address);
    businessData.append("websiteURL", formData.websiteURL);
    businessData.append("image", formData.image);
    if (role === "admin") businessData.append("vendorId", formData.vendorId);

    try {
      const res = await axios.post("/business", businessData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      showToast(res.data.message || "Business added successfully!");
      setFormData({
        companyName: "",
        phoneOffice: "",
        description: "",
        address: "",
        websiteURL: "",
        image: null,
        vendorId: "",
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      (typeof err.response?.data === "string" ? err.response.data : null) || 
                      "Error adding business.";
      showToast(errorMsg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file }));
    
    // Clear image error when file is selected
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const handleVendorSelect = (e) => {
    const selectedUsername = e.target.value;
    const vendor = vendors.find(v => v.username === selectedUsername);
    setFormData(prev => ({ ...prev, vendorId: vendor?.id || "" }));
    
    // Clear vendor error when selection is made
    if (formErrors.vendorId) {
      setFormErrors(prev => ({ ...prev, vendorId: "" }));
    }
  };

  return (
    <Container className="mt-5">
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            show={true} 
            delay={5000} 
            autohide
            bg={toast.type}
          >
            <Toast.Header>
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      <h3>Add New Business</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={handleInputChange}
            isInvalid={!!formErrors.companyName}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.companyName}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone (Office)</Form.Label>
          <Form.Control
            name="phoneOffice"
            type="text"
            value={formData.phoneOffice}
            onChange={handleInputChange}
            isInvalid={!!formErrors.phoneOffice}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.phoneOffice}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            name="description"
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            isInvalid={!!formErrors.description}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.description}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            name="address"
            type="text"
            value={formData.address}
            onChange={handleInputChange}
            isInvalid={!!formErrors.address}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.address}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Website URL</Form.Label>
          <Form.Control
            name="websiteURL"
            type="text"
            value={formData.websiteURL}
            onChange={handleInputChange}
            isInvalid={!!formErrors.websiteURL}
            placeholder="https://example.com"
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.websiteURL}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Business Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            isInvalid={!!formErrors.image}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.image}
          </Form.Control.Feedback>
        </Form.Group>

        {role === "admin" && (
          <Form.Group className="mb-3">
            <Form.Label>Select Vendor</Form.Label>
            <Form.Select
              onChange={handleVendorSelect}
              isInvalid={!!formErrors.vendorId}
            >
              <option value="">-- Select a Vendor --</option>
              {apiLoading ? (
                <option disabled>Loading vendors...</option>
              ) : (
                vendors.map((v) => (
                  <option key={v.id} value={v.username}>
                    {v.username}
                  </option>
                ))
              )}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.vendorId}
            </Form.Control.Feedback>
          </Form.Group>
        )}

        <Button type="submit" variant="success" disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default AddBusinessForm;