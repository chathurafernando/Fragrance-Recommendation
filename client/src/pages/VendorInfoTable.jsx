import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Modal, Form } from "react-bootstrap";
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
    img: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get("/vendors"); // update URL as needed
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (vendor) => {
    setEditVendor({
      id: vendor.id,
      username: vendor.username,
      email: vendor.email,
      phone: vendor.phone,
      img: vendor.img,
    });
    setSelectedFile(null); // Reset file input when editing
    setShowModal(true);
  };

  const handleChange = (e) => {
    setEditVendor({ ...editVendor, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("username", editVendor.username);
    formData.append("email", editVendor.email);
    formData.append("phone", editVendor.phone);
  
    if (selectedFile) {
      formData.append("img", selectedFile);
    }
  
    try {
      const response = await axios.put(`/vendors/${editVendor.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.message === "Vendor has been updated successfully.") {
        setShowModal(false);
        setSuccessMessage("Vendor updated successfully.");
        fetchVendors();
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      setErrorMessage("Failed to update vendor.");
    }
  };
  

  const handleDeleteVendor = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await axios.delete(`/vendors/${id}`);
  
        if (response.data.message === "Vendor has been deleted successfully.") {
          setSuccessMessage("Vendor deleted successfully.");
          fetchVendors();
        }
      } catch (error) {
        console.error("Error deleting vendor:", error);
        setErrorMessage("Failed to delete vendor.");
      }
    }
  };
  

  return (
    <>
      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          
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
            {vendors.map((v, index) => (
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
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteVendor(v.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
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
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={editVendor.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editVendor.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={editVendor.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="img">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              {selectedFile && (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  width="100"
                  height="100"
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                />
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              Update Vendor
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VendorInfoTable;
