import React, { useState, useEffect } from 'react';
import { Container, Table, Row, Col, Form, Button, InputGroup, Pagination, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CustomerList = () => {
  // Customer state with localStorage integration
  const [customers, setCustomers] = useState([]);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Load customers from localStorage on component mount
  useEffect(() => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    if (savedCustomers.length > 0) {
      setCustomers(savedCustomers);
    } else {
      // If no saved customers, use mock data
      setCustomers([
        { id: 1, name: 'Albert M Dunford', email: 'albd@mail.com', phone: '8520000010' },
        { id: 2, name: 'Allan Deer', email: 'allande@mail.com', phone: '8520001450' },
        { id: 3, name: 'Anne B Ruch', email: 'anner@mail.com', phone: '1478500000' },
        { id: 4, name: 'Celeste Prather', email: 'celeste@mail.com', phone: '8021111111' },
        { id: 5, name: 'Demo User', email: 'demouser@mail.com', phone: '7777777777' },
        { id: 6, name: 'Ira Turner', email: 'iratur@mail.com', phone: '7890002222' },
        { id: 7, name: 'Katharine Mayer', email: 'kathmay@mail.com', phone: '9014555500' },
        { id: 8, name: 'Richards', email: 'richards@mail.com', phone: '7410000014' },
        { id: 9, name: 'Rose Thompson', email: 'thompsonr@mail.com', phone: '7410000020' },
        { id: 10, name: 'Wendy Reilly', email: 'wendy@mail.com', phone: '3214444444' }
      ]);
    }
  }, []);

  // State for entries per page and search term
  const [entriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  
  // Filtered customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );
  
  // Show delete confirmation modal
  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };
  
  // Delete customer
  const deleteCustomer = () => {
    if (customerToDelete) {
      // Remove from state
      const updatedCustomers = customers.filter(customer => customer.id !== customerToDelete.id);
      setCustomers(updatedCustomers);
      
      // Also remove from localStorage
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      
      // Close modal
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Customer List</h1>
      
      <div className="bg-light p-4 mb-4">
        <h3>Customers</h3>
      </div>
      
      <div className="mb-4">
        <Row className="align-items-center mb-3">
          <Col>
            <Form.Group className="d-flex align-items-center">
              <span className="me-2">Show</span>
              <Form.Select 
                className="w-auto me-2"
                defaultValue="10"
                style={{ width: '70px' }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
              <span>entries</span>
            </Form.Group>
          </Col>
          
          <Col className="text-end">
            <InputGroup className="w-auto ms-auto" style={{ maxWidth: '300px' }}>
              <InputGroup.Text>Search:</InputGroup.Text>
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
        
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>
                Name <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Email <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Phone <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Action <i className="bi bi-arrow-down-up"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>
                  <div className="d-flex">
                    <Link to={`/customers/edit/${customer.id}`} className="btn btn-sm btn-primary me-1">
                      <i className="bi bi-pencil-square"></i>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => confirmDelete(customer)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">No matching records found</td>
              </tr>
            )}
          </tbody>
        </Table>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Showing 1 to {Math.min(filteredCustomers.length, entriesPerPage)} of {filteredCustomers.length} entries
          </div>
          
          <Pagination>
            <Pagination.Item className="me-1">
              Previous
            </Pagination.Item>
            
            <Pagination.Item active className="me-1">
              1
            </Pagination.Item>
            
            <Pagination.Item>
              Next
            </Pagination.Item>
          </Pagination>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customerToDelete && (
            <p>
              Are you sure you want to delete customer: {customerToDelete.name}?
              <br />
              <br />
              <strong>This action cannot be undone.</strong>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteCustomer}>
            Delete Customer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CustomerList; 