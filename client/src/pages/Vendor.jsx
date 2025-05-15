// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
// import { FaTrash, FaEdit, FaCheckCircle } from "react-icons/fa";
// import axios from "axios";

// const SellerManagement = () => {
//     const [showAdd, setShowAdd] = useState(false);
//     const [showEdit, setShowEdit] = useState(false); // State for editing vendor
//     const [showVerify, setShowVerify] = useState(false);
//     const [selectedSeller, setSelectedSeller] = useState(null);
//     const [verificationStatus, setVerificationStatus] = useState("");
//     const [sellers, setSellers] = useState([]); // Store fetched vendors

//     const [vendorData, setVendorData] = useState({
//         username: "",
//         email: "",
//         websiteURL: "",
//         address: "",
//         description: "",
//         verification: "pending", // Default value
//         role: "Vendor", // Default role
//         phone: "",
//         image: null, // For image upload
//     });


//     useEffect(() => {
//         fetchVendors();
//     }, []);

//     const fetchVendors = async () => {
//         try {
//             const response = await axios.get("/vendors"); // Ensure the endpoint matches your backend
//             setSellers(response.data);
//         } catch (error) {
//             console.error("Error fetching vendors:", error);
//         }
//     };

//     const handleAddClose = () => setShowAdd(false);
//     const handleAddShow = () => setShowAdd(true);
//     const handleVerifyClose = () => setShowVerify(false);

//     const handleChange = (e) => {
//         setVendorData({ ...vendorData, [e.target.name]: e.target.value });
//     };

//     const handleFileChange = (e) => {
//         setVendorData({ ...vendorData, image: e.target.files[0] });
//     };


//     const handleAddVendor = async () => {
//         const formToSend = new FormData();
//         formToSend.append("username", vendorData.username);
//         formToSend.append("email", vendorData.email);
//         formToSend.append("websiteURL", vendorData.websiteURL);
//         formToSend.append("address", vendorData.address);
//         formToSend.append("description", vendorData.description);
//         formToSend.append("verification", vendorData.verification);
//         formToSend.append("role", vendorData.role);
//         formToSend.append("phone", vendorData.phone);

//         if (vendorData.image) {
//             formToSend.append("img", vendorData.image);
//         }

//         setShowAdd(false); // Close modal

//         try {
//             await axios.post("/vendors", formToSend, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });
//             fetchVendors(); // Refresh vendor list
//         } catch (error) {
//             console.error("Error adding vendor:", error);
//         }
//     };


//     const handleEditShow = (seller) => {
//         setSelectedSeller(seller);
//         setVendorData({
//             name: seller.name || '',
//             username: seller.username || '',
//             email: seller.email || '',
//             websiteURL: seller.websiteURL || '',
//             address: seller.address || '',
//             phone: seller.phone || '',
//             description: seller.description || '',
//             verification: seller.verification || 'pending',
//             image: null, // Reset image as user might update it
//         });
//         setShowEdit(true); // Show the edit modal
//     };

//     const handleEditVendor = async () => {
//         if (!selectedSeller) return;

//         const formToSend = new FormData();
//         formToSend.append("name", vendorData.name);
//         formToSend.append("username", vendorData.username);
//         formToSend.append("email", vendorData.email);
//         formToSend.append("websiteURL", vendorData.websiteURL);
//         formToSend.append("address", vendorData.address);
//         formToSend.append("phone", vendorData.phone);
//         formToSend.append("description", vendorData.description);
//         formToSend.append("verification", vendorData.verification);

//         if (vendorData.image) {
//             formToSend.append("img", vendorData.image); // Update image if provided
//         }

//         setShowEdit(false); // Close the modal

//         try {
//             await axios.put(`/vendors/${selectedSeller.id}`, formToSend, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });
//             fetchVendors(); // Refresh vendor list after update
//         } catch (error) {
//             console.error("Error updating vendor:", error);
//         }
//     };


//     const handleVerifyShow = (seller) => {
//         setSelectedSeller(seller);
//         setVerificationStatus(seller.verification); // Set current status in modal
//         setShowVerify(true);
//     };

//     const handleVerifyVendor = async () => {
//         if (!selectedSeller) return;

//         try {
//             await axios.put(`/vendors/${selectedSeller.id}/verify`, {
//                 verification: verificationStatus, // Send updated status
//             });

//             // Update state without re-fetching from backend
//             setSellers((prevSellers) =>
//                 prevSellers.map((seller) =>
//                     seller.id === selectedSeller.id
//                         ? { ...seller, verification: verificationStatus }
//                         : seller
//                 )
//             );

//             setShowVerify(false); // Close modal
//         } catch (error) {
//             console.error("Error verifying vendor:", error);
//         }
//     };
//     const handleDeleteVendor = async (id) => {
//         try {
//             await axios.delete(`/vendors/${id}`);
//             fetchVendors(); // Refresh vendor list after update
//         } catch (err) {
//             console.error("Error deleting vendor:", err);
//         }
//     };
//     return (
//         <div className="container mt-4">
//             <h4 className="text-center">Seller Management</h4>
//             <Button variant="primary" className="mb-3" onClick={handleAddShow}>
//                 Add Vendor
//             </Button>
//             <Table bordered className="text-center">
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>Username</th>
//                         <th>Logo</th>
//                         {/* <th>Name</th> */}
//                         <th>Description</th>
//                         <th>Email</th>
//                         <th>Website URL</th>
//                         <th>Address</th>
//                         <th>Phone</th>
//                         <th>Verification</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {sellers.map((seller) => (
//                         <tr key={seller.id}>
//                             <td>{seller.id}</td>
//                             <td>{seller.username || "N/A"}</td>
//                             {/* <td>{seller.name || "N/A"}</td> */}
//                             <td>
//                                 <img
//                                     src={seller.img}  // Default image if seller doesn't have one
//                                     alt="Seller Logo"
//                                     style={{ width: "100px", height: "100px", objectFit: "cover" }}
//                                 />
//                             </td>
//                             <td>{seller.description || "N/A"}</td>


//                             <td>{seller.email || "N/A"}</td>
//                             <td>
//                                 {seller.websiteURL ? (
//                                     <a href={seller.websiteURL} target="_blank" rel="noopener noreferrer">
//                                         {seller.websiteURL}
//                                     </a>
//                                 ) : (
//                                     "N/A"
//                                 )}
//                             </td>
//                             <td>{seller.address || "N/A"}</td>
//                             <td>{seller.phone || "N/A"}</td>
//                             <td>
//                                 <Badge
//                                     pill
//                                     bg={seller.verification === "verified" ? "success" : "warning"}
//                                 >
//                                     {seller.verification}
//                                 </Badge>
//                             </td>
//                             <td>
//                                 <div className="d-flex justify-content-around">
//                                     <Button
//                                         variant="danger"
//                                         size="sm"
//                                         onClick={() => handleDeleteVendor(seller.id)}
//                                     >
//                                         <FaTrash />
//                                     </Button>
//                                     <Button
//                                         variant="warning"
//                                         size="sm"
//                                         onClick={() => handleEditShow(seller)}
//                                     >
//                                         <FaEdit />
//                                     </Button>
//                                     <Button
//                                         variant="success"
//                                         size="sm"
//                                         onClick={() => handleVerifyShow(seller)}
//                                     >
//                                         <FaCheckCircle />
//                                     </Button>
//                                 </div>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </Table>



//             {/* Add Vendor Modal */}
//             <Modal show={showAdd} onHide={handleAddClose} centered>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Add Vendor</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     <Form>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Username</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="username"
//                                 value={vendorData.username}
//                                 onChange={handleChange}
//                                 placeholder="Enter username"
//                                 required
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Email</Form.Label>
//                             <Form.Control
//                                 type="email"
//                                 name="email"
//                                 value={vendorData.email}
//                                 onChange={handleChange}
//                                 placeholder="Enter email"
//                                 required
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Phone</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="phone"
//                                 value={vendorData.phone}
//                                 onChange={handleChange}
//                                 placeholder="Enter phone number"
//                                 required
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Website URL</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="websiteURL"
//                                 value={vendorData.websiteURL}
//                                 onChange={handleChange}
//                                 placeholder="Enter website URL (optional)"
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Address</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="address"
//                                 value={vendorData.address}
//                                 onChange={handleChange}
//                                 placeholder="Enter vendor address"
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Description</Form.Label>
//                             <Form.Control
//                                 as="textarea"
//                                 name="description"
//                                 value={vendorData.description}
//                                 onChange={handleChange}
//                                 placeholder="Enter vendor description"
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Verification Status</Form.Label>
//                             <Form.Select name="verification" value={vendorData.verification} onChange={handleChange}>
//                                 <option value="pending">Pending</option>
//                                 <option value="verified">Verified</option>
//                             </Form.Select>
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Role</Form.Label>
//                             <Form.Select name="role" value={vendorData.role} onChange={handleChange}>
//                                 <option value="User">User</option>
//                                 <option value="Vendor">Vendor</option>
//                                 <option value="admin">Admin</option>
//                             </Form.Select>
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Upload Image</Form.Label>
//                             <Form.Control
//                                 type="file"
//                                 accept="image/*"
//                                 name="image"
//                                 onChange={handleFileChange}
//                             />
//                         </Form.Group>

//                     </Form>
//                 </Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="primary" onClick={handleAddVendor}>
//                         Add
//                     </Button>
//                 </Modal.Footer>
//             </Modal>

//             {/* Edit Vendor Modal */}
//             {/* Edit Vendor Modal */}
//             <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Edit Vendor</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     <Form>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Name</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="name"
//                                 value={vendorData.name}
//                                 onChange={handleChange}
//                                 placeholder="Enter vendor name"
//                             />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Username</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="username"
//                                 value={vendorData.username}
//                                 onChange={handleChange}
//                                 placeholder="Enter vendor username"
//                             />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Email</Form.Label>
//                             <Form.Control
//                                 type="email"
//                                 name="email"
//                                 value={vendorData.email}
//                                 onChange={handleChange}
//                                 placeholder="Enter vendor email"
//                             />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Website URL</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="websiteURL"
//                                 value={vendorData.websiteURL}
//                                 onChange={handleChange}
//                                 placeholder="Enter website URL"
//                             />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Address</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="address"
//                                 value={vendorData.address}
//                                 onChange={handleChange}
//                                 placeholder="Enter vendor address"
//                             />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Phone</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="phone"
//                                 value={vendorData.phone}
//                                 onChange={handleChange}
//                                 placeholder="Enter phone number"
//                             />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Description</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="description"
//                                 value={vendorData.description}
//                                 onChange={handleChange}
//                                 placeholder="Enter description"
//                             />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Verification</Form.Label>
//                             <Form.Select name="verification" value={vendorData.verification} onChange={handleChange}>
//                                 <option value="pending">Pending</option>
//                                 <option value="verified">Verified</option>
//                             </Form.Select>
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Logo</Form.Label>
//                             <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
//                         </Form.Group>
//                     </Form>
//                 </Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowEdit(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="primary" onClick={handleEditVendor}>
//                         Update
//                     </Button>
//                 </Modal.Footer>
//             </Modal>


//             {/* Verify Vendor Modal */}
//             <Modal show={showVerify} onHide={handleVerifyClose} centered>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Verify Vendor</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     {selectedSeller && (
//                         <>
//                             <p>
//                                 Verify <strong>{selectedSeller.name}</strong>?
//                             </p>
//                             <Form>
//                                 <Form.Check
//                                     type="radio"
//                                     label="Pending"
//                                     name="verification"
//                                     value="pending"
//                                     checked={verificationStatus === "pending"}
//                                     onChange={(e) => setVerificationStatus(e.target.value)}
//                                 />
//                                 <Form.Check
//                                     type="radio"
//                                     label="Verified"
//                                     name="verification"
//                                     value="verified"
//                                     checked={verificationStatus === "verified"}
//                                     onChange={(e) => setVerificationStatus(e.target.value)}
//                                 />
//                             </Form>
//                         </>
//                     )}
//                 </Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={handleVerifyClose}>
//                         Cancel
//                     </Button>
//                     <Button variant="success" onClick={handleVerifyVendor}>
//                         Confirm
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//         </div>
//     );
// };

// export default SellerManagement;
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const BusinessForm = () => {
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        phoneOffice: '',
        description: '',
        address: '',
        websiteURL: '',
        vendorId: '',
        image: null,
    });
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role?.toLowerCase();
    const token = user?.access_token || null;

    const handleClose = () => {
        setShow(false);
        setFormData({
            companyName: '',
            phoneOffice: '',
            description: '',
            address: '',
            websiteURL: '',
            vendorId: '',
            image: null,
        });
        setMessage('');
    };

    const handleShow = () => {
        setShow(true);
        if (role === 'admin') {
            fetchVendors();
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await axios.get("/vendors", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVendors(res.data || []);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        // Automatically get vendor ID when admin selects a vendor name
        if (name === 'vendorId' && role === 'admin') {
            const selectedVendor = vendors.find(v => v.name === value);
            setFormData(prev => ({
                ...prev,
                vendorId: selectedVendor?.id || '',
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'vendorId' && role !== 'admin') return;
            form.append(key, value);
        });

        try {
            const response = await axios.post("/business", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage(response.data.message);
            handleClose();
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="primary" className="m-3" onClick={handleShow}>
                + Add Business
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Business</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message && <Alert variant="info">{message}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Company Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phone (Office)</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneOffice"
                                value={formData.phoneOffice}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Website URL</Form.Label>
                            <Form.Control
                                type="url"
                                name="websiteURL"
                                value={formData.websiteURL}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        {role === 'admin' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Select Vendor</Form.Label>
                                <Form.Select
                                    name="vendorUsername"
                                    onChange={(e) => {
                                        const selectedUsername = e.target.value;
                                        const vendor = vendors.find(v => v.username === selectedUsername);
                                        setFormData(prev => ({
                                            ...prev,
                                            vendorId: vendor?.id || ''
                                        }));
                                    }}
                                    required
                                >
                                    <option value="">-- Select a Vendor --</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.username}>
                                            {v.username}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}


                        <Form.Group className="mb-3">
                            <Form.Label>Business Image</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Submit'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BusinessForm;
