import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Modal, Form, Container, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";

const VendorInfoTable = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState({
    id: "",
    username: "",
    email: "",
    phone: "",
    img: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token || null;

  useEffect(() => {
    fetchVendors();
  }, []);

  const showToast = (message, type = "success") => {
    const newToast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get("/vendors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      showToast("Failed to load vendors. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!editVendor.username.trim()) {
      errors.username = "Username is required";
    }

    if (!editVendor.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(editVendor.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!editVendor.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(editVendor.phone)) {
      errors.phone = "Phone number must be 10 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditClick = (vendor) => {
    setEditVendor({
      id: vendor.id,
      username: vendor.username,
      email: vendor.email,
      phone: vendor.phone,
      img: vendor.img
    });
    setSelectedFile(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditVendor(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    setSubmitting(true);
    const formData = new FormData();
    formData.append("username", editVendor.username);
    formData.append("email", editVendor.email);
    formData.append("phone", editVendor.phone);
  
    if (selectedFile) {
      formData.append("img", selectedFile);
    }
  
    try {
      const response = await axios.put(`/vendors/${editVendor.id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
  
      showToast(response.data.message || "Vendor updated successfully!");
      setShowModal(false);
      fetchVendors();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                    error.response?.data?.message || 
                    (typeof error.response?.data === "string" ? error.response.data : null) || 
                    "Error updating vendor.";
      showToast(errorMsg, "danger");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteVendor = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await axios.delete(`/vendors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        showToast(response.data.message || "Vendor deleted successfully!");
        fetchVendors();
      } catch (error) {
        const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      (typeof error.response?.data === "string" ? error.response.data : null) || 
                      "Error deleting vendor.";
        showToast(errorMsg, "danger");
      }
    }
  };

  return (
    <Container fluid className="px-4 mt-4">
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
            <Toast.Body className={toast.type === "danger" ? "text-white" : ""}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      <h3>Vendor Management</h3>
      
      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <p>Loading vendors...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length > 0 ? (
              vendors.map((v, index) => (
                <tr key={v.id || `${v.username}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{v.username}</td>
                  <td>{v.email}</td>
                  <td>{v.phone}</td>
                  <td>
                    {v.img && (
                      <img
                        src={v.img}
                        alt="Vendor"
                        width="50"
                        height="50"
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                      />
                    )}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEditClick(v)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteVendor(v.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Edit Vendor Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateVendor}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={editVendor.username}
                onChange={handleChange}
                isInvalid={!!formErrors.username}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editVendor.email}
                onChange={handleChange}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={editVendor.phone}
                onChange={handleChange}
                isInvalid={!!formErrors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="img">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              <div className="mt-2">
                {selectedFile ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="mt-2"
                    width="100"
                    height="100"
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                ) : editVendor.img ? (
                  <img
                    src={editVendor.img}
                    alt="Current"
                    className="mt-2"
                    width="100"
                    height="100"
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                ) : null}
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  "Update Vendor"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VendorInfoTable;