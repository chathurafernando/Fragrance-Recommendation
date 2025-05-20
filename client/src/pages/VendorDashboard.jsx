import React, { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';
import axios from 'axios';
import {
  Tabs, Tab, Alert, Spinner, Card, Badge, Modal, Button, Form
} from 'react-bootstrap';
import OffersGrid from '../components/OffersGrid';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  BsCheckCircleFill, BsGlobe, BsGeoAlt, BsInfoCircle, BsPencilSquare
} from 'react-icons/bs';

const VendorDashboard = () => {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    address: '',
    websiteURL: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || null;

    if (!userId) {
      setError('User is not logged in.');
      setLoading(false);
      return;
    }

    setVendorInfo(user);
    fetchCompanyInfo(userId);
  }, []);

  const fetchCompanyInfo = async (userId) => {
    try {
      const res = await axios.get(`/business/${userId}`);
      setCompanyInfo(res.data);
      setFormData({
        companyName: res.data.companyName || '',
        description: res.data.description || '',
        address: res.data.address || '',
        websiteURL: res.data.websiteURL || '',
      });
      
      // Set preview image if company has an image
      if (res.data.image) {
        setPreviewImage(res.data.image);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching company info:', err);
      setError(err.response?.data?.error || 'Failed to fetch company details.');
      toast.error('Failed to fetch company details.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    // Fetch fresh data when modal is closed to ensure we're showing the latest info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      fetchCompanyInfo(user.id);
    }

    setShowModal(false);
    setFormErrors({});
    setLogoFile(null);
    setPreviewImage(companyInfo?.image || null);
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
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({ ...prev, image: "Invalid file type. Please upload a JPG, PNG, GIF, or SVG image." }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: "File is too large. Maximum file size is 5MB." }));
        return;
      }
      
      setLogoFile(file);
      setPreviewImage(URL.createObjectURL(file));
      
      // Clear image error when valid file is selected
      if (formErrors.image) {
        setFormErrors(prev => ({ ...prev, image: "" }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    } else if (formData.companyName.trim().length < 2) {
      errors.companyName = "Company name must be at least 2 characters long";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long";
    }
    
    if (!formData.address.trim()) {
      errors.address = "Business address is required";
    } else if (formData.address.trim().length < 5) {
      errors.address = "Please provide a complete address";
    }
    
    if (!formData.websiteURL.trim()) {
      errors.websiteURL = "Website URL is required";
    } else {
      try {
        new URL(formData.websiteURL);
      } catch (e) {
        errors.websiteURL = "Please enter a valid URL (e.g., https://example.com)";
      }
    }
    
    if (!companyInfo.image && !logoFile) {
      errors.image = "Company logo is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsUpdating(true);

    const data = new FormData();
    data.append('companyName', formData.companyName);
    data.append('description', formData.description);
    data.append('address', formData.address);
    data.append('websiteURL', formData.websiteURL);
    if (logoFile) {
      data.append('image', logoFile);
    }

    try {
      await axios.put(`/business/${companyInfo.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Business information updated successfully!');
      
      // First close the modal
      setShowModal(false);
      
      // Then fetch fresh data from the server - this ensures we display what's actually saved
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.id) {
        fetchCompanyInfo(user.id);
      }
      
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.error || 'Failed to update business information.');
    } finally {
      setIsUpdating(false);
    }
  };

  return ( <div className="p-4">
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    
    {error && <Alert variant="danger">{error}</Alert>}

    {loading && (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading company information...</p>
      </div>
    )}

    {companyInfo && (
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row align-items-start gap-4">
            <div className="text-center">
              <div
                className="rounded-circle overflow-hidden bg-light"
                style={{
                  width: '120px',
                  height: '120px',
                  border: '2px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={companyInfo.image || '/default-logo.png'}
                  alt="Company Logo"
                  className="img-fluid"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              {companyInfo.verification === 'verified' && (
                <Badge pill bg="primary" className="mt-2">
                  <BsCheckCircleFill className="me-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <h3 className="mb-3 fw-bold text-primary">{companyInfo.companyName}</h3>
                <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                  <BsPencilSquare className="me-1" />
                  Edit Business Info
                </Button>
              </div>

              {companyInfo.description && (
                <div className="mb-3">
                  <div className="d-flex align-items-center text-muted mb-1">
                    <BsInfoCircle className="me-2" />
                    <small>About Us</small>
                  </div>
                  <p className="mb-0" style={{ maxWidth: '600px' }}>{companyInfo.description}</p>
                </div>
              )}

              <div className="d-flex flex-wrap gap-4 mt-3">
                {companyInfo.address && (
                  <div>
                    <div className="d-flex align-items-center text-muted mb-1">
                      <BsGeoAlt className="me-2" />
                      <small>Address</small>
                    </div>
                    <p className="mb-0">{companyInfo.address}</p>
                  </div>
                )}

                {companyInfo.websiteURL && (
                  <div>
                    <div className="d-flex align-items-center text-muted mb-1">
                      <BsGlobe className="me-2" />
                      <small>Website</small>
                    </div>
                    <a
                      href={companyInfo.websiteURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {companyInfo.websiteURL.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    )}

    <Tabs defaultActiveKey="products" id="vendor-dashboard-tabs" className="mb-3" fill>
      <Tab eventKey="products" title={<span className="fw-semibold">Products</span>}>
        <ProductGrid />
      </Tab>
      <Tab eventKey="offers" title={<span className="fw-semibold">Advertisement Offers</span>}>
        <OffersGrid />
      </Tab>
    </Tabs>

    {/* Modal Form */}
    <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Update Business Info</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              isInvalid={!!formErrors.companyName}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.companyName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              isInvalid={!!formErrors.description}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              isInvalid={!!formErrors.address}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.address}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Website URL <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="url"
              name="websiteURL"
              value={formData.websiteURL}
              onChange={handleInputChange}
              placeholder="https://example.com"
              isInvalid={!!formErrors.websiteURL}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.websiteURL}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Company Logo <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              isInvalid={!!formErrors.image}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.image}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
            </Form.Text>
            {previewImage && (
              <div className="mt-2 text-center">
                <img 
                  src={previewImage} 
                  alt="Company Logo Preview"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "contain",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    padding: "5px"
                  }}
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />{" "}
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </div>
  );
};

export default VendorDashboard;