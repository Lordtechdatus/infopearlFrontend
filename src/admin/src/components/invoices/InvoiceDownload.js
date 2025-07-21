import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Modal } from 'react-bootstrap';

const InvoiceDownload = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Load previous downloads from localStorage or use default data
  const [previousDownloads, setPreviousDownloads] = useState(() => {
    const savedDownloads = localStorage.getItem('previousDownloads');
    if (savedDownloads) {
      return JSON.parse(savedDownloads);
    }
    return [
      {
        id: '1',
        filename: 'Invoices-2023-01-01-to-2023-03-31.csv',
        generatedOn: '2023-04-01'
      },
      {
        id: '2',
        filename: 'Invoices-2022-10-01-to-2022-12-31.csv',
        generatedOn: '2023-01-02'
      }
    ];
  });
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [downloadToDelete, setDownloadToDelete] = useState(null);
  
  // Save to localStorage whenever previousDownloads changes
  useEffect(() => {
    localStorage.setItem('previousDownloads', JSON.stringify(previousDownloads));
  }, [previousDownloads]);

  useEffect(() => {
    // Listen for the custom event to trigger download
    const handleTriggerDownload = () => {
      downloadCSV();
    };

    document.addEventListener('trigger-download-csv', handleTriggerDownload);
    return () => {
      document.removeEventListener('trigger-download-csv', handleTriggerDownload);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const downloadCSV = () => {
    // Create CSV content
    let csvContent = "Invoice,Customer,Issue Date,Due Date,Type,Status\n";
    
    // Add sample invoice data
    csvContent += "3,Anne B Ruch,13/11/2021,15/11/2021,invoice,paid\n";
    csvContent += "4,Albert M Dunford,13/11/2021,17/11/2021,invoice,open\n";
    csvContent += "5,Anne B Ruch,13/11/2021,17/11/2021,invoice,open\n";
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'invoices.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setShowSuccess(true);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  // Function to confirm deletion
  const confirmDelete = (download) => {
    setDownloadToDelete(download);
    setShowDeleteConfirm(true);
  };
  
  // Function to delete a download record
  const deleteDownload = () => {
    if (downloadToDelete) {
      // Filter out the download to delete
      const updatedDownloads = previousDownloads.filter(
        download => download.id !== downloadToDelete.id
      );
      
      // Update state
      setPreviousDownloads(updatedDownloads);
      
      // Also clear any related data in localStorage
      try {
        // Clear any related invoice data
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        
        // Reset totals to zero
        localStorage.removeItem(`totals_${downloadToDelete.id}`);
        
        // Show delete success message
        setDeleteSuccess(true);
        setTimeout(() => {
          setDeleteSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Error clearing related data:', error);
      }
      
      // Close modal
      setShowDeleteConfirm(false);
      setDownloadToDelete(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new download record
    const newDownload = {
      id: Date.now().toString(), // Use timestamp as unique ID
      filename: `Invoices-${dateRange.startDate}-to-${dateRange.endDate}.csv`,
      generatedOn: new Date().toISOString().split('T')[0]
    };
    
    // Add to previous downloads
    setPreviousDownloads([newDownload, ...previousDownloads]);
    
    console.log('Generate CSV for date range:', dateRange);
    downloadCSV();
    
    // Reset form
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Download Invoices CSV</h1>
      
      {showSuccess && (
        <Alert variant="success" className="d-flex justify-content-between align-items-center">
          <span>
            <strong>Success:</strong> CSV has been generated and is available in the /downloads folder for future reference, you can download by <Alert.Link href="#" onClick={(e) => { e.preventDefault(); downloadCSV(); }}>clicking here</Alert.Link>.
          </span>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={() => setShowSuccess(false)}
            className="ms-2"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Alert>
      )}
      
      {deleteSuccess && (
        <Alert variant="info" className="d-flex justify-content-between align-items-center">
          <span>
            <strong>Success:</strong> The download record has been deleted and related data has been reset.
          </span>
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={() => setDeleteSuccess(false)}
            className="ms-2"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Header>
          <h4>Export Invoice Data</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button variant="success" type="submit">
                <i className="bi bi-download me-2"></i> Generate & Download CSV
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header>
          <h4>Previous Downloads</h4>
        </Card.Header>
        <Card.Body>
          <ul className="list-group">
            {previousDownloads.map(download => (
              <li key={download.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{download.filename}</strong>
                  <div><small className="text-muted">Generated on: {download.generatedOn}</small></div>
                </div>
                <div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="me-2"
                    onClick={downloadCSV}
                  >
                    <i className="bi bi-download me-1"></i> Download
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => confirmDelete(download)}
                  >
                    <i className="bi bi-trash me-1"></i> Delete
                  </Button>
                </div>
              </li>
            ))}
            {previousDownloads.length === 0 && (
              <li className="list-group-item text-center">
                <em>No previous downloads available</em>
              </li>
            )}
          </ul>
        </Card.Body>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {downloadToDelete && (
            <p>Are you sure you want to delete <strong>{downloadToDelete.filename}</strong>? This will also reset any related totals to zero.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteDownload}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InvoiceDownload; 