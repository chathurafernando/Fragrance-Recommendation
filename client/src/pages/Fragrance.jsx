import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Row, Col, Badge, CloseButton, Container, Spinner, Toast, ToastContainer } from "react-bootstrap";
import Select from "react-select";
import { CloudUpload } from "react-bootstrap-icons";
import axios from "axios";

const Fragrance = () => {
    const [brands, setBrands] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [fragrances, setFragrances] = useState([]);
    const [notesOptions, setNotesOptions] = useState([]);
    const [editingFragranceId, setEditingFragranceId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [perfumeData, setPerfumeData] = useState({
        brand: "",
        name: "",
        description: "",
        image: null,
        topNotes: [],
        middleNotes: [],
        baseNotes: [],
        looking_for: "",
        age_range: "",
        occasion: "",
        smell: "",
        intensity: "",
    });

    // Toast notification helper
    const showToast = (message, type = "success") => {
        const newToast = {
            id: Date.now(),
            message,
            type
        };
        setToasts(prev => [...prev, newToast]);
    };

    // Form validation
    const validateForm = () => {
        const errors = {};

        if (!perfumeData.brand) {
            errors.brand = "Brand is required";
        }

        if (!perfumeData.name.trim()) {
            errors.name = "Name is required";
        }

        if (!perfumeData.description.trim()) {
            errors.description = "Description is required";
        } else if (perfumeData.description.length < 20) {
            errors.description = "Description should be at least 20 characters";
        }

        if (!perfumeData.looking_for) {
            errors.looking_for = "Please select who the fragrance is for";
        }

        if (!perfumeData.age_range) {
            errors.age_range = "Age range is required";
        }

        if (!perfumeData.occasion) {
            errors.occasion = "Occasion is required";
        }

        if (!perfumeData.smell) {
            errors.smell = "Smell type is required";
        }

        if (!perfumeData.intensity) {
            errors.intensity = "Intensity is required";
        }

        if (!isEditing && !perfumeData.image) {
            errors.image = "Perfume image is required";
        }

        if (perfumeData.topNotes.length === 0 && 
            perfumeData.middleNotes.length === 0 && 
            perfumeData.baseNotes.length === 0) {
            errors.notes = "At least one note (top, middle, or base) is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Fetch fragrances from backend
    const getFragrances = async () => {
        setApiLoading(true);
        try {
            const response = await axios.get("/fragrance");
            if (Array.isArray(response.data.fragrances)) {
                setFragrances(response.data.fragrances);
            } else {
                setFragrances([]);
                showToast("No fragrances found", "warning");
            }
        } catch (error) {
            console.error("Error fetching fragrances:", error);
            showToast("Failed to load fragrances. Please try again.", "danger");
            setFragrances([]);
        } finally {
            setApiLoading(false);
        }
    };

    // Fetch brands from backend
    const fetchBrands = async () => {
        setApiLoading(true);
        try {
            const res = await axios.get("/brands");
            setBrands(res.data);
        } catch (err) {
            console.error("Error fetching brands:", err);
            showToast("Failed to load brands. Please try again.", "danger");
        } finally {
            setApiLoading(false);
        }
    };

    // Fetch notes from backend
    const fetchNotes = async () => {
        setApiLoading(true);
        try {
            const response = await axios.get("/notes");
            const options = response.data.map(note => ({
                value: note.id,
                label: note.name,
            }));
            setNotesOptions(options);
        } catch (error) {
            console.error("Error fetching notes:", error);
            showToast("Failed to load notes. Please try again.", "danger");
        } finally {
            setApiLoading(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        getFragrances();
        fetchBrands();
        fetchNotes();
    }, []);

    // Show modal for adding new fragrance
    const handleShow = () => {
        setIsEditing(false);
        setFormErrors({});
        setPerfumeData({
            brand: "",
            name: "",
            description: "",
            image: null,
            topNotes: [],
            middleNotes: [],
            baseNotes: [],
            looking_for: "",
            age_range: "",
            occasion: "",
            smell: "",
            intensity: "",
        });
        setShowModal(true);
    };

    // Edit existing fragrance
    const handleEdit = (fragrance) => {
        setFormErrors({});
        
        // Transform note objects to {value, label} format
        const transformNotes = (notes) => {
            if (!notes) return [];
            
            return notes.map(note => {
                // If note is just an ID, find the full object in notesOptions
                const noteObject = typeof note === 'object' && note.value ? 
                    note : 
                    notesOptions.find(opt => opt.value === (typeof note === 'object' ? note.id : note));
                
                if (!noteObject) return null;
                
                return {
                    value: noteObject.value,
                    label: noteObject.label
                };
            }).filter(Boolean); // Remove any null values
        };

        try {
            setPerfumeData({
                brand: fragrance.brand?.id || "",
                name: fragrance.name || "",
                description: fragrance.description || "",
                image: null, // We don't load the image for editing, just keep the existing one
                topNotes: fragrance.noteGroups?.Top ? transformNotes(fragrance.noteGroups.Top) : [],
                middleNotes: fragrance.noteGroups?.Middle ? transformNotes(fragrance.noteGroups.Middle) : [],
                baseNotes: fragrance.noteGroups?.Base ? transformNotes(fragrance.noteGroups.Base) : [],
                looking_for: fragrance.looking_for || "",
                age_range: fragrance.age_range || "",
                occasion: fragrance.occasion || "",
                smell: fragrance.smell || "",
                intensity: fragrance.intensity || "",
            });

            setEditingFragranceId(fragrance.id);
            setIsEditing(true);
            setShowModal(true);
        } catch (error) {
            console.error("Error preparing fragrance data for editing:", error);
            showToast("Failed to load fragrance details for editing.", "danger");
        }
    };

    // Delete fragrance
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fragrance?")) {
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.delete(`/fragrance/${id}`);
            showToast(response.data.message || "Fragrance deleted successfully");
            setFragrances((prevFragrances) => prevFragrances.filter((fragrance) => fragrance.id !== id));
        } catch (error) {
            const errorMsg = error.response?.data?.error || 
                error.response?.data?.message || 
                "Error deleting fragrance.";
            showToast(errorMsg, "danger");
        } finally {
            setLoading(false);
        }
    };

    // Close modal
    const handleClose = () => setShowModal(false);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPerfumeData({
            ...perfumeData,
            [name]: name === "brand" ? parseInt(value) : value,
        });
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    // Handle notes changes
    const handleNotesChange = (selectedNotes, category) => {
        // Ensure we always have an array of {value, label} objects
        const newNotes = selectedNotes ? selectedNotes.map(note => ({
            value: note.value,
            label: note.label
        })) : [];

        setPerfumeData({
            ...perfumeData,
            [category]: newNotes
        });
        
        // Clear notes error if at least one note is selected
        if (formErrors.notes && (newNotes.length > 0 || 
            (category !== "topNotes" && perfumeData.topNotes.length > 0) || 
            (category !== "middleNotes" && perfumeData.middleNotes.length > 0) || 
            (category !== "baseNotes" && perfumeData.baseNotes.length > 0))) {
            setFormErrors(prev => ({ ...prev, notes: "" }));
        }
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPerfumeData(prev => ({ ...prev, image: file }));
            
            // Clear image error when file is selected
            if (formErrors.image) {
                setFormErrors(prev => ({ ...prev, image: "" }));
            }
        }
    };

    // Save or update fragrance
    const handleSave = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        const formData = new FormData();

        // Append basic fields
        formData.append("bid", perfumeData.brand);
        formData.append("name", perfumeData.name);
        formData.append("description", perfumeData.description);
        formData.append("looking_for", perfumeData.looking_for);
        formData.append("age_range", perfumeData.age_range);
        formData.append("occasion", perfumeData.occasion);
        formData.append("smell", perfumeData.smell);
        formData.append("intensity", perfumeData.intensity);

        // Attach image only if it's a File (not a URL string)
        if (perfumeData.image instanceof File) {
            formData.append("image", perfumeData.image);
        }

        // Prepare and filter notes
        const allNotes = [
            ...perfumeData.topNotes.map(note => ({ NoteId: note.value, noteType: "Top" })),
            ...perfumeData.middleNotes.map(note => ({ NoteId: note.value, noteType: "Middle" })),
            ...perfumeData.baseNotes.map(note => ({ NoteId: note.value, noteType: "Base" })),
        ].filter(note => note.NoteId !== undefined && note.NoteId !== null);

        // Append notes in a structure the backend expects
        allNotes.forEach((note, index) => {
            formData.append(`notes[${index}][NoteId]`, note.NoteId);
            formData.append(`notes[${index}][noteType]`, note.noteType);
        });

        try {
            if (isEditing) {
                await axios.put(`/fragrance/${editingFragranceId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showToast("Fragrance updated successfully!");
            } else {
                await axios.post("/fragrance", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showToast("Fragrance added successfully!");
            }

            handleClose();    // Close modal/form
            getFragrances();  // Refresh fragrance list
        } catch (error) {
            console.error("Error saving fragrance:", error);
            const errorMsg = error.response?.data?.error || 
                error.response?.data?.message || 
                (typeof error.response?.data === "string" ? error.response.data : null) || 
                "Error saving fragrance.";
            showToast(errorMsg, "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
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

            <h4>Perfume Management</h4>
            <Button variant="primary" onClick={handleShow}>Add Perfume</Button>

            {/* Perfume Table */}
            {apiLoading ? (
                <div className="text-center mt-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cover Image</th>
                            <th>Brand</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Looking For</th>
                            <th>Age Range</th>
                            <th>Occasion</th>
                            <th>Smell</th>
                            <th>Intensity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fragrances.length > 0 ? (
                            fragrances.map((fragrance) => (
                                <tr key={fragrance.id}>
                                    <td>{fragrance.id}</td>
                                    <td>
                                        {fragrance.image ? (
                                            <img src={fragrance.image} alt="cover" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                        ) : (
                                            "No Image"
                                        )}
                                    </td>
                                    <td>{fragrance.brand?.name || "N/A"}</td>
                                    <td>{fragrance.name}</td>
                                    <td>{fragrance.description}</td>
                                    <td>{fragrance.looking_for}</td>
                                    <td>{fragrance.age_range}</td>
                                    <td>{fragrance.occasion}</td>
                                    <td>{fragrance.smell}</td>
                                    <td>{fragrance.intensity}</td>
                                    <td>
                                        <Button variant="secondary" size="sm" className="me-1" onClick={() => handleEdit(fragrance)}>Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(fragrance.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center">No fragrances found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            {/* Modal for Add/Edit Perfume */}
            <Modal show={showModal} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Edit Perfume" : "Add Perfume"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <h5>Basic Details</h5>
                            <Form>
                                <Form.Group className="mb-2">
                                    <Form.Label>Brand</Form.Label>
                                    <Form.Select
                                        name="brand"
                                        value={perfumeData.brand}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.brand}
                                    >
                                        <option value="">Select a brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.brand}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={perfumeData.name}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="description"
                                        value={perfumeData.description}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.description}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Image</Form.Label>
                                    <div className="d-flex align-items-center border p-2 rounded">
                                        <CloudUpload size={24} className="me-2" />
                                        <span>Upload Image</span>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    {formErrors.image && (
                                        <div className="text-danger small mt-1">{formErrors.image}</div>
                                    )}
                                </Form.Group>
                                
                                <Form.Group className="mb-2">
                                    <Form.Label>Looking For</Form.Label>
                                    <Form.Select
                                        name="looking_for"
                                        value={perfumeData.looking_for}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.looking_for}
                                    >
                                        <option value="">Select</option>
                                        <option value="Her">Her</option>
                                        <option value="Him">Him</option>
                                        <option value="Both">Both</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.looking_for}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Age Range</Form.Label>
                                    <Form.Select
                                        name="age_range"
                                        value={perfumeData.age_range}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.age_range}
                                    >
                                        <option value="">Select</option>
                                        <option value="below 18">below 18</option>
                                        <option value="in 20s">in 20s</option>
                                        <option value="in 30s">in 30s</option>
                                        <option value="in 40s">in 40s</option>
                                        <option value="in 50s">in 50s</option>
                                        <option value="above 50">above 50</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.age_range}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form>
                        </Col>

                        <Col md={6}>
                            <Form>
                                <Form.Group className="mb-2">
                                    <Form.Label>Occasion</Form.Label>
                                    <Form.Select
                                        name="occasion"
                                        value={perfumeData.occasion}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.occasion}
                                    >
                                        <option value="">Select</option>
                                        <option value="Office">Office</option>
                                        <option value="Club">Club</option>
                                        <option value="Casual">Casual</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.occasion}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Smell</Form.Label>
                                    <Form.Select
                                        name="smell"
                                        value={perfumeData.smell}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.smell}
                                    >
                                        <option value="">Select</option>
                                        <option value="Fruity">Fruity</option>
                                        <option value="Fresh">Fresh</option>
                                        <option value="Mint">Mint</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.smell}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Intensity</Form.Label>
                                    <Form.Select
                                        name="intensity"
                                        value={perfumeData.intensity}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.intensity}
                                    >
                                        <option value="">Select</option>
                                        <option value="EDP">EDP</option>
                                        <option value="EDT">EDT</option>
                                        <option value="Parfum">Parfum</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.intensity}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <h5 className="mt-3">Notes</h5>
                                {formErrors.notes && (
                                    <div className="text-danger small mb-2">{formErrors.notes}</div>
                                )}

                                <Form.Group className="mb-2">
                                    <Form.Label>Top Notes</Form.Label>
                                    <Select
                                        options={notesOptions}
                                        isMulti
                                        value={perfumeData.topNotes}
                                        onChange={(selected) => handleNotesChange(selected, "topNotes")}
                                        placeholder="Select top notes..."
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Middle Notes</Form.Label>
                                    <Select
                                        options={notesOptions}
                                        isMulti
                                        value={perfumeData.middleNotes}
                                        onChange={(selected) => handleNotesChange(selected, "middleNotes")}
                                        placeholder="Select middle notes..."
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Base Notes</Form.Label>
                                    <Select
                                        options={notesOptions}
                                        isMulti
                                        value={perfumeData.baseNotes}
                                        onChange={(selected) => handleNotesChange(selected, "baseNotes")}
                                        placeholder="Select base notes..."
                                    />
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                {isEditing ? "Updating..." : "Saving..."}
                            </>
                        ) : (
                            isEditing ? "Update" : "Save"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Fragrance;