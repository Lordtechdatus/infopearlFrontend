import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const GallerySettings = () => {
  // State for gallery images
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  // Ref for file input
  const fileInputRef = useRef(null);

  // Load images from localStorage on component mount
  useEffect(() => {
    const loadImages = () => {
      try {
        const savedImages = localStorage.getItem('galleryImages');
        if (savedImages) {
          const parsedImages = JSON.parse(savedImages);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            // Ensure we have all 18 images
            if (parsedImages.length < 18) {
              // Generate additional placeholder images to reach 18
              const additionalImages = Array.from(
                { length: 18 - parsedImages.length }, 
                (_, index) => ({
                  id: parsedImages.length + index + 1,
                  title: `Image ${parsedImages.length + index + 1}`,
                  description: `Description for image ${parsedImages.length + index + 1}`,
                  src: `https://picsum.photos/id/${parsedImages.length + index + 100}/300/200`,
                  alt: `Gallery image ${parsedImages.length + index + 1}`,
                  createdAt: new Date().toISOString()
                })
              );
              
              const updatedImages = [...parsedImages, ...additionalImages];
              setImages(updatedImages);
              // Save the updated array with 18 images
              localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
            } else {
              setImages(parsedImages);
            }
          } else {
            createPlaceholderImages();
          }
        } else {
          createPlaceholderImages();
        }
      } catch (error) {
        console.error('Error loading gallery images:', error);
        createPlaceholderImages();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Function to create and save placeholder images
    const createPlaceholderImages = () => {
      // Generate placeholder data for the 18 initial images
      const placeholderImages = Array.from({ length: 18 }, (_, index) => ({
        id: index + 1,
        title: `Image ${index + 1}`,
        description: `Description for image ${index + 1}`,
        src: `https://picsum.photos/id/${index + 100}/300/200`, // Placeholder image URLs
        alt: `Gallery image ${index + 1}`,
        createdAt: new Date().toISOString()
      }));
      setImages(placeholderImages);
      // Save to localStorage
      localStorage.setItem('galleryImages', JSON.stringify(placeholderImages));
    };
    
    // Simulate network delay for loading
    setTimeout(() => {
      loadImages();
    }, 500);
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File validation
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage({
          id: Date.now(),
          title: file.name.split('.')[0] || '', // Pre-fill title with filename
          description: '',
          src: reader.result,
          alt: file.name,
          createdAt: new Date().toISOString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image edit
  const handleEditImage = (image) => {
    setSelectedImage(image);
  };

  // Handle image metadata change
  const handleImageChange = (e) => {
    const { name, value } = e.target;
    setSelectedImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle preview image metadata change
  const handlePreviewChange = (e) => {
    const { name, value } = e.target;
    setPreviewImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited image
  const handleSaveEdit = () => {
    const updatedImages = images.map(img => 
      img.id === selectedImage.id ? selectedImage : img
    );
    setImages(updatedImages);
    localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
    
    setSelectedImage(null);
    showSuccess('Image updated successfully!');
  };

  // Save new image
  const handleSaveNewImage = () => {
    if (!previewImage.title) {
      alert('Please provide a title for the image');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Add new image to the array
      // Note: We're storing the image as data URL in localStorage
      const newImage = {
        ...previewImage,
        // Remove the file object as it can't be serialized to localStorage
        file: undefined
      };
      
      const newImages = [...images, newImage];
      setImages(newImages);
      
      // Save to localStorage
      localStorage.setItem('galleryImages', JSON.stringify(newImages));
      
      // Reset states
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      showSuccess('Image added successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Error saving image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel edit/upload
  const handleCancel = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm delete image
  const confirmDeleteImage = (image) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  // Delete image
  const handleDeleteImage = () => {
    const filteredImages = images.filter(img => img.id !== imageToDelete.id);
    setImages(filteredImages);
    localStorage.setItem('galleryImages', JSON.stringify(filteredImages));
    
    setShowDeleteModal(false);
    setImageToDelete(null);
    showSuccess('Image deleted successfully!');
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading gallery...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Gallery Management</h2>
          <p className="text-muted mb-0">Manage the images displayed in your website gallery</p>
        </div>
        <div>
          <Form.Group>
            <Form.Control
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="d-none"
              id="image-upload"
            />
            <Button 
              variant="primary" 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  alert("File input reference not available");
                }
              }}
              disabled={!!previewImage || !!selectedImage}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add New Image
            </Button>
          </Form.Group>
        </div>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
        </div>
      )}
      
      {/* Alternative file upload if hidden input doesn't work */}
      {!previewImage && !selectedImage && (
        <Card className="mb-4">
          <Card.Body>
            <Form.Group>
              <Form.Label>
                <strong>Upload an Image</strong> - Select an image file from your device
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-3"
              />
              <div className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                Supported formats: JPG, PNG, GIF, WebP. Maximum size: 5MB
              </div>
            </Form.Group>
          </Card.Body>
        </Card>
      )}
      
      {/* Preview New Image */}
      {previewImage && (
        <Card className="mb-4 border-primary">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Add New Image</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="image-preview-container mb-3">
                  <img 
                    src={previewImage.src} 
                    alt="Preview" 
                    className="img-fluid mb-2 rounded border" 
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              </Col>
              <Col md={8}>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={previewImage.title}
                      onChange={handlePreviewChange}
                      placeholder="Enter image title"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Alt Text</Form.Label>
                    <Form.Control
                      type="text"
                      name="alt"
                      value={previewImage.alt}
                      onChange={handlePreviewChange}
                      placeholder="Alternative text for accessibility"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={previewImage.description}
                      onChange={handlePreviewChange}
                      placeholder="Enter image description"
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleCancel}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleSaveNewImage}
                      disabled={isUploading || !previewImage.title}
                    >
                      {isUploading ? (
                        <>
                          <Spinner 
                            as="span"
                            animation="border" 
                            size="sm" 
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Save Image
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Edit Selected Image */}
      {selectedImage && (
        <Card className="mb-4 border-primary">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Edit Image</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="image-preview-container mb-3">
                  <img 
                    src={selectedImage.src} 
                    alt={selectedImage.alt} 
                    className="img-fluid mb-2 rounded border" 
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              </Col>
              <Col md={8}>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={selectedImage.title}
                      onChange={handleImageChange}
                      placeholder="Enter image title"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Alt Text</Form.Label>
                    <Form.Control
                      type="text"
                      name="alt"
                      value={selectedImage.alt}
                      onChange={handleImageChange}
                      placeholder="Alternative text for accessibility"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={selectedImage.description}
                      onChange={handleImageChange}
                      placeholder="Enter image description"
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleSaveEdit}
                      disabled={!selectedImage.title}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Gallery Grid */}
      <Row>
        {images.map(image => (
          <Col key={image.id} md={4} lg={3} className="mb-4">
            <Card className="h-100 shadow-sm">
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={image.src} 
                  alt={image.alt} 
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="image-overlay">
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="me-1"
                    onClick={() => handleEditImage(image)}
                    disabled={!!selectedImage || !!previewImage}
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => confirmDeleteImage(image)}
                    disabled={!!selectedImage || !!previewImage}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </Button>
                </div>
              </div>
              <Card.Body>
                <Card.Title className="fs-6 text-truncate">{image.title}</Card.Title>
                <Card.Text className="small text-muted text-truncate">
                  {image.description || "No description"}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white">
                <small className="text-muted">
                  ID: {image.id}
                </small>
              </Card.Footer>
            </Card>
          </Col>
        ))}

        {images.length === 0 && (
          <Col xs={12} className="text-center py-5">
            <i className="bi bi-images fs-1 text-muted"></i>
            <p className="mt-3">No images found in the gallery</p>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  alert("File input reference not available");
                }
              }}
            >
              Add Your First Image
            </Button>
          </Col>
        )}
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {imageToDelete && (
            <>
              <p>Are you sure you want to delete this image?</p>
              <div className="text-center my-3">
                <img 
                  src={imageToDelete.src} 
                  alt={imageToDelete.alt}
                  className="img-fluid rounded border"
                  style={{ maxHeight: '150px' }}
                />
                <p className="mt-2 mb-0 fw-bold">{imageToDelete.title}</p>
              </div>
              <p className="text-danger">This action cannot be undone.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteImage}>
            Delete Image
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Additional CSS */}
      <style jsx="true">{`
        .image-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 5px;
          opacity: 0;
          transition: opacity 0.3s ease;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 4px;
          padding: 4px;
        }
        
        .card:hover .image-overlay {
          opacity: 1;
        }
        
        .image-preview-container {
          position: relative;
          display: inline-block;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          overflow: hidden;
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
        }
        
        .image-preview-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      `}</style>
    </Container>
  );
};

export default GallerySettings; 