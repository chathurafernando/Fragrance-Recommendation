import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Row, Col, Badge, CloseButton } from "react-bootstrap";
import Select from "react-select";
import { CloudUpload } from "react-bootstrap-icons";
import axios from "axios";

const Fragrance = () => {
    const [brands, setBrands] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [fragrances, setFragrances] = useState([]); // Store fetched fragrances
    const [notesOptions, setNotesOptions] = useState([]);
    const [editingFragranceId, setEditingFragranceId] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // Track whether we are editing
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


    // Fetch all fragrances from backend
    const getFragrances = async () => {
        try {
            const response = await axios.get("/fragrance");
            console.log("Data",response.data)
            if (Array.isArray(response.data.fragrances)) {
                setFragrances(response.data.fragrances);
            } else {
                setFragrances([]);
            }
        } catch (error) {
            console.error("Error fetching fragrances:", error);
            setFragrances([]);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await axios.get("/brands"); // Use your actual endpoint
            setBrands(res.data); // Ensure it matches your backend response format
        } catch (err) {
            console.error("Error fetching brands:", err);
        }
    };

    // Fetch all fragrances when component loads
    useEffect(() => {
        getFragrances();
    }, []);
    useEffect(() => {
        fetchBrands();
    }, []);
    // Fetch all notes from backend
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch("/notes");
                const data = await response.json();
                const options = data.map(note => ({
                    value: note.id,
                    label: note.name,
                }));
                setNotesOptions(options);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };

        fetchNotes();
    }, []);

    const handleShow = () => {
        setIsEditing(false);
        setPerfumeData({
            brand: "",
            name: "",
            description: "",
            image: null,
            topNotes: [],
            middleNotes: [],
            baseNotes: [],
        });
        setShowModal(true);
    };

    const handleEdit = (fragrance) => {
        console.log("Full Fragrance Response:", fragrance);
        console.log("Full Fragrance Response:", notesOptions);
        // Transform note objects to {value, label} format
        const transformNotes = (notes) => {
            return notes.map(note => {
                // If note is just an ID, find the full object in notesOptions
                const noteObject = typeof note === 'object' ? note : notesOptions.find(opt => opt.value === note);

                return {
                    value: noteObject.value,
                    label: noteObject.label
                };
            });
        };
        setPerfumeData({
            brand: fragrance.brand?.id || fragrance.brand || "",
            name: fragrance.name || "",
            description: fragrance.description || "",
            image: fragrance.image || null,
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
    };




    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`/fragrance/${id}`);
            console.log(response.data.message); // Log the success message
            setFragrances((prevFragrances) => prevFragrances.filter((fragrance) => fragrance.id !== id)); // Remove the deleted fragrance from the state
        } catch (error) {
            console.error("Error deleting fragrance:", error);
            alert("An error occurred while deleting the fragrance.");
        }
    };
    const handleClose = () => setShowModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPerfumeData({
            ...perfumeData,
            [name]: name === "brand" ? parseInt(value) : value,
        });
    };


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
    };

    const removeNote = (category, noteValue) => {
        setPerfumeData({
            ...perfumeData,
            [category]: perfumeData[category].filter((note) => note.value !== noteValue),
        });
    };

    const handleSave = async () => {
        const formData = new FormData();

        // ✅ Use correct field names expected by backend
        formData.append("bid", perfumeData.brand); // changed from "bid" to "brand"
        formData.append("name", perfumeData.name);
        formData.append("description", perfumeData.description);
        formData.append("looking_for", perfumeData.looking_for);
        formData.append("age_range", perfumeData.age_range);
        formData.append("occasion", perfumeData.occasion);
        formData.append("smell", perfumeData.smell);
        formData.append("intensity", perfumeData.intensity);


        // ✅ Attach image only if it's a File (not a URL string)
        if (perfumeData.image instanceof File) {
            formData.append("image", perfumeData.image);
        }

        // ✅ Prepare and filter notes
        const allNotes = [
            ...perfumeData.topNotes.map(note => ({ NoteId: note.value, noteType: "Top" })),
            ...perfumeData.middleNotes.map(note => ({ NoteId: note.value, noteType: "Middle" })),
            ...perfumeData.baseNotes.map(note => ({ NoteId: note.value, noteType: "Base" })),
        ].filter(note => note.NoteId !== undefined && note.NoteId !== null);

        // ✅ Append notes in a structure the backend expects
        allNotes.forEach((note, index) => {
            formData.append(`notes[${index}][NoteId]`, note.NoteId);
            formData.append(`notes[${index}][noteType]`, note.noteType);
        });

        // 🔍 Optional: log formData for debugging
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }

        try {
            if (isEditing) {
                console.log("Hit the Put block");
                await axios.put(`/fragrance/${editingFragranceId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                console.log("Hit the Post block");
                await axios.post("/fragrance", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            handleClose();    // Close modal/form
            getFragrances();  // Refresh fragrance list
        } catch (error) {
            console.error("Error saving fragrance:", error);
        }
    };


    const getSelectedOptions = (notes) => {
        // If notes are already in {value, label} format, return them directly
        if (notes.length > 0 && notes[0].value && notes[0].label) {
            return notes;
        }

        // Otherwise, transform from note IDs to options
        return notes.map(noteId =>
            notesOptions.find(option => option.value === noteId)
        ).filter(Boolean); // Filter out undefined values
    };

    return (
        <div className="container mt-4">
            <h4>Perfume Management</h4>
            <Button variant="primary" onClick={handleShow}>Add Perfume</Button>

            {/* Perfume Table */}
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
                                <td>{fragrance.brand.name}</td>
                                <td>{fragrance.name}</td>
                                <td>{fragrance.description}</td>
                                <td>{fragrance.looking_for}</td>
                                <td>{fragrance.age_range}</td>
                                <td>{fragrance.occasion}</td>
                                <td>{fragrance.smell}</td>
                                <td>{fragrance.intensity}</td>
                                <td>
                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(fragrance)}>Edit</Button>
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

            {/* Modal for Add/Edit Perfume */}
            <Modal show={showModal} onHide={handleClose} centered>
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
                                        required
                                    >
                                        <option value="">Select a brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>


                                <Form.Group className="mb-2">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={perfumeData.name}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="description"
                                        value={perfumeData.description}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Image(s)</Form.Label>
                                    <div className="d-flex align-items-center border p-2 rounded">
                                        <CloudUpload size={24} className="me-2" />
                                        <span>Upload Image</span>
                                        <input
                                            type="file"
                                            onChange={(e) => setPerfumeData({ ...perfumeData, image: e.target.files[0] })}
                                            accept="image/*"
                                        />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Looking For</Form.Label>
                                    <Form.Select
                                        name="looking_for"
                                        value={perfumeData.looking_for}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="Her">Her</option>
                                        <option value="Him">Him</option>
                                        <option value="Both">Both</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Age Range</Form.Label>
                                    <Form.Select
                                        name="age_range"
                                        value={perfumeData.age_range}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="below 18">below 18</option>
                                        <option value="in 20s">in 20s</option>
                                        <option value="in 30s">in 30s</option>
                                        <option value="in 40s">in 40s</option>
                                        <option value="in 50s">in 50s</option>
                                        <option value="above 50">above 50</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Occasion</Form.Label>
                                    <Form.Select
                                        name="occasion"
                                        value={perfumeData.occasion}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="Office">Office</option>
                                        <option value="Club">Club</option>
                                        <option value="Casual">Casual</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Smell</Form.Label>
                                    <Form.Select
                                        name="smell"
                                        value={perfumeData.smell}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="Fruity">Fruity</option>
                                        <option value="Fresh">Fresh</option>
                                        <option value="Mint">Mint</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Intensity</Form.Label>
                                    <Form.Select
                                        name="intensity"
                                        value={perfumeData.intensity}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="EDP">EDP</option>
                                        <option value="EDT">EDT</option>
                                        <option value="Parfum">Parfum</option>
                                    </Form.Select>
                                </Form.Group>

                            </Form>
                        </Col>

                        <Col md={6}>
                            <h5>Notes</h5>
                            <Form.Group className="mb-2">
                                <Form.Label>Top Notes</Form.Label>
                                <Select
                                    options={notesOptions}
                                    isMulti
                                    value={perfumeData.topNotes} // Directly use the notes array
                                    onChange={(selected) => handleNotesChange(selected, "topNotes")}
                                    placeholder="Select top notes..."
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Middle Notes</Form.Label>
                                <Select
                                    options={notesOptions}
                                    isMulti
                                    value={perfumeData.middleNotes} // Directly use the notes array
                                    onChange={(selected) => handleNotesChange(selected, "middleNotes")}
                                    placeholder="Select top notes..."
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Base Notes</Form.Label>
                                <Select
                                    options={notesOptions}
                                    isMulti
                                    value={perfumeData.baseNotes} // Directly use the notes array
                                    onChange={(selected) => handleNotesChange(selected, "baseNotes")}
                                    placeholder="Select top notes..."
                                />
                            </Form.Group>

                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSave}>
                        {isEditing ? "Update" : "Save"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Fragrance;
