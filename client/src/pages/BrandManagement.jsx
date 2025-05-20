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
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/brands");
      setBrands(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching brands.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Brand name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Brand name must be at least 3 characters";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }
    
    if (!editingBrand && !formData.image) {
      errors.image = "Brand image is required";
    } else if (formData.image) {
      if (!formData.image.type.match('image.*')) {
        errors.image = "Please select a valid image file";
      } else if (formData.image.size > 2 * 1024 * 1024) { // 2MB limit
        errors.image = "Image size should be less than 2MB";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShow = (brand = null) => {
    setShowModal(true);
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description,
        image: null,
      });
      setPreviewImage(brand.image || null);
    } else {
      setEditingBrand(null);
      setFormData({ name: "", description: "", image: null });
      setPreviewImage(null);
    }
    setFormErrors({});
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({ name: "", description: "", image: null });
    setPreviewImage(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
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
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
      
      // Clear image error when file is selected
      if (formErrors.image) {
        setFormErrors(prev => ({ ...prev, image: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      setFormLoading(true);
      if (editingBrand) {
        await axios.put(`/brands/${editingBrand.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Brand updated successfully!");
      } else {
        await axios.post("/brands", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Brand added successfully!");
      }
      handleClose();
      fetchBrands();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      (typeof error.response?.data === "string" ? error.response.data : null) || 
                      "Failed to save brand.";
      toast.error(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      setLoading(true);
      const response = await axios.delete(`/brands/${id}`);
      toast.success(response.data?.message || "Brand deleted successfully!");
      fetchBrands();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      (typeof error.response?.data === "string" ? error.response.data : null) || 
                      "Failed to delete brand.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vw-100 vh-100 overflow-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="d-flex flex-column" style={{ minWidth: '100%' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Brand Management</h4>
          <Button variant="primary" onClick={() => handleShow()}>
            Add Brand
          </Button>
        </div>

        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" />
            <p>Loading brands...</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
            <Table striped bordered hover style={{ minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>ID</th>
                  <th style={{ width: '10%' }}>Image</th>
                  <th style={{ width: '20%' }}>Name</th>
                  <th style={{ width: '45%' }}>Description</th>
                  <th style={{ width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <tr key={brand.id}>
                      <td>{brand.id}</td>
                      <td>
                        {brand.image ? (
                          <Image
                            src={brand.image}
                            width={50}
                            height={50}
                            rounded
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td>{brand.name}</td>
                      <td className="text-wrap">{brand.description}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleShow(brand)}
                          disabled={loading}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteBrand(brand.id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No brands found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Brand Modal - Made wider */}
      <Modal 
        show={showModal} 
        onHide={handleClose} 
        backdrop="static"
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBrand ? "Edit Brand" : "Add Brand"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!formErrors.name}
                placeholder="Enter brand name"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!formErrors.description}
                placeholder="Enter brand description"
                style={{ resize: 'vertical' }}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image {!editingBrand && <span className="text-danger">*</span>}</Form.Label>
              <Form.Control 
                type="file" 
                onChange={handleFileChange}
                isInvalid={!!formErrors.image}
                accept="image/*"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.image}
              </Form.Control.Feedback>
              <div className="d-flex flex-wrap gap-3 mt-3">
                {previewImage && (
                  <div>
                    <p className="text-muted mb-1">New Image:</p>
                    <Image
                      src={previewImage}
                      width={150}
                      height={150}
                      rounded
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                {editingBrand?.image && !previewImage && (
                  <div>
                    <p className="text-muted mb-1">Current Image:</p>
                    <Image
                      src={editingBrand.image}
                      width={150}
                      height={150}
                      rounded
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {editingBrand ? "Updating..." : "Saving..."}
              </>
            ) : editingBrand ? (
              "Update Brand"
            ) : (
              "Save Brand"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BrandManagement;