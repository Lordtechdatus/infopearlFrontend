import React, { useRef, useState } from 'react';
import logo from '../../assets/logo1.png';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function getTodayDateStr() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

const LetterCreate = () => {
  const [signature, setSignature] = useState(null);
  const [seal, setSeal] = useState(null);
  const signatureInputRef = useRef();
  const sealInputRef = useRef();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [formData, setFormData] = useState(null); // for edit
  const previewRef = useRef();
  // Refs for form fields
  const notesRef = useRef();
  const nameRef = useRef();
  const positionRef = useRef();
  const emailRef = useRef();
  const numberRef = useRef();
  const contentRef = useRef();
  const [date, setDate] = useState(getTodayDateStr());
  const [letterType, setLetterType] = useState('General');

  const handleSignatureClick = () => {
    signatureInputRef.current.click();
  };

  const handleSealClick = () => {
    sealInputRef.current.click();
  };

  const handleSignatureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSignature(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSealChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSeal(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleGeneratePreview = () => {
    const data = {
      letterType,
      notes: notesRef.current.value,
      name: nameRef.current.value,
      position: positionRef.current.value,
      email: emailRef.current.value,
      number: numberRef.current.value,
      content: contentRef.current.value,
      signature,
      seal,
      date
    };
    setPreviewData(data);
    setFormData(data); // Save for edit
    setShowPreview(true);
  };

  // Back: clear all fields and go to form
  const handleBack = () => {
    setShowPreview(false);
    setFormData(null);
    setSignature(null);
    setSeal(null);
    setDate(getTodayDateStr());
    setLetterType('General');
    if (notesRef.current) notesRef.current.value = '';
    if (nameRef.current) nameRef.current.value = '';
    if (positionRef.current) positionRef.current.value = '';
    if (emailRef.current) emailRef.current.value = '';
    if (numberRef.current) numberRef.current.value = '';
    if (contentRef.current) contentRef.current.value = '';
  };

  // Edit: go to form with previous entries
  const handleEdit = () => {
    setShowPreview(false);
    if (formData) {
      setLetterType(formData.letterType || 'General');
      setDate(formData.date || getTodayDateStr());
      setSignature(formData.signature || null);
      setSeal(formData.seal || null);
      if (notesRef.current) notesRef.current.value = formData.notes || '';
      if (nameRef.current) nameRef.current.value = formData.name || '';
      if (positionRef.current) positionRef.current.value = formData.position || '';
      if (emailRef.current) emailRef.current.value = formData.email || '';
      if (numberRef.current) numberRef.current.value = formData.number || '';
      if (contentRef.current) contentRef.current.value = formData.content || '';
    }
  };

  // Download the preview as PDF using jsPDF and html2canvas
  const handlePrint = async () => {
    if (!previewRef.current) return;
    const element = previewRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    // Calculate width/height for A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Keep aspect ratio
    const imgWidth = pageWidth - 40; // 20pt margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 20;
    if (imgHeight > pageHeight - 40) {
      // If content is longer than one page, scale to fit
      pdf.addImage(imgData, 'PNG', 20, y, imgWidth, pageHeight - 40, undefined, 'FAST');
    } else {
      pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight, undefined, 'FAST');
    }
    pdf.save('letter.pdf');
  };

  return (
    <div className="admin-page">
      <h2 style={{ fontSize: '45px', fontWeight: 'bold', color: '#000000' }}>Create Letter</h2>
      {!showPreview && (
        <>
          <header>
            <div className="invoice-header mb-4" style={{ 
                  backgroundColor: 'white',
                  padding: '25px',
                  borderRadius: '0',
                  color: '#004d7a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={logo} 
                      alt="Company Logo" 
                      style={{ 
                        height: '120px', 
                        width: '120px',
                        marginRight: '25px',
                        backgroundColor: 'white',
                        padding: '5px',
                        borderRadius: '0'
                      }} 
                    />
                    <div>
                      <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '24px' }}>Infopearl Tech Solutions Pvt Ltd</h2>
                      <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>www.infopearl.in</p>
                    </div>
                  </div>
                  <div style={{ marginRight: '100px' }}>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
                      <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
                      <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
                      <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
                  </div>
                </div>
            </header>
            {/* Content Section for Letter */}
            <section style={{
              margin: '40px auto',
              maxWidth: '700px',
              background: '#fff',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              padding: '30px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '0 auto 18px auto', maxWidth: '700px' }}>
                <label htmlFor="letter-type" style={{ fontWeight: 'bold', marginRight: '10px', fontSize: '1.1rem' }}>Letter Type:</label>
                <select
                  id="letter-type"
                  value={letterType}
                  onChange={e => setLetterType(e.target.value)}
                  style={{ borderRadius: '6px', border: '1px solid #ccc', padding: '6px 12px', fontSize: '1.1rem', minWidth: '180px' }}
                >
                  <option value="General">General</option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Experience Letter">Experience Letter</option>
                  <option value="Approval Letter">Approval Letter</option>
                  <option value="Internship Letter">Internship Letter</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <label htmlFor="letter-date" style={{ fontWeight: 'bold', marginRight: '10px', fontSize: '1.1rem' }}>Date:</label>
                <input
                  id="letter-date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ borderRadius: '6px', border: '1px solid #ccc', padding: '6px 12px', fontSize: '1.1rem' }}
                />
              </div>
              <label htmlFor="letter-content" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '1.1rem' }}>Content:</label>
              <textarea
                id="letter-content"
                rows={10}
                ref={contentRef}
                style={{ width: '100%', borderRadius: '6px', border: '1px solid #ccc', padding: '12px', fontSize: '1.1rem', minHeight: '180px' }}
                placeholder="Write the letter content here..."
              />
            </section>
            {/* Footer Section for Letter */}
            <footer style={{
              marginTop: '40px',
              padding: '30px',
              background: '#f8f9fa',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="notes" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Notes:</label>
                <textarea id="notes" rows={3} ref={notesRef} style={{ width: '100%', borderRadius: '6px', border: '1px solid #ccc', padding: '10px', fontSize: '1rem' }} placeholder="Enter any notes here..." />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Name" ref={nameRef} style={{ flex: 1, minWidth: '150px', borderRadius: '6px', border: '1px solid #ccc', padding: '10px', fontSize: '1rem' }} />
                <input type="text" placeholder="Position" ref={positionRef} style={{ flex: 1, minWidth: '150px', borderRadius: '6px', border: '1px solid #ccc', padding: '10px', fontSize: '1rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input type="email" placeholder="Email" ref={emailRef} style={{ flex: 1, minWidth: '150px', borderRadius: '6px', border: '1px solid #ccc', padding: '10px', fontSize: '1rem' }} />
                <input type="text" placeholder="Number" ref={numberRef} style={{ flex: 1, minWidth: '150px', borderRadius: '6px', border: '1px solid #ccc', padding: '10px', fontSize: '1rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end', marginTop: '30px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    type="button"
                    style={{ background: '#258af6', color: 'white', border: 'none', borderRadius: '6px', padding: '12px 28px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                    onClick={handleSignatureClick}
                  >
                    Add Signature
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={signatureInputRef}
                    style={{ display: 'none' }}
                    onChange={handleSignatureChange}
                  />
                  {signature && (
                    <img src={signature} alt="Signature Preview" style={{ marginTop: '10px', maxHeight: '60px', maxWidth: '180px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    type="button"
                    style={{ background: '#004d7a', color: 'white', border: 'none', borderRadius: '6px', padding: '12px 28px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                    onClick={handleSealClick}
                  >
                    Add Company Seal
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={sealInputRef}
                    style={{ display: 'none' }}
                    onChange={handleSealChange}
                  />
                  {seal && (
                    <img src={seal} alt="Seal Preview" style={{ marginTop: '10px', maxHeight: '60px', maxWidth: '180px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }} />
                  )}
                </div>
              </div>
            </footer>
          </>
        )}
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        {!showPreview && (
          <button
            type="button"
            style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', padding: '14px 40px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
            onClick={handleGeneratePreview}
          >
            Generate Letter
          </button>
        )}
        {showPreview && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '20px' }}>
            <button type="button" style={{ background: '#004d7a', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 28px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }} onClick={handleBack}>Back</button>
            <button type="button" style={{ background: '#258af6', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 28px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }} onClick={handleEdit}>Edit</button>
            <button type="button" style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 28px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }} onClick={handlePrint}>Print PDF</button>
          </div>
        )}
      </div>
      {showPreview && (
        <div ref={previewRef} style={{
          margin: ' auto',
          maxWidth: '800px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          paddingRight: '25px',
          paddingLeft: '25px',
          marginBottom: '40px',
        }}>
          {/* Preview Header - same as create letter header */}
          <div className="letter-header mb-4" style={{
            backgroundColor: 'white',
            padding: '5px',
            borderRadius: '0',
            color: '#004d7a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '10px',
            borderBottom: '2px solid #004d7a',
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={logo}
                alt="Company Logo"
                style={{
                  height: '120px',
                  width: '120px',
                  // marginRight: '5px',
                  backgroundColor: 'white',
                  padding: '5px',
                  borderRadius: '0',
                  
                }}
              />
              <div style={{ marginRight: '100px' }}>
                <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '24px' }}>Infopearl Tech Solutions Pvt Ltd</h2>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>www.infopearl.in</p>
              </div>
              <div style={{ marginLeft: '100px' }}>
              <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
              </div>
            </div>
          </div>
          {/* Letter Type in Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.15rem', color: '#004d7a', letterSpacing: '1px' }}>{previewData.letterType}</span>
          </div>
          {/* Date centered below letter type */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', marginLeft: '500px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#222' }}>Date: {previewData.date}</span>
          </div>
          {/* Content */}
          <div style={{ marginBottom: '60px', fontSize: '1.1rem', color: '#222', whiteSpace: 'pre-line' }}>
            {previewData.content}
          </div>
          {/* Signature/Seal/Info at bottom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px', minHeight: '90px' }}>
            {/* Company Seal on left */}
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              {previewData.seal && (
                <>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>From InfoPearl Tech Solutions Pvt. Ltd.</div>
                  <img src={previewData.seal} alt="Seal" style={{ height: '180px', width: '180px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }} />
                </>
              )}
            </div>
            {/* Signature and Info on right */}
            <div style={{ textAlign: 'right', minWidth: '220px' }}>
              {previewData.signature && (
                <>
                  <div style={{ fontSize: '0.95rem', color: '#888', marginBottom: '4px' }}></div>
                  <img src={previewData.signature} alt="Signature" style={{ maxHeight: '60px', maxWidth: '180px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', marginBottom: '8px' }} />
                </>
              )}
              <div style={{ color: '#000', fontWeight: 'bold', fontSize: '1.1rem' }}>{previewData.name}</div>
              <div style={{ fontSize: '1rem', color: '#000' }}>{previewData.position}</div>
              <div style={{ fontSize: '0.95rem', color: '#000' }}>{previewData.email}</div>
              <div style={{ fontSize: '0.95rem', color: '#000' }}>{previewData.number}</div>
            </div>
          </div>
          {/* Notes at the end */}
          {previewData.notes && (
            <div style={{ marginTop: '40px', color: '#555', fontSize: '1rem', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <strong>Notes:</strong> {previewData.notes}
            </div>
          )}
          {/* Company Footer with border and QR code */}
          <div style={{
            borderTop: '2px solid #004d7a',
            marginTop: '50px',
            paddingTop: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#004d7a' }}>CIN: U72100MP2025PTC074945 </div>
              <div style={{ fontSize: '0.98rem', color: '#222' }}>infopearl396@gmail.com</div>
              <div style={{ fontSize: '0.98rem', color: '#222' }}>G1 Akansha Apartment, Patel Nagar, City center</div>
              <div style={{ fontSize: '0.98rem', color: '#222' }}>Gwalior, M.P</div>
            </div>
            <div style={{ flex: 'none', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QRCode value="https://www.infopearl.in" size={70} bgColor="#fff" fgColor="#004d7a" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterCreate; 