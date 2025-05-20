import React, { useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';

const HitCountsReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);

  const previewReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/reports/admin/product-hit-counts', {
        method: 'GET',
        headers: { Accept: 'application/pdf' },
      });
      if (!response.ok) throw new Error('Failed to fetch PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to load PDF preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="price-analysis-report">
      <h4>Price Analysis Report</h4>
      <Button variant="secondary" onClick={previewReport} disabled={loading || pdfUrl}>
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />{' '}
            Loading...
          </>
        ) : (
          'Preview PDF'
        )}
      </Button>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {pdfUrl && (
        <div
          className="pdf-preview-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <iframe
            src={pdfUrl}
            width="80%"
            height="80%"
            title="Price Analysis PDF Preview"
            style={{ border: '2px solid white', borderRadius: 4 }}
          />
          <Button
            variant="danger"
            className="mt-3"
            onClick={() => {
              window.URL.revokeObjectURL(pdfUrl);
              setPdfUrl(null);
            }}
          >
            Close Preview
          </Button>
        </div>
      )}
    </div>
  );
};

export default HitCountsReport;
