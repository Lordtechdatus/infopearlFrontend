import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import './ShowEntries.css';

/**
 * A reusable component for showing entries selector and search box
 * To be used in all list views (users, customers, invoices, salary)
 */
const ShowEntries = ({
  entriesPerPage,
  setEntriesPerPage,
  searchTerm,
  setSearchTerm,
  totalEntries,
  searchPlaceholder = "Search..."
}) => {
  return (
    <Row className="entries-control align-items-center mb-3">
      <Col md={6} className="entries-per-page">
        <Form.Group className="d-flex align-items-center">
          <div className="entries-label">Show</div>
          <Form.Select 
            className="entries-select"
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Form.Select>
          <div className="entries-text">entries</div>
          <div className="entries-total">
            <span className="total-badge">{totalEntries}</span> total records
          </div>
        </Form.Group>
      </Col>
      
      <Col md={6} className="search-container">
        <InputGroup className="search-input">
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <InputGroup.Text 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <i className="bi bi-x-circle-fill"></i>
            </InputGroup.Text>
          )}
        </InputGroup>
      </Col>
    </Row>
  );
};

export default ShowEntries; 