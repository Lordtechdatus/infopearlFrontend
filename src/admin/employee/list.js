import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Button, Row, Col } from 'react-bootstrap';
import InvoiceList from '../invoices/InvoiceList.js';  // Replace with actual Invoice List page import
import SalarySlipList from '../salaryslip/ManageSalary.js';  // Replace with actual Salary Slip List page import
import LetterList from '../letters/LetterList.js';  // Replace with actual Letters List page import

const AdminList = () => {
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
        {/* Invoice List Tab */}
        <Tab eventKey="invoices" title="Invoices">
          <InvoiceList />
        </Tab>

        {/* Salary Slip List Tab */}
        <Tab eventKey="salaryslips" title="Salary Slips">
          <SalarySlipList />
        </Tab>

        {/* Letters List Tab */}
        <Tab eventKey="letters" title="Letters">
          <LetterList />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminList;
