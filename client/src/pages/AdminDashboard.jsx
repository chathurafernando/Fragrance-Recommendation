import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const adminPages = [
    { name: "Seller", path: "/admin/add-business" },
    { name: "Users", path: "/admin/manage-users" },
    { name: "Notes", path: "/admin/manage-notes" },
    { name: "Perfume", path: "/admin/manage-perfume" },
    { name: "Brands", path: "/admin/manage-brands" },
    { name: "Reports", path: "/admin/overview" },
  ];

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Admin Dashboard</h2>
      <Row>
        {adminPages.map((item, index) => (
          <Col key={index} xs={12} md={6} lg={4} className="mb-4">
            <Card className="h-100 text-center shadow">
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => handleNavigation(item.path)}
                >
                  Manage {item.name}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminDashboard;