import React, { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';
import axios from 'axios';
import { Tabs, Tab, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import OffersGrid from '../components/OffersGrid';
import { BsCheckCircleFill, BsGlobe, BsGeoAlt, BsInfoCircle } from 'react-icons/bs';

const VendorDashboard = () => {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || null;

    if (!userId) {
      setError('User is not logged in.');
      setLoading(false);
      return;
    }

    setVendorInfo(user);
    fetchCompanyInfo(userId);
  }, []);

  const fetchCompanyInfo = async (userId) => {
    try {
      const res = await axios.get(`/business/${userId}`);
      setCompanyInfo(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching company info:', err);
      setError(err.response?.data?.error || 'Failed to fetch company details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading company information...</p>
        </div>
      )}

      {/* Company Info */}
      {companyInfo && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row align-items-start gap-4">
              {/* Logo Box */}
              <div className="text-center">
                <div
                  className="rounded-circle overflow-hidden bg-light"
                  style={{
                    width: '120px',
                    height: '120px',
                    border: '2px solid #dee2e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={companyInfo.image || '/default-logo.png'}
                    alt="Company Logo"
                    className="img-fluid"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                {companyInfo.verification === 'verified' && (
                  <Badge pill bg="primary" className="mt-2">
                    <BsCheckCircleFill className="me-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <h3 className="mb-3 fw-bold text-primary">{companyInfo.companyName}</h3>
                </div>
                
                {companyInfo.description && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center text-muted mb-1">
                      <BsInfoCircle className="me-2" />
                      <small>About Us</small>
                    </div>
                    <p className="mb-0" style={{ maxWidth: '600px' }}>{companyInfo.description}</p>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-4 mt-3">
                  {companyInfo.address && (
                    <div>
                      <div className="d-flex align-items-center text-muted mb-1">
                        <BsGeoAlt className="me-2" />
                        <small>Address</small>
                      </div>
                      <p className="mb-0">{companyInfo.address}</p>
                    </div>
                  )}

                  {companyInfo.websiteURL && (
                    <div>
                      <div className="d-flex align-items-center text-muted mb-1">
                        <BsGlobe className="me-2" />
                        <small>Website</small>
                      </div>
                      <a 
                        href={companyInfo.websiteURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {companyInfo.websiteURL.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Tabs */}
      <Tabs 
        defaultActiveKey="products" 
        id="vendor-dashboard-tabs" 
        className="mb-3"
        fill
      >
        <Tab eventKey="products" title={<span className="fw-semibold">Products</span>}>
          <ProductGrid />
        </Tab>
        <Tab eventKey="offers" title={<span className="fw-semibold">Advertisement Offers</span>}>
          <OffersGrid />
        </Tab>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;