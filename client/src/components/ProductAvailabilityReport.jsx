import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import axios from 'axios';

const ProductAvailabilityReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const downloadReport = async () => {
    try {
      setDownloading(true);
      const response = await axios.get('/reports/admin/availability', {
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-availability-${new Date().toLocaleDateString()}.pdf`);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download the report. Please try again later.');
    } finally {
      setDownloading(false);
    }
  };

  const previewReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/reports/admin/availability', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowModal(true);
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to load PDF preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setShowModal(false);
  };

  return (
    <div className="product-availability-report p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Product Availability Report</h4>
        <div>
          <Button variant="primary" onClick={downloadReport} disabled={downloading}>
            {downloading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Generating...
              </>
            ) : (
              <>
                <Download className="me-2" /> Download PDF Report
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={previewReport}
            disabled={loading}
            className="ms-2"
          >
            Preview PDF
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* PDF Preview Modal */}
      <Modal size="xl" show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Product Availability Report Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: '80vh' }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Product Availability PDF Preview"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductAvailabilityReport;
