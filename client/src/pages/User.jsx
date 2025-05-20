import React, { useState, useEffect } from "react";
import { Table, Button, Image, Modal, Form, Alert, Spinner, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    phone: "", 
    image: null 
  });
  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (!editMode && !formData.image) {
      errors.image = "Image is required for new users";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShowModal = () => {
    setShowModal(true);
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingUserId(null);
    setFormData({ username: "", email: "", phone: "", image: null });
    setPreviewImage(null);
    setFormErrors({});
    setLoading(false);
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
    setPreviewImage(file ? URL.createObjectURL(file) : null);
    
    // Clear image error when file is selected
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const fetchUsers = async () => {
    setApiLoading(true);
    try {
      const res = await axios.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      showToast("Failed to load users. Please try again.", "danger");
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditMode(true);
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      phone: user.phone,
      image: null,
    });
    setPreviewImage(user.img || null);
    handleShowModal();
  };

  const handleDeleteClick = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await axios.delete(`/users/${userId}`);
      showToast(res.data.message || "User deleted successfully!");
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data || "Failed to delete user.";
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const form = new FormData();
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    if (formData.image) form.append("img", formData.image);

    try {
      if (editMode) {
        const res = await axios.put(`/users/${editingUserId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast(res.data.message || "User updated successfully!");
      } else {
        const res = await axios.post("/users", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast(res.data.message || "User added successfully!");
      }

      fetchUsers();
      handleCloseModal();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      err.response?.data || 
                      "Failed to save user.";
      showToast(errorMsg, "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 mt-4">
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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>User Management</h3>
        <Button 
          variant="success" 
          onClick={() => { 
            setEditMode(false); 
            handleShowModal(); 
          }}
        >
          Add New User
        </Button>
      </div>

      {apiLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table bordered hover responsive className="text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.img ? (
                      <Image src={user.img} rounded width={40} height={40} />
                    ) : (
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: "#ccc", 
                        borderRadius: 5 
                      }} />
                    )}
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="me-2" 
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(user.id)}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No users found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Update User" : "Add New User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                name="username" 
                type="text" 
                value={formData.username} 
                onChange={handleInputChange}
                isInvalid={!!formErrors.username}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control 
                name="phone" 
                type="text" 
                value={formData.phone} 
                onChange={handleInputChange}
                isInvalid={!!formErrors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image {!editMode && <span className="text-danger">*</span>}</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                isInvalid={!!formErrors.image}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.image}
              </Form.Control.Feedback>
              {previewImage && (
                <div className="mt-2 text-center">
                  <Image src={previewImage} rounded width={80} height={80} />
                </div>
              )}
              {editMode && !previewImage && formData.img && (
                <div className="mt-2 text-center">
                  <Image src={formData.img} rounded width={80} height={80} />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {editMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              editMode ? "Update User" : "Add User"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;