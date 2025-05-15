import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";  // Import the navigate function

const AdminDashboard = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleNavigation = (path) => {
    // Check if path is not empty and then navigate
    if (path) {
      navigate(path); // Navigate to the specified path
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Admin Dashboard</h2>
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4}>
          {[ // List of pages for admin
            { name: "Seller", path: "/admin/add-business" },
            { name: "Users", path: "/admin/manage-users" },
            { name: "Notes", path: "/admin/manage-notes" },
            { name: "Perfume", path: "/admin/manage-perfume" },
            { name: "Brands", path: "/admin/manage-brands" },
          ].map((item, index) => (
            <Card key={index} className="mb-3 text-center shadow">
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => handleNavigation(item.path)} // Use handleNavigation to navigate
                >
                  Manage {item.name}
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
