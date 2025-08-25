import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ShowEntries from '../../components/ShowEntries';
import jsPDF from 'jspdf';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './LetterList.css';
import '../../styles/pagination.css';

const LettersList = () => {
  // State for letter records
  const [letters, setLetters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load letters from localStorage on component mount
  useEffect(() => {
    const storedLetters = JSON.parse(localStorage.getItem('letters') || '[]');
    setLetters(storedLetters);
  }, []);

  // Handle sort column click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Filter and sort records
  const filteredLetters = letters
    .filter(letter => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        letter.letterType.toLowerCase().includes(searchTermLower) ||
        letter.issueDate.toLowerCase().includes(searchTermLower) ||
        letter.receiver.toLowerCase().includes(searchTermLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortField === 'letterType') {
        comparison = a.letterType.localeCompare(b.letterType);
      } else if (sortField === 'receiver') {
        comparison = a.receiver.localeCompare(b.receiver);
      } else if (sortField === 'date') {
        comparison = new Date(a.issueDate) - new Date(b.issueDate);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = filteredLetters.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredLetters.length / entriesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Delete a letter record
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this letter record?')) {
      const updatedRecords = letters.filter(letter => letter.id !== id);
      setLetters(updatedRecords);
      localStorage.setItem('letters', JSON.stringify(updatedRecords));
    }
  };

  // View/Print a letter
  const handleViewLetter = (id) => {
    // Navigate to view page or open print dialog
    window.location.href = `/letters/view/${id}`;
  };

  // Calculate total letters
  const calculateTotalLetters = () => {
    return letters.length;
  };

  // Generate PDF for the letter
  const handleDownloadPDF = (id) => {
    const letter = letters.find(letter => letter.id === id);
    if (!letter) return;

    const doc = new jsPDF();
    
    doc.setFontSize(12);
    doc.text(`Letter Type: ${letter.letterType}`, 10, 10);
    doc.text(`Receiver: ${letter.receiver}`, 10, 20);
    doc.text(`Issue Date: ${letter.issueDate}`, 10, 30);
    doc.text(`Content: ${letter.content}`, 10, 40);

    doc.save(`letter_${id}.pdf`);
  };

  // Send the letter via email
  const handleSendEmail = (id) => {
    const letter = letters.find(letter => letter.id === id);
    if (!letter) return;

    const emailContent = `
      Letter Type: ${letter.letterType}
      Receiver: ${letter.receiver}
      Issue Date: ${letter.issueDate}
      Content: ${letter.content}
    `;

    // Simulate sending email via alert (or integrate with an email API)
    alert(`Email Sent to: ${letter.receiver}\nContent:\n${emailContent}`);
  };

  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">Manage Letters</h1>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', borderColor: '#051937' }}>
            <div className="text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <i className="bi bi-file-earmark-text fs-4"></i>
              </div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Total Letters</Card.Title> 
              </div>
              <h2 className="mb-0">{calculateTotalLetters()}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #FBBC05, #EA4335)', borderColor: '#051937' }}>
          <div className="text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <i className="bi bi-calendar-check fs-4"></i>
                </div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Current Month</Card.Title>
              </div>
              {(() => {
                const today = new Date();
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const currentMonth = monthNames[today.getMonth()];

                return <h3 className="mb-0" style={{ color: 'white', fontWeight: 'bold' }}>{currentMonth}</h3>;
              })()}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #34A853, #1E8E3E)', borderColor: '#051937' }}>
          <div className="text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <i className="bi bi-people fs-4"></i>
                </div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Total Employees</Card.Title>
              </div>
              <h2 className="mb-0">{new Set(letters.map(letter => letter.receiver)).size}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main content - Letters Records */}
      <div className="bg-white rounded shadow-sm mb-4">
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Letter Records</h3>
            <Link to="/admin/employee/createpage" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              Create New Letter
            </Link>
          </div>

          {/* Use our new ShowEntries component */}
          <ShowEntries
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            totalEntries={letters.length}
            searchPlaceholder="Search letter type, receiver, date..."
          />

          <Table hover responsive className="mt-3">
            <thead>
              <tr>
                <th onClick={() => handleSort('letterType')} style={{ cursor: 'pointer' }}>
                  Letter Type {getSortIndicator('letterType')}
                </th>
                <th onClick={() => handleSort('receiver')} style={{ cursor: 'pointer' }}>
                  Receiver {getSortIndicator('receiver')}
                </th>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                  Date {getSortIndicator('date')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map(letter => (
                  <tr key={letter.id}>
                    <td>{letter.letterType}</td>
                    <td>{letter.receiver}</td>
                    <td>{letter.issueDate}</td>
                    <td>
                      <div className="d-flex">
                        <Button variant="info" size="sm" className="me-1" onClick={() => handleViewLetter(letter.id)}>
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button variant="success" size="sm" className="me-1" onClick={() => handleDownloadPDF(letter.id)}>
                          <i className="bi bi-download"></i>
                        </Button>
                        <Button variant="primary" size="sm" className="me-1" onClick={() => handleSendEmail(letter.id)}>
                          <i className="bi bi-envelope"></i>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(letter.id)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    {searchTerm ? (
                      <div>
                        <i className="bi bi-search text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="mb-0">No matching records found</p>
                        <small className="text-muted">Try adjusting your search terms</small>
                      </div>
                    ) : (
                      <div>
                        <i className="bi bi-file-earmark-text text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="mb-0">No letter records found</p>
                        <small className="text-muted">Click "Create New Letter" to add one</small>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              {filteredLetters.length > 0 ? (
                <span>
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredLetters.length)} of {filteredLetters.length} entries
                  {searchTerm && ` (filtered from ${letters.length} total entries)`}
                </span>
              ) : (
                <span>No entries to show</span>
              )}
            </div>

            {totalPages > 0 && (
              <div>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                  </li>

                  {[...Array(totalPages).keys()].map(number => (
                    <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                      <Button
                        variant="link"
                        className="page-link"
                        onClick={() => handlePageChange(number + 1)}
                      >
                        {number + 1}
                      </Button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default LettersList;
