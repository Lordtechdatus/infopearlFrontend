import React, { useRef, useState } from 'react';
import logo from '../../assets/logo1.png';

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
  // Refs for form fields
  const notesRef = useRef();
  const nameRef = useRef();
  const positionRef = useRef();
  const emailRef = useRef();
  const numberRef = useRef();
  const contentRef = useRef();
  const [date, setDate] = useState(getTodayDateStr());

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
    setPreviewData({
      notes: notesRef.current.value,
      name: nameRef.current.value,
      position: positionRef.current.value,
      email: emailRef.current.value,
      number: numberRef.current.value,
      content: contentRef.current.value,
      signature,
      seal,
      date
    });
    setShowPreview(true);
  };

  return (
    <div className="admin-page">
      <h2 style={{ fontSize: '45px', fontWeight: 'bold', color: '#000000' }}>Create Letter</h2>
      <header>
        <div className="invoice-header mb-4" style={{ 
              // background: 'linear-gradient(135deg, #051937, #004d7a)',
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
                  {/* <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>www.infopearl.in</p> */}
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
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
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <button
          type="button"
          style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', padding: '14px 40px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
          onClick={handleGeneratePreview}
        >
          Generate Letter
        </button>
      </div>
      {showPreview && (
        <div style={{
          margin: '40px auto',
          maxWidth: '800px',
          background: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '40px',
          marginBottom: '40px',
        }}>
          {/* Preview Header - same as create letter header */}
          <div className="invoice-header mb-4" style={{
            // background: 'linear-gradient(135deg, #051937, #004d7a)',
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '0',
            color: '#004d7a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '30px',
            borderBottom: '1px solid #004d7a',
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
                {/* <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>www.infopearl.in</p> */}
              </div>
              <div style={{ marginLeft: '100px' }}>
              <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
                  <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
              </div>
            </div>
          </div>
          {/* Date at top right of content */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
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
        </div>
      )}
    </div>
  );
};

export default LetterCreate; 