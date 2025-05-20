import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';

const ReportPreviewModal = ({ 
  show, 
  onHide, 
  reportData, 
  reportTitle, 
  onDownload, 
  onError 
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{reportTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="pdf-container" style={{ height: '70vh', overflow: 'hidden' }}>
          {reportData ? (
            <iframe 
              src={reportData}
              title={reportTitle}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              onError={onError}
            />
          ) : (
            <div className="text-center p-5">
              <Spinner animation="border" />
              <p className="mt-3">Loading report preview...</p>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
        >
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={onDownload}
        >
          <Download className="me-1" /> Download
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportPreviewModal;