import React, { useState, useEffect } from "react";
import { Table, Button, Image, Modal, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ username: "", email: "", phone: "", image: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [formAlert, setFormAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
    setFormAlert({ type: "", message: "" });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingUserId(null);
    setFormData({ username: "", email: "", phone: "", image: null });
    setPreviewImage(null);
    setFormAlert({ type: "", message: "" });
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
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
      const res = await axios.delete(`/users/${userId}`);
      setAlert({ type: "success", message: res.data.message || "User deleted successfully!" });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data || "Failed to delete user.";
      setAlert({ type: "danger", message: typeof msg === "string" ? msg : JSON.stringify(msg) });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFormAlert({ type: "", message: "" });

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
        setAlert({ type: "success", message: res.data.message || "User updated successfully!" });
      } else {
        const res = await axios.post("/users", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ type: "success", message: res.data.message || "User added successfully!" });
      }

      fetchUsers();
      handleCloseModal();
    } catch (err) {
      const msg = err.response?.data || "Failed to save user.";
      setFormAlert({ type: "danger", message: typeof msg === "string" ? msg : JSON.stringify(msg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>User Management</h3>
        <Button variant="success" onClick={() => { setEditMode(false); handleShowModal(); }}>
          Add New User
        </Button>
      </div>

      {alert.message && (
        <Alert variant={alert.type} onClose={() => setAlert({})} dismissible>
          {alert.message}
        </Alert>
      )}

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
                    <div style={{ width: 40, height: 40, backgroundColor: "#ccc", borderRadius: 5 }} />
                  )}
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditClick(user)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user.id)}>
                    Delete
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

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Update User" : "Add New User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formAlert.message && <Alert variant={formAlert.type}>{formAlert.message}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="username" type="text" value={formData.username} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phone" type="text" value={formData.phone} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              {previewImage && (
                <div className="mt-2 text-center">
                  <Image src={previewImage} rounded width={80} height={80} />
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
