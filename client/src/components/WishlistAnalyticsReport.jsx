import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Card, 
  Button, 
  Spinner, 
  Alert, 
  Row, 
  Col, 
  Table 
} from 'react-bootstrap';
import { Eye, Download, PieChart, Tag, BarChart } from 'react-bootstrap-icons';
import ReportPreviewModal from '../components/ReportPreviewModal';

const WishlistAnalyticsReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  
  // Fetch summary data when component mounts
  useEffect(() => {
    fetchSummaryData();
  }, []);
  
  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      // Endpoint to get summarized data (not the full PDF)
      const response = await axios.get('/api/reports/summary/wishlist');
      setSummaryData(response.data);
    } catch (err) {
    //   console.error('Failed to fetch summary data:', err);
    //   setError('Failed to load wishlist analytics summary data');
    } finally {
      setLoading(false);
    }
  };
  
  const generateReport = async (action) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const response = await axios.get('/reports/admin/wishlist', {
        responseType: 'blob'
      });
      
      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      if (action === 'download') {
        // Download logic
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `wishlist-analytics-${new Date().toLocaleDateString()}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);
        
        setSuccessMsg('Wishlist Analytics report downloaded successfully!');
      } else if (action === 'preview') {
        // Preview logic
        setReportData(url);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Report error:', err);
      setError(`Failed to ${action === 'download' ? 'download' : 'preview'} Wishlist Analytics report.`);
    } finally {
      setLoading(false);
    }
  };
  
  const downloadReport = () => generateReport('download');
  const previewReport = () => generateReport('preview');
  
  const closePreview = () => {
    setShowPreview(false);
    // Clean up the URL object to prevent memory leaks
    if (reportData) {
      window.URL.revokeObjectURL(reportData);
    }
    setReportData(null);
  };
  
  const renderSummaryCards = () => {
    if (!summaryData) return null;
    
    const { totalWishlists, topFragrance, topBrand, conversionRate } = summaryData;
    
    return (
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{totalWishlists || '-'}</h2>
              <Card.Text>Total Wishlists</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{topFragrance?.name || '-'}</h2>
              <Card.Text>Most Wishlisted Fragrance</Card.Text>
              <div className="text-muted small">{topFragrance?.count || 0} wishlists</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{topBrand?.name || '-'}</h2>
              <Card.Text>Top Wishlisted Brand</Card.Text>
              <div className="text-muted small">{topBrand?.count || 0} wishlists</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{conversionRate ? `${conversionRate}%` : '-'}</h2>
              <Card.Text>Wishlist to Purchase</Card.Text>
              <div className="text-muted small">Conversion Rate</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  const renderDataTables = () => {
    if (!summaryData) return null;
    
    const { topFragrances, brandWishlists, conversionByBrand, averageDaysToConversion } = summaryData;
    
    return (
      <>
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Top Wishlisted Fragrances</span>
                  <Tag />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fragrance</th>
                      <th>Brand</th>
                      <th>Wishlists</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFragrances?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name || 'Unknown'}</td>
                        <td>{item.brand || 'Unknown'}</td>
                        <td>{item.count || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Brand Popularity</span>
                  <BarChart />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Brand</th>
                      <th>Wishlists</th>
                      <th>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandWishlists?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name || 'Unknown'}</td>
                        <td>{item.count || '0'}</td>
                        <td>{item.percentage ? `${item.percentage.toFixed(1)}%` : '0%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Conversion Rate by Brand</span>
                  <PieChart />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Conversion Rate</th>
                      <th>Purchases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversionByBrand?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.brand || 'Unknown'}</td>
                        <td>{item.rate ? `${item.rate.toFixed(1)}%` : '0%'}</td>
                        <td>{item.purchases || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Time to Purchase Analysis</span>
                  <BarChart />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Time Range</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {averageDaysToConversion?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.range || 'Unknown'}</td>
                        <td>{item.count || '0'}</td>
                        <td>{item.percentage ? `${item.percentage.toFixed(1)}%` : '0%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };
  
  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Wishlist Analytics Report</h2>
        <div>
          <Button
            variant="outline-primary"
            onClick={previewReport}
            disabled={loading}
            className="me-2"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                Loading...
              </>
            ) : (
              <>
                <Eye className="me-1" /> Preview Full Report
              </>
            )}
          </Button>
          <Button
            variant="primary"
            onClick={downloadReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                Generating...
              </>
            ) : (
              <>
                <Download className="me-1" /> Download PDF
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}
      
      {loading && !summaryData ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading wishlist analytics data...</p>
        </div>
      ) : (
        <>
          {renderSummaryCards()}
          {renderDataTables()}
        </>
      )}
      
      {/* Report Preview Modal */}
      <ReportPreviewModal 
        show={showPreview}
        onHide={closePreview}
        reportData={reportData}
        reportTitle="Wishlist Analytics Report"
        onDownload={downloadReport}
        onError={() => setError("Failed to preview the PDF. Please try downloading instead.")}
      />
    </Container>
  );
};

export default WishlistAnalyticsReport;