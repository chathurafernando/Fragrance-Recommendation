import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { FaEdit, FaTrash, FaCheckCircle, FaBan } from "react-icons/fa";
import axios from "axios";

const BusinessInfoTable = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const newToast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get("/business");
        const data = Array.isArray(res.data) ? res.data : res.data.businesses;
        setBusinesses(data);
      } catch (err) {
        console.error("Error fetching businesses:", err);
        showToast("Failed to load businesses. Please try again.", "danger");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^\d{10}$/;
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    if (!formValues.companyName?.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!formValues.phoneOffice?.trim()) {
      errors.phoneOffice = "Phone number is required";
    } else if (!phoneRegex.test(formValues.phoneOffice)) {
      errors.phoneOffice = "Phone number must be 10 digits";
    }

    if (!formValues.description?.trim()) {
      errors.description = "Description is required";
    } else if (formValues.description.length < 20) {
      errors.description = "Description should be at least 20 characters";
    }

    if (!formValues.address?.trim()) {
      errors.address = "Address is required";
    }

    if (formValues.websiteURL && !urlRegex.test(formValues.websiteURL)) {
      errors.websiteURL = "Please enter a valid URL";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditBusiness = (business) => {
    setSelectedBusiness(business);
    setFormValues({
      companyName: business.companyName,
      phoneOffice: business.phoneOffice,
      address: business.address,
      description: business.description,
      websiteURL: business.websiteURL,
      verification: business.verification
    });
    setImageFile(null);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleUpdateBusiness = async () => {
    if (!selectedBusiness) return;
    if (!validateForm()) return;
    
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axios.put(`/business/${selectedBusiness.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = businesses.map((b) =>
        b.id === selectedBusiness.id ? res.data.business : b
      );
      setBusinesses(updated);
      setShowEditModal(false);
      setSelectedBusiness(null);
      showToast("Business updated successfully!");
    } catch (err) {
      console.error("Error updating business:", err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      (typeof err.response?.data === "string" ? err.response.data : null) || 
                      "Failed to update business.";
      showToast(errorMsg, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!window.confirm("Are you sure you want to delete this business?")) return;
  
    try {
      await axios.delete(`/business/${id}`);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      showToast("Business deleted successfully.");
    } catch (err) {
      console.error("Error deleting business:", err);
      showToast("Failed to delete business.", "danger");
    }
  };
  
  const handleShowVerifyModal = (business) => {
    setSelectedBusiness(business);
    setShowVerifyModal(true);
  };

  const handleCloseVerifyModal = () => {
    setShowVerifyModal(false);
    setSelectedBusiness(null);
  };

  const handleVerifyBusiness = async () => {
    if (!selectedBusiness) return;

    const { id, verification } = selectedBusiness;
    const updatedVerificationStatus = verification === "verified" ? "pending" : "verified";

    try {
      const updatedBusinesses = businesses.map((b) =>
        b.id === id ? { ...b, verification: updatedVerificationStatus } : b
      );
      setBusinesses(updatedBusinesses);

      await axios.put(`/business/${id}/verify`, { verification: updatedVerificationStatus });
      showToast(`Verification status changed to ${updatedVerificationStatus}.`);
    } catch (error) {
      console.error("Error updating verification status:", error);
      showToast("Failed to change verification status.", "danger");
    }

    handleCloseVerifyModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
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

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Company Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Website</th>
            <th>Image</th>
            <th>Verification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((b, index) => (
            <tr key={b.id}>
              <td>{index + 1}</td>
              <td>{b.companyName}</td>
              <td>{b.phoneOffice}</td>
              <td>{b.address}</td>
              <td>
                <a href={b.websiteURL} target="_blank" rel="noopener noreferrer">
                  {b.websiteURL}
                </a>
              </td>
              <td>
                {b.image && (
                  <img
                    src={b.image}
                    alt="Business"
                    width="50"
                    height="50"
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                )}
              </td>
              <td>
                {b.verification === "verified" ? (
                  <span className="badge bg-success">Verified</span>
                ) : (
                  <span className="badge bg-warning text-dark">Pending</span>
                )}
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEditBusiness(b)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteBusiness(b.id)}
                  >
                    <FaTrash />
                  </Button>
                  <Button
                    variant={b.verification === "verified" ? "danger" : "success"}
                    size="sm"
                    onClick={() => handleShowVerifyModal(b)}
                  >
                    {b.verification === "verified" ? <FaBan /> : <FaCheckCircle />}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Business Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Business Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="companyName" className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={formValues.companyName || ""}
                onChange={handleChange}
                isInvalid={!!formErrors.companyName}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.companyName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="phoneOffice" className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phoneOffice"
                value={formValues.phoneOffice || ""}
                onChange={handleChange}
                isInvalid={!!formErrors.phoneOffice}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phoneOffice}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="address" className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formValues.address || ""}
                onChange={handleChange}
                isInvalid={!!formErrors.address}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.address}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="websiteURL" className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="text"
                name="websiteURL"
                value={formValues.websiteURL || ""}
                onChange={handleChange}
                isInvalid={!!formErrors.websiteURL}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.websiteURL}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formValues.description || ""}
                onChange={handleChange}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="file" className="mb-3">
              <Form.Label>Image (Optional)</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <Form.Text className="text-muted">
                Leave empty to keep current image
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateBusiness}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verify/Unverify Modal */}
      <Modal show={showVerifyModal} onHide={handleCloseVerifyModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedBusiness ? `Change Verification for ${selectedBusiness.companyName}` : "Loading..."}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBusiness ? (
            <>
              <p>Current status: <strong>{selectedBusiness.verification}</strong></p>
              <p>Are you sure you want to change it to <strong>{selectedBusiness.verification === "verified" ? "pending" : "verified"}</strong>?</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVerifyModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVerifyBusiness}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BusinessInfoTable;