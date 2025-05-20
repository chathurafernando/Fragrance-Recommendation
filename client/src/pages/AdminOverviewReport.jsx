

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Nav, Tab } from 'react-bootstrap';
import { Eye, Download, BarChart, PieChart, Table, Person, Building, Tag, GraphUp } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReportPreviewModal from '../components/ReportPreviewModal';
import UserDemographicsReport from '../components/UserDemographicsReport';
import WishlistAnalyticsReport from '../components/WishlistAnalyticsReport';
import ProductAvailabilityReport from '../components/ProductAvailabilityReport';
import MarketingPerformanceReport from '../components/MarketingPerformanceReport'
import PriceAnalysisReport from '../components/PriceAnalysisReport';
import VendorVerificationReport from '../components/VendorVerificationReport ';

const reports = [
  {
    id: 'overview',
    title: 'Admin Overview',
    route: 'overview',
    filename: 'admin-overview',
    description: 'Overview of fragrances per brand, vendor verification status, and top wishlisted products',
    icon: <GraphUp className="me-2" size={18} />
  },
  {
    id: 'users',
    title: 'User Demographics',
    route: 'users',
    filename: 'user-demographics',
    description: 'Breakdown of user data by age, location and shopping preferences',
    icon: <Person className="me-2" size={18} />
  },
  {
    id: 'wishlist',
    title: 'Wishlist Analytics',
    route: 'wishlist',
    filename: 'wishlist-analytics',
    description: 'Detailed analysis of most wished-for products and wishlist conversion rates',
    icon: <Tag className="me-2" size={18} />
  },
  {
    id: 'availability',
    title: 'Product Availability',
    route: 'availability',
    filename: 'product-availability',
    description: 'Current inventory levels and product availability across vendors',
    icon: <Table className="me-2" size={18} />
  },
  {
    id: 'marketing',
    title: 'Marketing Performance',
    route: 'marketing',
    filename: 'marketing-performance',
    description: 'ROI analysis of marketing campaigns and channel performance',
    icon: <BarChart className="me-2" size={18} />
  },
  {
    id: 'pricing',
    title: 'Price Analysis',
    route: 'pricing',
    filename: 'price-analysis',
    description: 'Comparative analysis of product pricing across vendors and regions',
    icon: <PieChart className="me-2" size={18} />
  },
  {
    id: 'verification',
    title: 'Vendor Verification',
    route: 'verification',
    filename: 'vendor-verification',
    description: 'Status of vendor verification processes and pending approvals',
    icon: <Building className="me-2" size={18} />
  },
  {
    id: 'product-hit-counts',
    title: 'Product Hit Counts',
    route: 'product-hit-counts',
    filename: 'product-hit-counts',
    description: 'Status of vendor Product Hit Counts of Fragrances',
    icon: <Building className="me-2" size={18} />
  }
];

const AdminReports = () => {
  const [loadingReport, setLoadingReport] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchReport = async (route, filename, action) => {
    setLoadingReport(route);
    setError('');
    setSuccessMsg('');

    // Store both route and action in selectedReport
    setSelectedReport({ route, filename, action });

    try {
      const response = await axios.get(`/reports/admin/${route}`, {
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      if (action === 'download') {
        // Download logic
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}-${new Date().toLocaleDateString()}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);

        setSuccessMsg(`"${filename}" report downloaded successfully!`);
      } else if (action === 'preview') {
        // Preview logic - just set the URL for the iframe
        setReportData(url);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Report error:', err);
      setError(`Failed to ${action === 'download' ? 'download' : 'preview'} "${filename}" report.`);
    } finally {
      setLoadingReport('');
    }
  };

  const downloadReport = (route, filename) => {
    fetchReport(route, filename, 'download');
  };

  const previewReport = (route, filename) => {
    fetchReport(route, filename, 'preview');
  };

  const closePreview = () => {
    setShowPreview(false);
    // Clean up the URL object to prevent memory leaks
    if (reportData) {
      window.URL.revokeObjectURL(reportData);
    }
    setReportData(null);
  };

  // Get current report title
  const currentReportTitle = selectedReport
    ? reports.find(r => r.route === selectedReport.route)?.title || 'Report Preview'
    : 'Report Preview';

  return (
    <Container className="my-5">
      <h2 className="mb-4">Administrative Reports</h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}

      <Row xs={1} md={2} lg={3} className="g-4">
        {reports.map((report) => (
          <Col key={report.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>
                  {report.icon} {report.title}
                </Card.Title>
                <Card.Text className="text-muted mb-3" style={{ fontSize: '0.9rem', height: '60px' }}>
                  {report.description}
                </Card.Text>
                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-primary"
                    onClick={() => previewReport(report.route, report.filename)}
                    disabled={loadingReport === report.route}
                    className="me-2"
                  >
                    {loadingReport === report.route && selectedReport?.route === report.route && selectedReport?.action === 'preview' ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="me-1" /> Preview
                      </>
                    )}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => downloadReport(report.route, report.filename)}
                    disabled={loadingReport === report.route}
                  >
                    {loadingReport === report.route && selectedReport?.route === report.route && selectedReport?.action === 'download' ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="me-1" /> Download
                      </>
                    )}
                  </Button>
                </div>
                {(report.id === 'users' || report.id === 'wishlist' || report.id === 'availability') && (
                  <div className="mt-2">
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <ReportPreviewModal
        show={showPreview}
        onHide={closePreview}
        reportData={reportData}
        reportTitle={currentReportTitle}
        onDownload={() => selectedReport && downloadReport(selectedReport.route, selectedReport.filename)}
        onError={() => setError("Failed to preview the PDF. Please try downloading instead.")}
      />
    </Container>
  );
};

export default AdminReports;