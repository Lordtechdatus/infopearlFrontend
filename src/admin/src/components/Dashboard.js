import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { currentUser } = useAuth();

  // These would normally come from API calls or a context
  const dashboardStats = {
    salesAmount: 1650,
    totalInvoices: 11,
    pendingBills: 7,
    dueAmount: 2081,
    totalCustomers: 10,
    paidBills: 4
  };

  return (
    <Container>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Welcome, {currentUser?.name || currentUser?.username}!</h4>
              <p>This is your Invoice Management System dashboard. Use the statistics cards below to monitor your business performance.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* First row of statistics cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-white h-100" style={{ backgroundColor: '#00a65a' }}>
            <Card.Body>
              <h1>{dashboardStats.salesAmount}</h1>
              <p className="mb-0">Sales Amount</p>
              <div className="icon">
                <i className="bi bi-currency-dollar" style={{ fontSize: '3rem', opacity: 0.3, position: 'absolute', right: '15px', top: '15px' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="text-white h-100" style={{ backgroundColor: '#605ca8' }}>
            <Card.Body>
              <h1>{dashboardStats.totalInvoices}</h1>
              <p className="mb-0">Total Invoices</p>
              <div className="icon">
                <i className="bi bi-file-text" style={{ fontSize: '3rem', opacity: 0.3, position: 'absolute', right: '15px', top: '15px' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="text-white h-100" style={{ backgroundColor: '#f39c12' }}>
            <Card.Body>
              <h1>{dashboardStats.pendingBills}</h1>
              <p className="mb-0">Pending Bills</p>
              <div className="icon">
                <i className="bi bi-hourglass-split" style={{ fontSize: '3rem', opacity: 0.3, position: 'absolute', right: '15px', top: '15px' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="text-white h-100" style={{ backgroundColor: '#dd4b39' }}>
            <Card.Body>
              <h1>{dashboardStats.dueAmount}</h1>
              <p className="mb-0">Due Amount</p>
              <div className="icon">
                <i className="bi bi-cash-stack" style={{ fontSize: '3rem', opacity: 0.3, position: 'absolute', right: '15px', top: '15px' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Second row of statistics cards */}
      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="text-white h-100" style={{ backgroundColor: '#d81b60' }}>
            <Card.Body>
              <h1>{dashboardStats.totalCustomers}</h1>
              <p className="mb-0">Total Customers</p>
              <div className="icon">
                <i className="bi bi-people" style={{ fontSize: '3rem', opacity: 0.3, position: 'absolute', right: '15px', top: '15px' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-3">
          <Card className="text-white h-100" style={{ backgroundColor: '#00a65a' }}>
            <Card.Body>
              <h1>{dashboardStats.paidBills}</h1>
              <p className="mb-0">Paid Bills</p>
              <div className="icon">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem', opacity: 0.3, position: 'absolute', right: '15px', top: '15px' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Quick links row */}
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Invoices</Card.Title>
              <Card.Text>
                Create, view, and manage your invoices. Track payments and generate reports.
              </Card.Text>
              <div className="d-grid gap-2">
                <Link to="/invoices" className="btn btn-primary mb-2">View All Invoices</Link>
                <Link to="/invoices/create" className="btn btn-outline-primary">Create New Invoice</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Customers</Card.Title>
              <Card.Text>
                Manage your customer database. Add new customers and update existing information.
              </Card.Text>
              <div className="d-grid gap-2">
                <Link to="/customers" className="btn btn-primary mb-2">View All Customers</Link>
                <Link to="/customers/add" className="btn btn-outline-primary">Add New Customer</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 