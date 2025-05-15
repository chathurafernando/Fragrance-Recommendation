import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Modal,
  Image,
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/brands");
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleShow = (brand = null) => {
    setShowModal(true);
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description,
        image: null, // Keep the existing image unless changed
      });
    } else {
      setEditingBrand(null);
      setFormData({ name: "", description: "", image: null });
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({ name: "", description: "", image: null });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingBrand) {
        await axios.put(`/brands/${editingBrand.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/brands", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      handleClose();
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
    }
  };
  const handleDeleteBrand = async (id) => {
    try {
      await axios.delete(`/brands/${id}`);
      fetchBrands(); // Refresh the notes after deletion
    } catch (err) {
      console.error("Error deleting brands:", err);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Brand Management</h4>
            <Button variant="primary" onClick={() => handleShow()}>
              Add Brand
            </Button>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.id}</td>
                  <td>
                    {brand.image ? (
                      <Image src={brand.image} width="40" height="40" rounded />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{brand.name}</td>
                  <td>{brand.description}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShow(brand)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteBrand(brand.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Add/Edit Brand Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingBrand ? "Edit Brand" : "Add Brand"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
              {editingBrand && editingBrand.image && (
                <div className="mt-2">
                  <Image src={editingBrand.image} width="50" height="50" rounded />
                  <p className="text-muted">Current Image</p>
                </div>
              )}
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              {editingBrand ? "Update" : "Save"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default BrandManagement;
