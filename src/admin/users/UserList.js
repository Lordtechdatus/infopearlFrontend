import React, { useState } from 'react';
import { Container, Table, Button, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ShowEntries from '../../components/ShowEntries';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/pagination.css';

const UserList = () => {
  // Mock data for users with exact values from the screenshot
  const [users] = useState([
    { id: 1, name: 'Liam Moore', username: 'admin', email: 'admin@codeastro.com', phone: '7896541250' }
  ]);

  // State for entries per page and search term
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtered users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );
  
  // Calculate indexes for pagination
  const indexOfLastUser = currentPage * entriesPerPage;
  const indexOfFirstUser = indexOfLastUser - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid>
      <h1 className="mb-4">User List</h1>
      
      <div className="bg-light p-4 mb-4">
        <h3>Users</h3>
      </div>
      
      <div className="mb-4">
        {/* Use our new ShowEntries component */}
        <ShowEntries
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalEntries={users.length}
          searchPlaceholder="Search users..."
        />
        
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
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <div className="d-flex">
                    <Link to={`/admin/users/edit/${user.id}`} className="btn btn-sm btn-primary me-1">
                      <i className="bi bi-pencil-square"></i>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => alert('Delete functionality not implemented yet.')}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">No matching records found</td>
              </tr>
            )}
          </tbody>
        </Table>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
            {searchTerm && ` (filtered from ${users.length} total entries)`}
          </div>
          
          <Pagination>
            <Pagination.Item 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="me-1"
            >
              Previous
            </Pagination.Item>
            
            {[...Array(totalPages).keys()].map(number => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => handlePageChange(number + 1)}
                className="me-1"
              >
                {number + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Item
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Pagination.Item>
          </Pagination>
        </div>
      </div>
    </Container>
  );
};

export default UserList; 