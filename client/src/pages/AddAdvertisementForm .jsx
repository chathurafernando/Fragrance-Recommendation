import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
/*global payhere*/
const AddAdvertisementForm = () => {
  const [formData, setFormData] = useState({
    description: '',
    placement: '',
    startDate: '',
    endDate: '',
    bannerFile: null
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [placementsList, setPlacementsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
    const [businessInfo, setBusinessInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPlacements();
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      if (!userId) {
        toast.error('User not logged in!');
        return;
      }

      const response = await axios.get(`/business/${userId}`);
      setBusinessInfo(response.data);
    } catch (err) {
      console.error('Error fetching business info:', err);
      toast.error('Failed to load business information.');
    }
  };
  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/advertisement');
      setPlacementsList(res.data);
    } catch (err) {
      console.error('Error fetching placements:', err);
      toast.error('Failed to load advertisement placements.');
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
    setFormData({ ...formData, bannerFile: file });
    setPreviewImage(file ? URL.createObjectURL(file) : null);
    
    // Clear banner error when file is selected
    if (formErrors.bannerFile) {
      setFormErrors(prev => ({ ...prev, bannerFile: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    const startDateObj = new Date(formData.startDate);
    const endDateObj = new Date(formData.endDate);
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long";
    }
    
    if (!formData.placement) {
      errors.placement = "Please select a placement option";
    }
    
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    } else if (startDateObj < today) {
      errors.startDate = "Start date cannot be in the past";
    }
    
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (endDateObj <= startDateObj) {
      errors.endDate = "End date must be after start date";
    }
    
    if (!formData.bannerFile) {
      errors.bannerFile = "Banner image is required";
    } else {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.bannerFile.size > maxSize) {
        errors.bannerFile = "Image size should not exceed 5MB";
      }
      
      // Check file type
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!acceptedTypes.includes(formData.bannerFile.type)) {
        errors.bannerFile = "Only JPG, PNG, and GIF images are allowed";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setFormLoading(true);

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      if (!userId) {
        toast.error('User not logged in!');
        return;
      }

      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description);
      formDataToSend.append('placement', formData.placement);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('banner', formData.bannerFile);

      // Post the new advertisement
      const res = await axios.post(`/advertisement/${userId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });


      // Successfully created advertisement
      toast.success('Advertisement created successfully!');
      

    //    const adResponse = await axios.get(`/advertisement/${userId}/${res.data.id}`);
    // const ad = adResponse.data;
    // let price = ad.advertisement.price
    // let placement = ad.advertisement.placement
    // console.log("Data ",ad.advertisement.price)
      // Store payment info for the next page
      // localStorage.setItem('ad_payment_info', JSON.stringify({ 
      //   advertisementId: res.data.id, 
      //   price: res.data.price 
      // }));

      // Redirect to payment page after a short delay to let the user see the success message
    
        // navigate('/vendor/payment');

    const paymentDetails = {
      order_id: res.data.id,
      amount: res.data.price,
      currency: "LKR",
      first_name: businessInfo?.companyName|| "Business",
        last_name: businessInfo?.companyName || "Owner",
        email: businessInfo?.email || "business@example.com",
        phone: businessInfo?.phoneOffice || "0770000000",
        address: businessInfo?.address || "No address provided",
        city: businessInfo?.address || "Colombo",
      country: "Sri Lanka",
    };

    try {
      // Request backend to generate the hash value
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/payment/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentDetails),
        }
      );

      if (response.ok) {
        const { hash, merchant_id } = await response.json();

        // Payment configuration
        const payment = {
          // sandbox: true, // Use sandbox for testing
          merchant_id: merchant_id,
          return_url: "payment/success", // Replace with your return URL
          cancel_url: "payment/cancel", // Replace with your cancel URL
          notify_url:
            `${process.env.REACT_APP_BASE_URL}/payment/notify`, // Replace with your notify URL - This should be public IP (No Localhost)
          order_id: paymentDetails.order_id,
          items: res.data.placement,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          first_name: paymentDetails.first_name,
          last_name: paymentDetails.last_name,
          email: paymentDetails.email,
          phone: paymentDetails.phone,
          address: paymentDetails.address,
          city: paymentDetails.city,
          country: paymentDetails.country,
          hash: hash,
        };

        // Initialize PayHere payment
        payhere.startPayment(payment);
      }

      } catch (err) {
      console.error("Payment error:", err);
      // setError(err.message);
    }






        


    

    } catch (err) {
      console.error('Error creating advertisement:', err);
      toast.error(err.response?.data?.error || 'Failed to add advertisement');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading advertisement options...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
      <h2>Add Advertisement</h2>
      
      <Form onSubmit={handleSubmit} className="mt-4">
        {/* Description */}
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows="3"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter advertisement description"
            isInvalid={!!formErrors.description}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.description}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Placement */}
        <Form.Group className="mb-3">
          <Form.Label>Placement</Form.Label>
          <Form.Select
            name="placement"
            value={formData.placement}
            onChange={handleChange}
            isInvalid={!!formErrors.placement}
          >
            <option value="">Select placement</option>
            {placementsList.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} - ${p.price}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {formErrors.placement}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Start Date */}
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            isInvalid={!!formErrors.startDate}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.startDate}
          </Form.Control.Feedback>
        </Form.Group>

        {/* End Date */}
        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            isInvalid={!!formErrors.endDate}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.endDate}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Banner Upload */}
        <Form.Group className="mb-3">
          <Form.Label>Banner Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            isInvalid={!!formErrors.bannerFile}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.bannerFile}
          </Form.Control.Feedback>
          
          {previewImage && (
            <div className="mt-2 text-center">
              <img 
                src={previewImage} 
                alt="Banner Preview" 
                style={{
                  maxWidth: "300px",
                  maxHeight: "150px",
                  objectFit: "contain",
                  marginTop: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "5px"
                }}
              />
            </div>
          )}
          <Form.Text className="text-muted">
            Recommended image size: 800×400 pixels. Maximum file size: 5MB.
          </Form.Text>
        </Form.Group>

        {/* Submit Button */}
        <Button 
          variant="primary" 
          type="submit" 
          className="mt-3"
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
              Creating Advertisement...
            </>
          ) : (
            'Create Advertisement'
          )}
        </Button>
      </Form>
    </div>
  );
};

export default AddAdvertisementForm;