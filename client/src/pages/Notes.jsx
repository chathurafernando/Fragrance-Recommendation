import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    Form,
    Modal,
    Table,
    Alert,
    Spinner
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Notes = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null,
    });
    const [formErrors, setFormErrors] = useState({});
    const [notes, setNotes] = useState([]);
    const [show, setShow] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/notes");
            setNotes(response.data);
        } catch (err) {
            console.error("Error fetching notes:", err);
            toast.error("Failed to load notes.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, image: file });
        setPreviewImage(file ? URL.createObjectURL(file) : null);
        
        // Clear image error when file is selected
        if (formErrors.image) {
            setFormErrors(prev => ({ ...prev, image: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        } else if (formData.name.trim().length < 3) {
            errors.name = "Name must be at least 3 characters long";
        }
        
        if (!formData.description.trim()) {
            errors.description = "Description is required";
        } else if (formData.description.trim().length < 10) {
            errors.description = "Description must be at least 10 characters long";
        }
        
        if (!editMode && !formData.image) {
            errors.image = "Image is required for new notes";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({ name: "", description: "", image: null });
        setFormErrors({});
        setPreviewImage(null);
        setEditMode(false);
        setSelectedNoteId(null);
    };

    const handleAddNote = async () => {
        if (!validateForm()) return;

        const formToSend = new FormData();
        formToSend.append("name", formData.name);
        formToSend.append("description", formData.description);
        formToSend.append("image", formData.image);

        setFormLoading(true);
        try {
            await axios.post("/notes", formToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Note added successfully!");
            fetchNotes();
            setShow(false);
            resetForm();
        } catch (err) {
            console.error("Error adding note:", err);
            toast.error(err.response?.data?.message || "Failed to add note.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateNote = async () => {
        if (!validateForm()) return;

        const formToSend = new FormData();
        formToSend.append("name", formData.name);
        formToSend.append("description", formData.description);
        if (formData.image) {
            formToSend.append("image", formData.image);
        }

        setFormLoading(true);
        try {
            await axios.put(`/notes/${selectedNoteId}`, formToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Note updated successfully!");
            fetchNotes();
            setShow(false);
            resetForm();
        } catch (err) {
            console.error("Error updating note:", err);
            toast.error(err.response?.data?.message || "Failed to update note.");
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (note) => {
        resetForm();
        setFormData({
            name: note.name,
            description: note.description,
            image: null,
        });
        setSelectedNoteId(note.id);
        setEditMode(true);
        setPreviewImage(note.image || null);
        setShow(true);
    };

    const openAddModal = () => {
        resetForm();
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
        resetForm();
    };

    const handleDeleteNote = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this note?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`/notes/${id}`);
            toast.success("Note deleted successfully!");
            fetchNotes();
        } catch (err) {
            console.error("Error deleting note:", err);
            toast.error(err.response?.data?.message || "Failed to delete note.");
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Notes</h4>
                <Button variant="primary" onClick={openAddModal}>
                    Add Note
                </Button>
            </div>

            {/* Loader */}
            {loading ? (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading notes...</p>
                </div>
            ) : (
                <Table striped bordered hover className="mt-4">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.length > 0 ? (
                            notes.map((note) => (
                                <tr key={note.id}>
                                    <td>{note.id}</td>
                                    <td>{note.name}</td>
                                    <td>{note.description}</td>
                                    <td>
                                        <img
                                            src={note.image}
                                            alt="Note"
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            className="me-2"
                                            onClick={() => openEditModal(note)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteNote(note.id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No notes found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            {/* Modal for Add/Edit */}
            <Modal show={show} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "Update Note" : "Add New Note"}</Modal.Title>
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
                                placeholder="Enter note name"
                                isInvalid={!!formErrors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.name}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Enter description"
                                isInvalid={!!formErrors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.description}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image {!editMode && <span className="text-danger">*</span>}</Form.Label>
                            <Form.Control 
                                type="file" 
                                onChange={handleFileChange}
                                isInvalid={!!formErrors.image}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.image}
                            </Form.Control.Feedback>
                            {previewImage && (
                                <div className="mt-2 text-center">
                                    <img 
                                        src={previewImage} 
                                        alt="Preview" 
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={formLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={editMode ? handleUpdateNote : handleAddNote}
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
                                />{" "}
                                {editMode ? "Updating..." : "Saving..."}
                            </>
                        ) : editMode ? (
                            "Update Note"
                        ) : (
                            "Save Note"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Notes;