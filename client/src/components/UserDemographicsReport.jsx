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
import { Eye, Download, PieChart } from 'react-bootstrap-icons';
import ReportPreviewModal from '../components/ReportPreviewModal';

const UserDemographicsReport = () => {
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
      const response = await axios.get('/api/reports/summary/users');
      setSummaryData(response.data);
    } catch (err) {
    //   console.error('Failed to fetch summary data:', err);
    //   setError('Failed to load demographics summary data');
    } finally {
      setLoading(false);
    }
  };
  
  const generateReport = async (action) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const response = await axios.get('/reports/admin/users', {
        responseType: 'blob'
      });
      
      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      if (action === 'download') {
        // Download logic
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `user-demographics-${new Date().toLocaleDateString()}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);
        
        setSuccessMsg('User Demographics report downloaded successfully!');
      } else if (action === 'preview') {
        // Preview logic
        setReportData(url);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Report error:', err);
      setError(`Failed to ${action === 'download' ? 'download' : 'preview'} User Demographics report.`);
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
    
    const { totalUsers, mostCommonAge, mostPopularOccasion, mostPopularSmell } = summaryData;
    
    return (
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{totalUsers || '-'}</h2>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{mostCommonAge?.age_range || '-'}</h2>
              <Card.Text>Most Common Age Range</Card.Text>
              <div className="text-muted small">{mostCommonAge?.count || 0} users</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{mostPopularOccasion?.occasion || '-'}</h2>
              <Card.Text>Top Occasion</Card.Text>
              <div className="text-muted small">{mostPopularOccasion?.count || 0} users</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{mostPopularSmell?.smell || '-'}</h2>
              <Card.Text>Top Fragrance Type</Card.Text>
              <div className="text-muted small">{mostPopularSmell?.count || 0} users</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  const renderDataTables = () => {
    if (!summaryData) return null;
    
    const { ageRanges, occasionPrefs, smellPrefs, intensityPrefs, totalUsers } = summaryData;
    
    return (
      <>
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Age Distribution</span>
                  <PieChart />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Age Range</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ageRanges?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.age_range || 'Unknown'}</td>
                        <td>{item.count || '0'}</td>
                        <td>{((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%</td>
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
                  <span>Occasion Preferences</span>
                  <PieChart />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Occasion</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occasionPrefs?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.occasion || 'Unknown'}</td>
                        <td>{item.count || '0'}</td>
                        <td>{((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%</td>
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
                  <span>Fragrance Type Preferences</span>
                  <PieChart />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Fragrance Type</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smellPrefs?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.smell || 'Unknown'}</td>
                        <td>{item.count || '0'}</td>
                        <td>{((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%</td>
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
                  <span>Intensity Preferences</span>
                  <PieChart />
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Intensity</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intensityPrefs?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.intensity || 'Unknown'}</td>
                        <td>{item.count || '0'}</td>
                        <td>{((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%</td>
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
        <h2>User Demographics Report</h2>
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
          <p className="mt-3">Loading demographic data...</p>
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
        reportTitle="User Demographics Report"
        onDownload={downloadReport}
        onError={() => setError("Failed to preview the PDF. Please try downloading instead.")}
      />
    </Container>
  );
};

export default UserDemographicsReport;