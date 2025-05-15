// AddBusinessForm.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Container ,Alert,Spinner} from "react-bootstrap";
import axios from "axios";

const AddBusinessForm = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    companyName: "",
    phoneOffice: "",
    description: "",
    address: "",
    websiteURL: "",
    image: null,
    vendorId: ""
  });
  const [loading, setLoading] = useState(false);
const [feedback, setFeedback] = useState({ type: "", message: "" });


  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token || null;
  const role = user?.role?.toLowerCase();

  useEffect(() => {
    const fetchVendors = async () => {
      if (role === "admin") {
        try {
          const res = await axios.get("/vendors", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setVendors(res.data);
        } catch (err) {
          console.error("Failed to fetch vendors", err);
        }
      }
    };

    fetchVendors();
  }, [role, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });
  
    const businessData = new FormData();
    businessData.append("companyName", formData.companyName);
    businessData.append("phoneOffice", formData.phoneOffice);
    businessData.append("description", formData.description);
    businessData.append("address", formData.address);
    businessData.append("websiteURL", formData.websiteURL);
    businessData.append("image", formData.image);
    if (role === "admin") businessData.append("vendorId", formData.vendorId);
  
    try {
      const res = await axios.post("/business", businessData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
  
      setFeedback({ type: "success", message: res.data.message || "Business added successfully!" });
      setFormData({
        companyName: "",
        phoneOffice: "",
        description: "",
        address: "",
        websiteURL: "",
        image: null,
        vendorId: "",
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Error adding business.";
  
      setFeedback({
        type: "danger",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h3>Add New Business</h3>
      <Form onSubmit={handleSubmit}>
      {feedback.message && (
        <Alert className="mt-3" variant={feedback.type}>
          {feedback.message}
        </Alert>
      )}
        <Form.Group className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Phone (Office)</Form.Label>
          <Form.Control
            type="text"
            value={formData.phoneOffice}
            onChange={(e) => setFormData({ ...formData, phoneOffice: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Website URL</Form.Label>
          <Form.Control
            type="text"
            value={formData.websiteURL}
            onChange={(e) => setFormData({ ...formData, websiteURL: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Business Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            required
          />
        </Form.Group>

        {role === "admin" && (
          <Form.Group className="mb-3">
            <Form.Label>Select Vendor</Form.Label>
            <Form.Select
              onChange={(e) => {
                const selectedUsername = e.target.value;
                const vendor = vendors.find(v => v.username === selectedUsername);
                setFormData(prev => ({ ...prev, vendorId: vendor?.id || "" }));
              }}
              required
            >
              <option value="">-- Select a Vendor --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.username}>
                  {v.username}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}

<Button type="submit" variant="success" disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
      </Button>

      
      </Form>
    </Container>
  );
};

export default AddBusinessForm;
