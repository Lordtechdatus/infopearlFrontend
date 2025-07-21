import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Invoice Management System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isAuthenticated && (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/invoices">Invoices</Nav.Link>
                <Nav.Link as={Link} to="/customers">Customers</Nav.Link>
              </Nav>
              <Nav>
                <Navbar.Text className="me-3">
                  Signed in as: {currentUser?.name || currentUser?.username}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </Nav>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 