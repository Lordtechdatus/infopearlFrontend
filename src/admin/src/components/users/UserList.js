import React, { useState } from 'react';
import { Container, Table, Form, Row, Col, Button, InputGroup, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UserList = () => {
  // Mock data for users with exact values from the screenshot
  const [users] = useState([
    { id: 1, name: 'Liam Moore', username: 'admin', email: 'admin@codeastro.com', phone: '7896541250' }
  ]);

  // State for entries per page and search term
  const [entriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  
  // Filtered users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <Container fluid>
      <h1 className="mb-4">User List</h1>
      
      <div className="bg-light p-4 mb-4">
        <h3>Users</h3>
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
                Username <i className="bi bi-arrow-down-up"></i>
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
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <div className="d-flex">
                    <Link to={`/users/edit/${user.id}`} className="btn btn-sm btn-primary me-1">
                      <i className="bi bi-pencil-square"></i>
                    </Link>
                    <Button variant="danger" size="sm">
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Showing 1 to 1 of 1 entries
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
    </Container>
  );
};

export default UserList; 