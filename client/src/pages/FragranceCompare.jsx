import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const FragranceCompare = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFragrances, setSelectedFragrances] = useState([]);
  const [compareResults, setCompareResults] = useState([]);
  const [error, setError] = useState('');
  const [topBanner, setTopBanner] = useState(null);
  const [sideBanner, setSideBanner] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const topRes = await axios.get('/advertisement/promotion/Comparepage_Top');
      const rightRes = await axios.get('/advertisement/promotion/Comparepage_Side');

      console.log({ topRes, rightRes });


      // For top banner
      if (topRes?.data && topRes.data.length > 0) {
        const randomTopIndex = Math.floor(Math.random() * topRes.data.length);
        setTopBanner(topRes.data[randomTopIndex]);
      }

      // For right banner
      if (rightRes?.data && rightRes.data.length > 0) {
        const randomRightIndex = Math.floor(Math.random() * rightRes.data.length);
        setSideBanner(rightRes.data[randomRightIndex]);
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    }
  };

  const handleSearch = async () => {
    try {
      const excludeIds = selectedFragrances.map(f => f.id).join(',');
      const res = await axios.get(`/fragrances/search?q=${searchQuery}&exclude=${excludeIds}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (fragrance) => {
    if (selectedFragrances.length >= 3) {
      setError('You can only compare up to 3 fragrances.');
      return;
    }
    setError('');
    setSelectedFragrances([...selectedFragrances, fragrance]);
    setSearchResults(searchResults.filter(f => f.id !== fragrance.id));
  };

  const handleRemove = (fragrance) => {
    setSelectedFragrances(selectedFragrances.filter(f => f.id !== fragrance.id));
  };

  const handleCompare = async () => {
    try {
      const ids = selectedFragrances.map(f => f.id).join(',');
      const res = await axios.get(`/fragrances/compare?ids=${ids}`);
      setCompareResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderNotes = (fragrance) => {
    if (!fragrance.fragranceNotes || fragrance.fragranceNotes.length === 0) {
      return <p className="text-muted">No fragrance notes available.</p>;
    }

    const groupedNotes = fragrance.fragranceNotes.reduce((groups, note) => {
      const type = note.FragranceNote?.noteType || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(note);
      return groups;
    }, {});

    return (
      <div className="note-display">
        {Object.entries(groupedNotes).map(([noteType, notes]) => (
          <div key={noteType} className="mb-2">
            <div className="fw-bold text-capitalize">{noteType} Notes</div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
              {notes.map((note, index) => (
                <span key={note.id}>
                  {note.name}
                  {index < notes.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const FragranceCard = ({ fragrance }) => {
    const { id, name, image } = fragrance;
    const navigate = useNavigate();

    return (
      <Card
        key={id}
        className="shadow-sm text-center d-flex flex-column h-100"
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center justify-content-center p-3" style={{ height: '150px', backgroundColor: '#f8f9fa' }}>
          <Card.Img
            variant="top"
            src={image}
            className="h-100"
            style={{ objectFit: 'contain', width: 'auto' }}
          />
        </div>
        <Card.Body className="d-flex flex-column align-items-center">
          <Card.Title className="fs-6 mb-3">{name}</Card.Title>
          <Button
            variant="success"
            onClick={() => handleSelect(fragrance)}
            className="w-auto"
          >
            Add to Compare
          </Button>
        </Card.Body>
      </Card>
    );
  };



  return (
    <Container fluid className="mt-4">
      {/* Top Banner */}
      {topBanner && (
        <Card className="mb-4"  style={{ maxHeight: '350px', overflow: 'hidden', borderRadius: '8px' }}>
          <Card.Img
            src={topBanner.bannerUrl}
            alt="Top Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Card>
      )}

      <h2>Fragrance Comparison Tool</h2>


      {/* Search Input */}
      <Form className="my-3" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <Row>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="Search fragrances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col sm={4}>
            <Button variant="primary" type="submit" className="w-100">Search</Button>
          </Col>
        </Row>
      </Form>

      <Row>
        <Col sm={9}>



          <div className='mb-5 mt-3'>
            {selectedFragrances.length > 0 && (
              <><h4>Selected Fragrances ({selectedFragrances.length}/3)</h4>
                {error && <Alert variant="danger">{error}</Alert>}
                <ListGroup className="mb-3">
                  {selectedFragrances.map(frag => (
                    <ListGroup.Item key={frag.id} className="d-flex justify-content-between align-items-center">
                      {frag.name}
                      <Button variant="outline-danger" size="sm" onClick={() => handleRemove(frag)}>Remove</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button variant="dark" disabled={selectedFragrances.length === 0} onClick={handleCompare}>
                  Compare
                </Button></>
            )}


          </div>


          {/* Search Results */}
          <Row>
            {searchResults.map(frag => (
              <Col key={frag.id} sm={4} className="mb-3">
                <FragranceCard fragrance={frag} />
              </Col>
            ))}
          </Row>

          {compareResults.length > 0 && (
            <>
              <h4 className="mt-4">Comparison Results</h4>

              {/* Desktop Table View (hidden on mobile) */}
              <div className="d-none d-md-block">
                <table className="table table-bordered mt-3">
                  <tbody>
                    {/* Image Row */}
                    <tr>
                      <th style={{ width: '20%' }}></th>
                      {compareResults.map(frag => (
                        <td key={`img-${frag.id}`}>
                          {/* <img
                            src={frag.image}
                            alt={frag.name}
                            style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                          /> */}

                          <div className="d-flex align-items-center justify-content-center p-3" style={{ height: '150px', backgroundColor: '#f8f9fa' }}>
                            <Card.Img
                              variant="top"
                              src={frag.image}
                              alt={frag.name}
                              className="h-100"
                              style={{ objectFit: 'contain', width: 'auto' }}
                            />
                          </div>

                        </td>



                      ))}
                    </tr>

                    {/* Name Row */}
                    <tr>
                      <th>Name</th>
                      {compareResults.map(frag => (
                        <td key={`name-${frag.id}`}>{frag.name}</td>
                      ))}
                    </tr>

                    {/* Description Row */}
                    <tr>
                      <th>Description</th>
                      {compareResults.map(frag => (
                        <td key={`desc-${frag.id}`}>{frag.description}</td>
                      ))}
                    </tr>

                    {/* Price Range Row */}
                    <tr>
                      <th>Price Range</th>
                      {compareResults.map(frag => (
                        <td key={`price-${frag.id}`}>{frag.min_price} - {frag.max_price}</td>
                      ))}
                    </tr>

                    {/* Notes Row */}
                    <tr>
                      <th>Notes</th>
                      {compareResults.map(frag => (
                        <td key={`notes-${frag.id}`}>{renderNotes(frag)}</td>
                      ))}
                    </tr>

                    {/* Action Row */}
                    <tr>
                      <th>Details</th>
                      {compareResults.map(frag => (
                        <td key={`action-${frag.id}`}>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => navigate(`/user/fragranceDetails/${frag.id}`)}
                          >
                            Find out more
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked View (shown only on mobile) */}
              <div className="d-md-none">
                {compareResults.map(frag => (
                  <Card key={`mobile-${frag.id}`} className="mb-4">
                    <div className="d-flex align-items-center justify-content-center p-3" style={{ height: '150px', backgroundColor: '#f8f9fa' }}>
                      <Card.Img
                        variant="top"
                        src={frag.image}
                        alt={frag.name}
                        className="h-100"
                        style={{ objectFit: 'contain', width: 'auto' }}
                      /></div>
                    <Card.Body>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <th>Name</th>
                            <td>{frag.name}</td>
                          </tr>
                          <tr>
                            <th>Description</th>
                            <td>{frag.description}</td>
                          </tr>
                          <tr>
                            <th>Price Range</th>
                            <td>{frag.min_price} - {frag.max_price}</td>
                          </tr>
                          <tr>
                            <th>Notes</th>
                            <td>{renderNotes(frag)}</td>
                          </tr>
                        </tbody>
                      </table>
                      <Button
                        variant="info"
                        onClick={() => navigate(`/user/fragranceDetails/${frag.id}`)}
                        className="w-100"
                      >
                        Find out more
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </>
          )}

        </Col>

        {/* Side Banner */}
        <Col sm={3}>
          {sideBanner && (
            <Card className="mb-4">
              <Card.Img
                src={sideBanner.bannerUrl}
                alt="Side Banner"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FragranceCompare;
