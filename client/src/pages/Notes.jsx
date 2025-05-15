import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Modal, Table, Alert } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa"; // Importing Bootstrap edit and trash icons

const Notes = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null,
    });
    const [notes, setNotes] = useState([]);
    const [show, setShow] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(""); // Add state for success message

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await axios.get("/notes");
            setNotes(response.data);
        } catch (err) {
            console.error("Error fetching notes:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleAddNote = async () => {
        const formToSend = new FormData();
        formToSend.append("name", formData.name);
        formToSend.append("description", formData.description);
        formToSend.append("image", formData.image);

        setShow(false); // Close modal immediately

        try {
            await axios.post("/notes", formToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMessage("Note added successfully!"); // Set success message
            fetchNotes(); // Refresh the notes after adding
        } catch (err) {
            console.error("Error adding note:", err);
        }
    };

    const handleUpdateNote = async () => {
        if (!selectedNoteId) return;

        const formToSend = new FormData();
        formToSend.append("name", formData.name);
        formToSend.append("description", formData.description);
        if (formData.image) {
            formToSend.append("image", formData.image);
        }

        setShow(false); // Close modal immediately

        try {
            await axios.put(`/notes/${selectedNoteId}`, formToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMessage("Note updated successfully!"); // Set success message
            fetchNotes(); // Refresh the notes after updating
        } catch (err) {
            console.error("Error updating note:", err);
        }
    };

    const openEditModal = (note) => {
        setFormData({
            name: note.name,
            description: note.description,
            image: null, // Reset the image field for optional update
        });
        setSelectedNoteId(note.id);
        setEditMode(true);
        setShow(true);
    };

    const openAddModal = () => {
        setFormData({
            name: "",
            description: "",
            image: null,
        });
        setEditMode(false); // Reset edit mode to false
        setShow(true);
    };

    const handleDeleteNote = async (id) => {
        try {
            await axios.delete(`/notes/${id}`);
            fetchNotes(); // Refresh the notes after deletion
        } catch (err) {
            console.error("Error deleting note:", err);
        }
    };

    return (
        <>
            {successMessage && (
                <Alert variant="success" onClose={() => setSuccessMessage("")} dismissible>
                    {successMessage}
                </Alert>
            )}

            <Button variant="primary" onClick={openAddModal}>
                Add Note
            </Button>

            <Modal show={show} onHide={() => setShow(false)}>
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
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Form.Group>
                        <Button variant="primary" onClick={editMode ? handleUpdateNote : handleAddNote}>
                            {editMode ? "Update Note" : "Save Note"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Table to display notes */}
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
                    {notes.map((note) => (
                        <tr key={note.id}>
                            <td>{note.id}</td>
                            <td>{note.name}</td>
                            <td>{note.description}</td>
                            <td>
                                <img
                                    src={note.image}
                                    alt="Note"
                                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                />
                            </td>
                            <td>
                                <Button variant="warning" className="me-2" onClick={() => openEditModal(note)}>
                                    <FaEdit />
                                </Button>
                                <Button variant="danger" onClick={() => handleDeleteNote(note.id)}>
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
};

export default Notes;
