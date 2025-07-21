import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container className="text-center">
        <p className="mb-0">Invoice Management System &copy; {year}</p>
      </Container>
    </footer>
  );
};

export default Footer; 