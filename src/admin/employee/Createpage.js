import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Button, Row, Col } from 'react-bootstrap';
import InvoiceCreate from '../invoices/InvoiceCreate.js';
import SalarySlipCreate from '../salaryslip/createSalarySlip.js';  // Replace with actual Salary Slip page import
import LetterCreate from '../letters/LetterCreate.js';  // Replace with actual Letters page import

const AdminPage = () => {
  const [key, setKey] = useState('invoices');  // Default tab is 'invoices'

  useEffect(() => {
    // You can add any data fetching or logic you need to initialize here
  }, []);

  return (
    <Container fluid style={{ marginTop: '30px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '36px', fontWeight: 'bold' }}>
        Admin Panel - Manage Documents
      </h1>

      <Tabs
        id="admin-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        style={{ marginBottom: '30px' }}
      >
        {/* Invoice Tab */}
        <Tab eventKey="invoices" title="Invoices">
          <InvoiceCreate />
        </Tab>

        {/* Salary Slip Tab */}
        <Tab eventKey="salaryslips" title="Salary Slips">
          <SalarySlipCreate />
        </Tab>

        {/* Letter Tab */}
        <Tab eventKey="letters" title="Letters">
          <LetterCreate />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminPage;

