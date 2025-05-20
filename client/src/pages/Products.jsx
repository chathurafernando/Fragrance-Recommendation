// import React, { useEffect, useState } from 'react';
// import { Form, Container, Row, Col, Button, Alert } from 'react-bootstrap';
// import axios from 'axios';

// const BrandFragranceSelector = () => {
//   const [brands, setBrands] = useState([]);
//   const [selectedBrandId, setSelectedBrandId] = useState('');
//   const [fragrances, setFragrances] = useState([]);
//   const [selectedFragranceId, setSelectedFragranceId] = useState('');
//   const [warranty, setWarranty] = useState('');
//   const [availability, setAvailability] = useState('');
//   const [purchaseLink, setPurchaseLink] = useState('');
//   const [price, setPrice] = useState(''); // ✅ New State for Price
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const fetchBrands = async () => {
//     try {
//       const response = await axios.get('/brands/byFragrance');
//       setBrands(response.data.brands);
//     } catch (error) {
//       console.error('Error fetching brands:', error);
//     }
//   };

//   useEffect(() => {
//     fetchBrands();
//   }, []);

//   const handleBrandChange = (e) => {
//     const brandId = e.target.value;
//     setSelectedBrandId(brandId);
//     setSelectedFragranceId('');
//     const selected = brands.find((b) => b.id.toString() === brandId);
//     setFragrances(selected ? selected.fragrances : []);
//   };

//   const handleFragranceChange = (e) => {
//     setSelectedFragranceId(e.target.value);
//   };

//   const handleWarrantyChange = (e) => {
//     setWarranty(e.target.value);
//   };

//   const handleAvailabilityChange = (e) => {
//     setAvailability(e.target.value);
//   };

//   const handlePurchaseLinkChange = (e) => {
//     setPurchaseLink(e.target.value);
//   };

//   const handlePriceChange = (e) => {
//     setPrice(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     if (!selectedBrandId || !selectedFragranceId || !warranty || !availability || !purchaseLink || !price) {
//       setError('Please fill in all fields.');
//       setMessage('');
//       return;
//     }
  
//     try {
//       // Get user ID from localStorage (as per your method)
//       const user = JSON.parse(localStorage.getItem('user'));
//       const userId = user?.id || null;
//       console.log("User",userId)
  
//       if (!userId) {
//         setError('User is not logged in.');
//         setMessage('');
//         return;
//       }
  
//       const response = await axios.post(`/products/${userId}`, {
//         brandId: selectedBrandId,
//         fragranceId: selectedFragranceId,
//         warranty,
//         availability,
//         purchaseLink,
//         price
//       });
  
//       setMessage(response.data.message);
//       setError('');
  
//       // Clear the form fields after successful submission
//       setSelectedBrandId('');
//       setSelectedFragranceId('');
//       setWarranty('');
//       setAvailability('');
//       setPurchaseLink('');
//       setPrice('');
//     } catch (err) {
//       console.error('Error submitting product:', err);
//       setError('Failed to add product. Please try again.');
//       setMessage('');
//     }
//   };
  
  

//   return (
//     <Container className="my-4">
//       <Form onSubmit={handleSubmit}>
//         {/* Brand */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="brandSelect">
//               <Form.Label>Choose a Brand</Form.Label>
//               <Form.Select value={selectedBrandId} onChange={handleBrandChange}>
//                 <option value="">Select a brand</option>
//                 {brands.map((brand) => (
//                   <option key={brand.id} value={brand.id}>
//                     {brand.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Fragrance */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="fragranceSelect">
//               <Form.Label>Choose a Fragrance</Form.Label>
//               <Form.Select
//                 value={selectedFragranceId}
//                 onChange={handleFragranceChange}
//                 disabled={!selectedBrandId}
//               >
//                 <option value="">Select a fragrance</option>
//                 {fragrances.map((frag) => (
//                   <option key={frag.id} value={frag.id}>
//                     {frag.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Warranty */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="warrantySelect">
//               <Form.Label>Warranty</Form.Label>
//               <Form.Select value={warranty} onChange={handleWarrantyChange}>
//                 <option value="">Select warranty</option>
//                 <option value="3months">3 months</option>
//                 <option value="6months">6 months</option>
//                 <option value="1year">1 year</option>
//                 <option value="2years">2 years</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Availability */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="availabilitySelect">
//               <Form.Label>Availability</Form.Label>
//               <Form.Select value={availability} onChange={handleAvailabilityChange}>
//                 <option value="">Select availability</option>
//                 <option value="In stock">In stock</option>
//                 <option value="Out of stock">Out of stock</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Purchase Link */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="purchaseLink">
//               <Form.Label>Purchase Link</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={purchaseLink}
//                 onChange={handlePurchaseLinkChange}
//                 placeholder="Enter the product's purchase link"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* ✅ Price */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="price">
//               <Form.Label>Price</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={price}
//                 onChange={handlePriceChange}
//                 placeholder="Enter the price"
//                 min="0"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Submit */}
//         <Row>
//           <Col md={6}>
//             <Button
//               variant="primary"
//               type="submit"
//               disabled={!selectedBrandId ||!selectedFragranceId ||!warranty ||!availability ||!purchaseLink ||!price
//               }
//             >
//               Submit
//             </Button>
//           </Col>
//         </Row>
//       </Form>

//       {message && <Alert variant="success" className="mt-3">{message}</Alert>}
//       {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
//     </Container>
//   );
// };

// export default BrandFragranceSelector;
import React, { useEffect, useState } from 'react';
import { Form, Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const BrandFragranceSelector = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [fragrances, setFragrances] = useState([]);
  const [selectedFragranceId, setSelectedFragranceId] = useState('');
  const [warranty, setWarranty] = useState('');
  const [availability, setAvailability] = useState('');
  const [purchaseLink, setPurchaseLink] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isEditMode = Boolean(productId);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/brands/byFragrance');
      setBrands(response.data.brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProductDetails = async (userId, productId) => {
    try {
      const res = await axios.get(`/products/${userId}/${productId}`);
      const product = res.data.vendorProduct || res.data;

      if (!product) {
        setError('Product not found.');
        setLoading(false);
        return;
      }
console.log(product.fragrance);

      setSelectedBrandId(product.fragrance.brandId?.toString() || '');
      setFragrances(
        product.fragrance.brandId
          ? brands.find(b => b.id.toString() === product.fragrance.brandId.toString())?.fragrances || []
          : []
      );
      setSelectedFragranceId(product.fragranceId?.toString() || '');
      setWarranty(product.warranty || '');
      setAvailability(product.availability || '');
      setPurchaseLink(product.purchaseLink || '');
      setPrice(product.price?.toString() || '');

      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!userId) {
      setError('User is not logged in.');
      setLoading(false);
      return;
    }

    if (isEditMode && brands.length > 0) {
      fetchProductDetails(userId, productId);
    } else {
      setLoading(false);
    }
  }, [brands, productId]);

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrandId(brandId);
    setSelectedFragranceId('');
    const selected = brands.find(b => b.id.toString() === brandId);
    setFragrances(selected ? selected.fragrances : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBrandId || !selectedFragranceId || !warranty || !availability || !purchaseLink || !price) {
      setError('Please fill in all fields.');
      setMessage('');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!userId) {
      setError('User is not logged in.');
      setMessage('');
      return;
    }

    const payload = {
      brandId: selectedBrandId,
      fragranceId: selectedFragranceId,
      warranty,
      availability,
      purchaseLink,
      price: parseFloat(price),
    };

    try {
      let response;

      if (isEditMode) {
        response = await axios.put(`/products/${userId}/manipulate/${productId}`, payload);
      } else {
        response = await axios.post(`/products/${userId}`, payload);
      }

      setMessage(response.data.message || `Product ${isEditMode ? 'updated' : 'added'} successfully.`);
      setError('');
    } catch (err) {
      console.error('Error submitting product:', err);
      setError(err.response?.data?.error || 'Failed to submit product.');
      setMessage('');
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" className="mt-4" />;

  return (
    <Container className="my-4">
      <h3>{isEditMode ? 'Edit Product' : 'Add Product'}</h3>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="brandSelect">
              <Form.Label>Choose a Brand</Form.Label>
              <Form.Select value={selectedBrandId} onChange={handleBrandChange}>
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="fragranceSelect">
              <Form.Label>Choose a Fragrance</Form.Label>
              <Form.Select
                value={selectedFragranceId}
                onChange={(e) => setSelectedFragranceId(e.target.value)}
                disabled={!selectedBrandId}
              >
                <option value="">Select a fragrance</option>
                {fragrances.map((frag) => (
                  <option key={frag.id} value={frag.id}>{frag.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="warrantySelect">
              <Form.Label>Warranty</Form.Label>
              <Form.Select value={warranty} onChange={(e) => setWarranty(e.target.value)}>
                <option value="">Select warranty</option>
                <option value="3months">3 months</option>
                <option value="6months">6 months</option>
                <option value="1year">1 year</option>
                <option value="2years">2 years</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="availabilitySelect">
              <Form.Label>Availability</Form.Label>
              <Form.Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="">Select availability</option>
                <option value="In stock">In stock</option>
                <option value="Out of stock">Out of stock</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="purchaseLink">
              <Form.Label>Purchase Link</Form.Label>
              <Form.Control
                type="text"
                value={purchaseLink}
                onChange={(e) => setPurchaseLink(e.target.value)}
                placeholder="Enter purchase link"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="price">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                min="0"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedBrandId || !selectedFragranceId || !warranty || !availability || !purchaseLink || !price}
            >
              {isEditMode ? 'Update Product' : 'Add Product'}
            </Button>
          </Col>
        </Row>
      </Form>

      {message && <Alert variant="success" className="mt-3">{message}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </Container>
  );
};

export default BrandFragranceSelector;

