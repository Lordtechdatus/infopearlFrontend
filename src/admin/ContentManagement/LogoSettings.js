import React, { useState, useRef } from 'react';

const LogoSettings = () => {
  const [currentLogo, setCurrentLogo] = useState('/logo.png');
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!previewLogo) {
      alert('Please select a logo to upload');
      return;
    }
  
    setIsUploading(true);
  
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      setCurrentLogo(previewLogo);
  
      // 🔁 Save to localStorage
      const savedFooterData = localStorage.getItem('footerData');
      const footerData = savedFooterData ? JSON.parse(savedFooterData) : {};
      const updatedFooterData = {
        ...footerData,
        contact: {
          ...footerData.contact,
          logoUrl: previewLogo
        }
      };
      localStorage.setItem('footerData', JSON.stringify(updatedFooterData));
  
      // Clear preview
      setPreviewLogo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  
      setSuccessMessage('Logo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error uploading logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  

  const handleCancel = () => {
    setPreviewLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="content-management-container">
      <h2>Logo Management</h2>
      <p>Upload and manage the website logo</p>
      
      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      
      <div className="logo-management">
        <div className="current-logo-container">
          <h3>Current Logo</h3>
          <div className="logo-preview">
            <img src={currentLogo} alt="Current Logo" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="management-form">
          <div className="form-group">
            <label htmlFor="logo">Upload New Logo</label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <small>Recommended size: 200x60 pixels. Max file size: 2MB. Supported formats: PNG, JPG, WEBP</small>
          </div>
          
          {previewLogo && (
            <div className="new-logo-preview">
              <h4>Preview</h4>
              <div className="logo-preview">
                <img src={previewLogo} alt="New Logo Preview" />
              </div>
            </div>
          )}
          
          <div className="form-actions">
            {previewLogo && (
              <>
                <button 
                  type="submit" 
                  className="save-btn" 
                  disabled={isUploading}
                  onClick={handleSubmit}
                >
                  {isUploading ? 'Uploading...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
      
      <div className="logo-usage-guide">
        <h3>Logo Usage Guidelines</h3>
        <ul>
          <li>Maintain a transparent background for better compatibility across the website.</li>
          <li>Use high-quality images with appropriate resolution.</li>
          <li>The logo should be clearly visible when displayed in the header.</li>
          <li>Avoid logos with excessive detail that might not render well at smaller sizes.</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoSettings; 