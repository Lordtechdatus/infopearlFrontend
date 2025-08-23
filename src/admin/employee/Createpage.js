// import React, { useState, useEffect, useRef } from 'react';
// import { Container, Row, Col, Form, Button, Card, InputGroup, Alert, Modal, ListGroup } from 'react-bootstrap';
// import logo from '../../assets/logo1.png';
// import signature from '../../admin/signature.png';
// import '../invoices/InvoiceCreate.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { useNavigate } from 'react-router-dom';
// import QRCode from 'react-qr-code';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// // =========================
// // API base + upload helper
// // =========================
// const API_BASE = process.env.REACT_APP_API_BASE || 'https://backend.infopearl.in';

// // Upload pdf + metadata to backend (PHP endpoint that saves DB row + /uploads/invoices file)
// async function uploadInvoicePdf(pdfBlob, meta) {
//   const form = new FormData();
//   form.append('pdf', pdfBlob, `Invoice_${meta.invoiceNumber}.pdf`);
//   form.append('meta', JSON.stringify(meta)); // backend will parse JSON

//   // If you don't have rewrite rules, keep the .php file path:
//   const endpoint = `${API_BASE}/create-invoices.php`;
//   const res = await fetch(endpoint, {
//     method: 'POST',
//     body: form, // no Content-Type header; browser sets it
//   });

//   let data = {};
//   try {
//     data = await res.json();
//   } catch (_) {
//     // ignore JSON parse error to surface a helpful message below
//   }
//   if (!res.ok || data.status !== 'success') {
//     throw new Error(data.message || `Upload failed with ${res.status}`);
//   }
//   // expected { status:'success', fileUrl, filename, invoice_no, id }
//   return data;
// }

// // Convert DD/MM/YYYY -> YYYY-MM-DD for backend DB
// function toISODate(ddmmyyyy) {
//   if (!ddmmyyyy || !ddmmyyyy.includes('/')) return ddmmyyyy;
//   const [d, m, y] = ddmmyyyy.split('/');
//   if (!d || !m || !y) return ddmmyyyy;
//   return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
// }

// const InvoiceCreate = () => {
//   const navigate = useNavigate();
//   const [showInvoicePreview, setShowInvoicePreview] = useState(false);
//   const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [showCustomerModal, setShowCustomerModal] = useState(false);
//   const [customers, setCustomers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [formData, setFormData] = useState({
//     invoiceType: 'Invoice',
//     status: 'Open',
//     invoiceNumber: '',
//     invoiceDate: '',
//     dueDate: '',
//     customerInfo: {
//       name: '',
//       email: '',
//       address1: '',
//       town: '',
//       country: '',
//       phone: ''
//     },
//     items: [
//       {
//         id: 1,
//         description: '',
//         quantity: 1,
//         price: 0,
//         amount: 0
//       }
//     ],
//     notes: '',
//     subtotal: '0.00',
//     cgst: '0.00',
//     sgst: '0.00',
//     total: '0.00',
//     nextId: '0',
//     taxInclusive: false,
//   });

//   const printRef = useRef(null);
//   const invoiceRef = useRef(null);
  
//   // Auto-fill current date and next invoice id/number
//   useEffect(() => {
//     const today = new Date();
//     const formattedDate = formatDate(today);
//     const dueDate = new Date();
//     dueDate.setDate(today.getDate() + 7);
//     const formattedDueDate = formatDate(dueDate);

//     let nextId = 1;
//     try {
//       const storedNextId = localStorage.getItem('next_invoice_id');
//       if (storedNextId) {
//         const parsedId = parseInt(storedNextId);
//         if (!isNaN(parsedId) && parsedId >= 1) {
//           nextId = parsedId;
//         } else {
//           localStorage.setItem('next_invoice_id', '1');
//         }
//       } else {
//         const savedInvoicesString = localStorage.getItem('invoices');
//         if (savedInvoicesString) {
//           const savedInvoices = JSON.parse(savedInvoicesString);
//           if (Array.isArray(savedInvoices) && savedInvoices.length > 0) {
//             const numericIds = savedInvoices
//               .map(inv => {
//                 if (inv.invoiceNumber && inv.invoiceNumber.startsWith('INV')) {
//                   const numPart = inv.invoiceNumber.replace('INV', '');
//                   return parseInt(numPart);
//                 }
//                 const idNum = parseInt(inv.id);
//                 return isNaN(idNum) ? 0 : idNum;
//               })
//               .filter(id => !isNaN(id));
//             if (numericIds.length > 0) {
//               nextId = Math.max(...numericIds, 1) + 1;
//             }
//           }
//         }
//         localStorage.setItem('next_invoice_id', nextId.toString());
//       }
//     } catch (error) {
//       console.error("Error determining next invoice ID:", error);
//       localStorage.setItem('next_invoice_id', '1');
//     }

//     const formattedInvoiceNumber = `INV${nextId.toString().padStart(4, '0')}`;
//     setFormData(prev => ({
//       ...prev,
//       invoiceDate: formattedDate,
//       dueDate: formattedDueDate,
//       nextId: nextId.toString(),
//       invoiceNumber: formattedInvoiceNumber
//     }));
//   }, []);

//   // Load existing customers
//   useEffect(() => {
//     try {
//       const savedCustomers = localStorage.getItem('customers');
//       if (savedCustomers) {
//         const parsedCustomers = JSON.parse(savedCustomers);
//         if (Array.isArray(parsedCustomers)) {
//           setCustomers(parsedCustomers);
//         }
//       }
//     } catch (error) {
//       console.error('Error loading customers:', error);
//     }
//   }, []);

//   // Format date as DD/MM/YYYY
//   const formatDate = (date) => {
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // Input handlers
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleCustomerInfoChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       customerInfo: { ...prev.customerInfo, [name]: value }
//     }));
//   };

//   // Item edits
//   const handleItemChange = (index, field, value) => {
//     const newItems = [...formData.items];

//     if (field === 'price') {
//       if (!/^(\d*\.?\d*)$/.test(value) && value !== '') {
//         return;
//       }
//     }

//     newItems[index][field] = value;

//     if (field === 'quantity' || field === 'price') {
//       const quantity = parseFloat(newItems[index].quantity) || 0;
//       const price = parseFloat(newItems[index].price) || 0;
//       const itemAmount = quantity * price;
//       newItems[index].amount = itemAmount.toFixed(2);
//     }

//     setFormData(prev => ({
//       ...prev,
//       items: newItems
//     }));
    
//     calculateTotals(newItems);
//   };

//   // Toggle tax inclusive
//   const handleTaxInclusiveChange = (checked) => {
//     setFormData(prev => {
//       const next = { ...prev, taxInclusive: checked };
//       calculateTotals(next.items, checked);
//       return next;
//     });
//   };

//   // Totals (inclusive/exclusive)
//   const calculateTotals = (items, taxInclusiveFlag = formData.taxInclusive) => {
//     const subtotalRaw = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
//     const totalTaxRate = 0.18; // 18% GST total
//     const halfTaxRate = 0.09;  // 9% each for CGST/SGST

//     let cgst, sgst, total, displaySubtotal;

//     if (taxInclusiveFlag) {
//       // Prices include taxes: extract tax portions but keep total == subtotalRaw
//       cgst = (subtotalRaw * halfTaxRate) / (1 + totalTaxRate);
//       sgst = (subtotalRaw * halfTaxRate) / (1 + totalTaxRate);
//       displaySubtotal = subtotalRaw;
//       total = subtotalRaw;
//     } else {
//       // Prices exclude taxes: add on top
//       cgst = subtotalRaw * halfTaxRate;
//       sgst = subtotalRaw * halfTaxRate;
//       displaySubtotal = subtotalRaw;
//       total = subtotalRaw + cgst + sgst;
//     }

//     setFormData(prev => ({
//       ...prev,
//       subtotal: displaySubtotal.toFixed(2),
//       cgst: cgst.toFixed(2),
//       sgst: sgst.toFixed(2),
//       total: total.toFixed(2)
//     }));
//   };

//   // Add / remove item rows
//   const addItemRow = () => {
//     const newItem = {
//       id: Date.now().toString(),
//       description: '',
//       quantity: 1,
//       price: 0,
//       amount: 0
//     };
//     const newItems = [...formData.items, newItem];
//     setFormData(prev => ({ ...prev, items: newItems }));
//   };

//   const removeItemRow = (index) => {
//     if (formData.items.length > 1) {
//       const newItems = [...formData.items];
//       newItems.splice(index, 1);
//       setFormData(prev => ({ ...prev, items: newItems }));
//       calculateTotals(newItems);
//     }
//   };

//   // Submit -> show preview
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!formData.customerInfo.name || !formData.customerInfo.email) {
//       alert('Please fill in customer name and email');
//       return;
//     }

//     const emptyItems = formData.items.filter(item => !item.description || !item.price);
//     if (emptyItems.length > 0) {
//       alert('Please fill in all item details (description and price are required)');
//       return;
//     }

//     if (!formData.invoiceDate) {
//       alert('Please provide an invoice date');
//       return;
//     }

//     const invoiceNumber = formData.invoiceNumber;
//     if (!invoiceNumber) {
//       alert('Please provide an invoice number');
//       return;
//     }

//     if (!invoiceNumber.startsWith('INV') || !/\d+/.test(invoiceNumber)) {
//       alert('Invoice number must start with "INV" followed by numbers (e.g., INV0001)');
//       return;
//     }

//     setShowInvoicePreview(true);
//   };

//   const handleBackToForm = () => setShowInvoicePreview(false);

//   const handleBackToNewForm = () => {
//     const today = new Date();
//     const formattedDate = formatDate(today);
//     const dueDate = new Date();
//     dueDate.setDate(today.getDate() + 7);
//     const formattedDueDate = formatDate(dueDate);

//     let nextId = 1;
//     try {
//       const storedNextId = localStorage.getItem('next_invoice_id');
//       if (storedNextId) {
//         const parsedId = parseInt(storedNextId);
//         if (!isNaN(parsedId) && parsedId >= 1) nextId = parsedId;
//       }
//     } catch (error) {
//       console.error("Error getting next invoice ID:", error);
//     }

//     const formattedInvoiceNumber = `INV${nextId.toString().padStart(4, '0')}`;

//     setFormData({
//       invoiceType: 'Invoice',
//       status: 'Open',
//       invoiceNumber: formattedInvoiceNumber,
//       invoiceDate: formattedDate,
//       dueDate: formattedDueDate,
//       customerInfo: {
//         name: '',
//         email: '',
//         address1: '',
//         town: '',
//         country: '',
//         phone: ''
//       },
//       items: [
//         {
//           id: Date.now().toString(),
//           description: '',
//           quantity: 1,
//           price: 0,
//           amount: 0
//         }
//       ],
//       notes: '',
//       subtotal: '0.00',
//       cgst: '0.00',
//       sgst: '0.00',
//       total: '0.00',
//       nextId: nextId.toString(),
//       taxInclusive: false,
//     });

//     setShowInvoicePreview(false);
//     setSuccessMessage('');
//   };

//   // Print preview
//   const handlePrintPreview = () => {
//     try {
//       // Ensure it also gets into invoice list
//       saveInvoiceData();

//       const printContent = document.getElementById('invoice-preview');
//       if (!printContent) return;

//       let iframe = document.createElement('iframe');
//       iframe.style.visibility = 'hidden';
//       iframe.style.position = 'fixed';
//       iframe.style.right = '0';
//       iframe.style.bottom = '0';
//       iframe.style.width = '0';
//       iframe.style.height = '0';
//       iframe.style.border = '0';
//       document.body.appendChild(iframe);

//       iframe.contentDocument.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>Invoice #${formData.invoiceNumber}</title>
//             <style>
//               body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
//               @media print {
//                 @page { size: A4; margin: 0.5cm; }
//                 body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//               }
//               table { width: 100%; border-collapse: collapse; }
//               th, td { padding: 8px; }
//               th { background-color: #051937; color: white; }
//               .invoice-header { display: flex; justify-content: space-between; background: linear-gradient(135deg, #051937, #004d7a); color: white; padding: 20px; margin-bottom: 30px; }
//               .signature-section { text-align: center; }
//               .total-row { background: linear-gradient(135deg, #051937, #004d7a); color: white; font-weight: bold; }
//             </style>
//           </head>
//           <body>
//             ${printContent.innerHTML}
//           </body>
//         </html>
//       `);
//       iframe.contentDocument.close();
//       iframe.focus();

//       setTimeout(() => {
//         iframe.contentWindow.print();
//         setTimeout(() => document.body.removeChild(iframe), 500);
//       }, 500);
//     } catch (error) {
//       console.error('Error during print preview:', error);
//     }
//   };

//   // Save invoice data to localStorage (for list)
//   const saveInvoiceData = () => {
//     try {
//       const items = formData.items;
//       const subtotalRaw = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
//       const totalTaxRate = 0.18;
//       const halfTaxRate = 0.09;

//       let cgst, sgst, total, displaySubtotal;

//       if (formData.taxInclusive) {
//         cgst = (subtotalRaw * halfTaxRate) / (1 + totalTaxRate);
//         sgst = (subtotalRaw * halfTaxRate) / (1 + totalTaxRate);
//         displaySubtotal = subtotalRaw;
//         total = subtotalRaw;
//       } else {
//         cgst = subtotalRaw * halfTaxRate;
//         sgst = subtotalRaw * halfTaxRate;
//         displaySubtotal = subtotalRaw;
//         total = subtotalRaw + cgst + sgst;
//       }

//       const updatedFormData = {
//         ...formData,
//         subtotal: displaySubtotal.toFixed(2),
//         cgst: cgst.toFixed(2),
//         sgst: sgst.toFixed(2),
//         total: total.toFixed(2)
//       };

//       let invoices = [];
//       try {
//         const savedInvoicesString = localStorage.getItem('invoices');
//         if (savedInvoicesString) {
//           const parsedData = JSON.parse(savedInvoicesString);
//           if (Array.isArray(parsedData)) {
//             invoices = parsedData;
//           } else {
//             invoices = [];
//             localStorage.removeItem('invoices');
//           }
//         }
//       } catch {
//         invoices = [];
//         localStorage.removeItem('invoices');
//       }

//       const currentId = parseInt(formData.nextId);

//       const invoiceToSave = {
//         ...updatedFormData,
//         id: currentId.toString(),
//         createdAt: new Date().toISOString(),
//         invoiceNumber: updatedFormData.invoiceNumber,
//         invoiceType: updatedFormData.invoiceType,
//         status: updatedFormData.status,
//         total: updatedFormData.total,
//         subtotal: updatedFormData.subtotal,
//         cgst: updatedFormData.cgst,
//         sgst: updatedFormData.sgst,
//         taxInclusive: updatedFormData.taxInclusive,
//         customerInfo: {
//           ...updatedFormData.customerInfo
//         },
//         items: updatedFormData.items.map(item => ({
//           id: item.id,
//           description: item.description,
//           quantity: item.quantity,
//           price: item.price,
//           amount: item.amount
//         }))
//       };

//       let shouldAddInvoice = true;
//       const existingIndex = invoices.findIndex(inv => inv.invoiceNumber === updatedFormData.invoiceNumber);
//       let updatedInvoices = [...invoices];

//       if (existingIndex >= 0) {
//         if (window.confirm(`Invoice number ${updatedFormData.invoiceNumber} already exists. Update it? Click Cancel to create a new invoice instead.`)) {
//           updatedInvoices[existingIndex] = {
//             ...invoiceToSave,
//             id: invoices[existingIndex].id,
//             updatedAt: new Date().toISOString()
//           };
//           shouldAddInvoice = false;
//         } else {
//           shouldAddInvoice = true;
//         }
//       }

//       if (shouldAddInvoice) {
//         updatedInvoices.push(invoiceToSave);
//         const nextId = currentId + 1;
//         localStorage.setItem('next_invoice_id', nextId.toString());
//       }

//       localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
//       return invoiceToSave;
//     } catch (error) {
//       console.error("Error in saveInvoiceData:", error);
//       alert(`Error saving invoice: ${error.message}`);
//       return null;
//     }
//   };

//   // ===============================
//   // SAVE button -> make + upload PDF
//   // ===============================
//   const handleSaveAndDownload = async () => {
//     try {
//       setIsGeneratingPdf(true);
//       setSuccessMessage('');

//       // 1) Save locally (so it shows in invoice list)
//       const invoiceToSave = saveInvoiceData();
//       if (!invoiceToSave) {
//         setIsGeneratingPdf(false);
//         setSuccessMessage('Failed to save invoice. Please try again.');
//         return;
//       }

//       // 2) Render the preview DOM to canvas
//       const invoiceElement = document.getElementById('invoice-preview');
//       if (!invoiceElement) {
//         setSuccessMessage('Error generating PDF. Could not find invoice preview element.');
//         setIsGeneratingPdf(false);
//         return;
//       }

//       const canvas = await html2canvas(invoiceElement, {
//         scale: 2,
//         useCORS: true,
//         logging: false
//       });

//       // 3) Create PDF and draw the image (IMPORTANT)
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
//       const imgX = (pdfWidth - imgWidth * ratio) / 2;
//       const imgY = 0;
//       pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

//       // 4) Send PDF + meta to backend
//       const pdfBlob = pdf.output('blob');
//       const payload = {
//         invoiceNumber: invoiceToSave.invoiceNumber,
//         invoiceDate: invoiceToSave.invoiceDate,            // DD/MM/YYYY (raw)
//         invoiceDateISO: toISODate(invoiceToSave.invoiceDate),
//         dueDate: invoiceToSave.dueDate,
//         dueDateISO: toISODate(invoiceToSave.dueDate),
//         customerName: invoiceToSave.customerInfo?.name || '',
//         totalAmount: invoiceToSave.total
//       };
//       const { fileUrl } = await uploadInvoicePdf(pdfBlob, payload);

//       // 5) Store fileUrl back to the same record in localStorage so the list can download from server
//       try {
//         const savedStr = localStorage.getItem('invoices');
//         const saved = savedStr ? JSON.parse(savedStr) : [];
//         const idx = saved.findIndex(inv => inv.invoiceNumber === invoiceToSave.invoiceNumber);
//         if (idx !== -1) {
//           saved[idx].pdfUrl = fileUrl;
//           localStorage.setItem('invoices', JSON.stringify(saved));
//         }
//       } catch (_) {
//         // ignore local update errors
//       }

//       // 6) Also download locally for user (optional)
//       pdf.save(`Invoice_${invoiceToSave.invoiceNumber}.pdf`);

//       // 7) Success + reset form for next invoice
//       setSuccessMessage('Invoice saved to the server and downloaded successfully! It is also added to the invoice list.');

//       let nextId = 1;
//       const storedNextId = localStorage.getItem('next_invoice_id');
//       if (storedNextId) {
//         const parsedId = parseInt(storedNextId);
//         if (!isNaN(parsedId) && parsedId >= 1) nextId = parsedId;
//       }
//       const nextInvoiceNumber = `INV${nextId.toString().padStart(4, '0')}`;

//       const today = new Date();
//       const formattedDate = formatDate(today);
//       const due = new Date();
//       due.setDate(today.getDate() + 7);
//       const formattedDueDate = formatDate(due);

//       setFormData({
//         invoiceType: 'Invoice',
//         status: 'Open',
//         invoiceNumber: nextInvoiceNumber,
//         invoiceDate: formattedDate,
//         dueDate: formattedDueDate,
//         customerInfo: {
//           name: '',
//           email: '',
//           address1: '',
//           town: '',
//           country: '',
//           phone: ''
//         },
//         items: [
//           { id: Date.now().toString(), description: '', quantity: 1, price: 0, amount: 0 }
//         ],
//         notes: '',
//         subtotal: '0.00',
//         cgst: '0.00',
//         sgst: '0.00',
//         total: '0.00',
//         nextId: nextId.toString(),
//         taxInclusive: false,
//       });

//       setTimeout(() => {
//         setSuccessMessage(prev => prev + ' You can now create a new invoice.');
//       }, 1000);
//     } catch (error) {
//       console.error('Error generating/uploading PDF:', error);
//       setSuccessMessage(`Error: ${error.message || 'There was a problem generating or uploading the PDF.'}`);
//     } finally {
//       setIsGeneratingPdf(false);
//     }
//   };

//   // Debug local invoices
//   const debugInvoiceStorage = () => {
//     try {
//       const savedInvoicesString = localStorage.getItem('invoices');
//       if (!savedInvoicesString) {
//         alert("No invoices found in localStorage");
//         return;
//       }
//       const savedInvoices = JSON.parse(savedInvoicesString);
//       console.log("Current invoices in localStorage:", savedInvoices);
//       alert(`Found ${savedInvoices.length} invoices in localStorage. Check console for details.`);
//     } catch (error) {
//       console.error("Error checking localStorage:", error);
//       alert(`Error checking localStorage: ${error.message}`);
//     }
//   };

//   // Select existing customer
//   const handleSelectCustomer = (customer) => {
//     setFormData(prev => ({
//       ...prev,
//       customerInfo: {
//         name: customer.name || '',
//         email: customer.email || '',
//         address1: customer.address || customer.address1 || '',
//         town: customer.city || customer.town || '',
//         country: customer.country || '',
//         phone: customer.phone || customer.phoneNumber || ''
//       }
//     }));
//     setShowCustomerModal(false);
//   };

//   const filteredCustomers = customers.filter(customer => 
//     (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
//     (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <Container fluid>
//       {!showInvoicePreview ? (
//         <>
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h1 className="mb-0">Create New INVOICE</h1>
//             <Button 
//               variant="outline-secondary" 
//               size="sm" 
//               onClick={debugInvoiceStorage}
//               style={{ fontSize: '0.8rem' }}
//             >
//               Debug Storage
//             </Button>
//           </div>
          
//           <div className="invoice-header mb-4" style={{ 
//             background: 'white',
//             padding: '25px',
//             borderRadius: '0',
//             color: '#004d7a',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center'
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//               <img 
//                 src={logo} 
//                 alt="Company Logo" 
//                 style={{ 
//                   height: '120px', 
//                   width: '120px',
//                   marginRight: '25px',
//                   backgroundColor: 'white',
//                   padding: '5px',
//                   borderRadius: '0',
//                 }} 
//               />
//               <div>
//                 <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '24px' }}>Infopearl Tech Solutions Pvt Ltd</h2>
//                 <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>www.infopearl.in</p>
//               </div>
//             </div>
//             <div style={{ marginRight: '70px' }}>
//               <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
//               <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
//               <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
//               <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
//             </div>
//           </div>

//           <Form onSubmit={handleSubmit}>
//             {/* Invoice Header */}
//             <Row className="mb-4">
//               <Col md={6} className="text-md-end">
//                 <Form.Label className="mt-2">Select Type:</Form.Label>
//               </Col>
//               <Col md={3}>
//                 <Form.Select 
//                   name="invoiceType"
//                   value={formData.invoiceType}
//                   onChange={handleChange}
//                 >
//                   <option value="Invoice">Invoice</option>
//                   <option value="Quote">Quote</option>
//                   <option value="Receipt">Receipt</option>
//                 </Form.Select>
//               </Col>
//               <Col md={3}>
//                 <Form.Select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                 >
//                   <option value="Open">Open</option>
//                   <option value="Paid">Paid</option>
//                   <option value="Overdue">Overdue</option>
//                 </Form.Select>
//               </Col>
//             </Row>
            
//             <Row className="mb-4">
//               <Col md={4}>
//                 <InputGroup>
//                   <Form.Control
//                     type="text"
//                     placeholder="Invoice Number"
//                     name="invoiceNumber"
//                     value={formData.invoiceNumber}
//                     onChange={handleChange}
//                     className="invoice-number-input"
//                     style={{ border: '1px solid lightgray' }}
//                   />
//                   <InputGroup.Text><i className="bi bi-hash"></i></InputGroup.Text>
//                 </InputGroup>
//                 <Form.Text className="text-muted">
//                   Auto-generated but can be edited if needed
//                 </Form.Text>
//               </Col>
//               <Col md={4}>
//                 <InputGroup>
//                   <Form.Control
//                     type="text"
//                     placeholder="Invoice Date"
//                     name="invoiceDate"
//                     value={formData.invoiceDate}
//                     onChange={handleChange}
//                     style={{ border: '1px solid lightgray' }}
//                   />
//                   <InputGroup.Text><i className="bi bi-calendar"></i></InputGroup.Text>
//                 </InputGroup>
//               </Col>
//               <Col md={4}>
//                 <InputGroup>
//                   <Form.Control
//                     type="text"
//                     placeholder="Due Date"
//                     name="dueDate"
//                     value={formData.dueDate}
//                     onChange={handleChange}
//                     style={{ border: '1px solid lightgray' }}
//                   />
//                   <InputGroup.Text><i className="bi bi-calendar"></i></InputGroup.Text>
//                 </InputGroup>
//               </Col>
//             </Row>

//             {/* Customer Information */}
//             <Row className="mb-4">
//               <Col md={12}>
//                 <Card>
//                   <Card.Header className="d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Customer Information</h5>
//                     <Button 
//                       variant="link" 
//                       size="sm"
//                       onClick={() => setShowCustomerModal(true)}
//                     >
//                       OR Select Existing Customer
//                     </Button>
//                   </Card.Header>
//                   <Card.Body>
//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Control
//                           type="text"
//                           placeholder="Enter Name"
//                           name="name"
//                           value={formData.customerInfo.name}
//                           onChange={handleCustomerInfoChange}
//                         />
//                       </Col>
//                       <Col md={6}>
//                         <Form.Control
//                           type="email"
//                           placeholder="Email"
//                           name="email"
//                           value={formData.customerInfo.email}
//                           onChange={handleCustomerInfoChange}
//                         />
//                       </Col>
//                     </Row>
                    
//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Control
//                           type="text"
//                           placeholder="Address Line 1"
//                           name="address1"
//                           value={formData.customerInfo.address1}
//                           onChange={handleCustomerInfoChange}
//                         />
//                       </Col>
//                       <Col md={6}>
//                         <Form.Control
//                           type="text"
//                           placeholder="Town/City"
//                           name="town"
//                           value={formData.customerInfo.town}
//                           onChange={handleCustomerInfoChange}
//                         />
//                       </Col>
//                     </Row>
                    
//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Control
//                           type="text"
//                           placeholder="Country"
//                           name="country"
//                           value={formData.customerInfo.country}
//                           onChange={handleCustomerInfoChange}
//                         />
//                       </Col>
//                       <Col md={6}>
//                         <Form.Control
//                           type="text"
//                           placeholder="Phone Number"
//                           name="phone"
//                           value={formData.customerInfo.phone}
//                           onChange={handleCustomerInfoChange}
//                         />
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>

//             {/* Invoice Items Section */}
//             <div className="mb-4">
//               <h2 className="mb-3">Item Details</h2>
//               <div className="table-responsive">
//                 <table className="table table-bordered">
//                   <thead>
//                     <tr>
//                       <th style={{ width: '34%' }}>Description</th>
//                       <th style={{ width: '13%' }}>Quantity</th>
//                       <th style={{ width: '13%' }}>Price (₹)</th>
//                       <th style={{ width: '13%' }}>Amount</th>
//                       <th style={{ width: '15%' }}>TAX</th>
//                       <th style={{ width: '12%' }}>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {formData.items.map((item, index) => (
//                       <tr key={item.id}>
//                         <td>
//                           <Form.Control
//                             type="text"
//                             value={item.description}
//                             onChange={(e) => handleItemChange(index, 'description', e.target.value)}
//                           />
//                         </td>
//                         <td>
//                           <Form.Control
//                             type="number"
//                             value={item.quantity}
//                             min="1"
//                             step="1"
//                             onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
//                           />
//                         </td>
//                         <td>
//                           <Form.Control
//                             type="text"
//                             value={item.price}
//                             onChange={(e) => handleItemChange(index, 'price', e.target.value)}
//                           />
//                         </td>
//                         <td className="text-end">₹{item.amount || '0.00'}</td>
//                         <td className="text-center">
//                           <Form.Check
//                             type="checkbox"
//                             id={`tax-inclusive-${item.id}`}
//                             label="Inclusive"
//                             checked={formData.taxInclusive}
//                             onChange={(e) => handleTaxInclusiveChange(e.target.checked)}
//                           />
//                         </td>
//                         <td className="text-center">
//                           <Button 
//                             variant="danger" 
//                             size="sm"
//                             onClick={() => removeItemRow(index)}
//                             disabled={formData.items.length === 1}
//                             aria-label="Delete item"
//                             className="delete-btn"
//                             style={{ 
//                               width: "32px", 
//                               height: "32px", 
//                               padding: "0",
//                               display: "inline-flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               borderRadius: "4px"
//                             }}
//                           >
//                             <i className="bi bi-trash-fill"></i>
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <Button 
//                 variant="success" 
//                 onClick={addItemRow}
//                 className="mb-4"
//                 style={{ padding: '8px 16px', borderRadius: '4px', fontWeight: '500' }}
//               >
//                 <i className="bi bi-plus-circle me-2"></i>
//                 Add Item
//               </Button>
              
//               <div className="row justify-content-end">
//                 <div className="col-md-6">
//                   <div className="table-responsive">
//                     <table className="table">
//                       <tbody>
//                         <tr>
//                           <td className="text-end fw-bold">SUBTOTAL</td>
//                           <td className="text-end" style={{ width: '150px' }}>₹{formData.subtotal}</td>
//                         </tr>
//                         <tr>
//                           <td className="text-end fw-bold">CGST (9%)</td>
//                           <td className="text-end">₹{formData.cgst}</td>
//                         </tr>
//                         <tr>
//                           <td className="text-end fw-bold">SGST (9%)</td>
//                           <td className="text-end">₹{formData.sgst}</td>
//                         </tr>
//                         <tr className="bg-primary text-white">
//                           <td className="text-end fw-bold">TOTAL</td>
//                           <td className="text-end fw-bold">₹{formData.total}</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                   {/* Optional global switch outside table
//                   <Form.Check
//                     type="switch"
//                     id="tax-inclusive-switch"
//                     label="Prices are tax-inclusive"
//                     checked={formData.taxInclusive}
//                     onChange={(e) => handleTaxInclusiveChange(e.target.checked)}
//                   />
//                   */}
//                 </div>
//               </div>
//             </div>

//             <div className="d-grid mb-5">
//               <Button 
//                 type="submit" 
//                 size="lg"
//                 style={{ 
//                   background: 'linear-gradient(to right, #3f51b5, #7b1fa2)',
//                   border: 'none', 
//                   width: '40%',
//                   margin: '0 auto'
//                 }}
//               >
//                 Generate Invoice
//               </Button>
//             </div>
//           </Form>

//           {/* Customer Selection Modal */}
//           <Modal 
//             show={showCustomerModal} 
//             onHide={() => setShowCustomerModal(false)}
//             centered
//             size="lg"
//           >
//             <Modal.Header closeButton>
//               <Modal.Title>Select Customer</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//               <Form.Control
//                 type="text"
//                 placeholder="Search customers by name or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="mb-3"
//               />
              
//               {filteredCustomers.length > 0 ? (
//                 <ListGroup>
//                   {filteredCustomers.map((customer, index) => (
//                     <ListGroup.Item 
//                       key={index} 
//                       action 
//                       onClick={() => handleSelectCustomer(customer)}
//                       className="d-flex justify-content-between align-items-center"
//                     >
//                       <div>
//                         <div><strong>{customer.name}</strong></div>
//                         <div className="text-muted small">{customer.email}</div>
//                       </div>
//                       <Button 
//                         variant="outline-primary" 
//                         size="sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleSelectCustomer(customer);
//                         }}
//                       >
//                         Select
//                       </Button>
//                     </ListGroup.Item>
//                   ))}
//                 </ListGroup>
//               ) : (
//                 <div className="text-center p-3">
//                   {searchTerm ? 'No matching customers found' : 'No customers found in the system'}
//                 </div>
//               )}
//             </Modal.Body>
//             <Modal.Footer>
//               <Button variant="secondary" onClick={() => setShowCustomerModal(false)}>
//                 Cancel
//               </Button>
//             </Modal.Footer>
//           </Modal>
//         </>
//       ) : (
//         // ==================
//         // Invoice Preview UI
//         // ==================
//         <div className="invoice-preview-container">
//           {successMessage && (
//             <Alert 
//               variant="success" 
//               onClose={() => setSuccessMessage('')} 
//               dismissible
//               className="mb-4"
//             >
//               <i className="bi bi-check-circle-fill me-2"></i>
//               {successMessage}
//             </Alert>
//           )}
          
//           <div className="d-flex justify-content-between mb-4 p-2" style={{ 
//             backgroundColor: '#f8f9fa', 
//             borderRadius: '4px',
//             borderLeft: '4px solid #051937'
//           }}>
//             <div>
//               <Button 
//                 variant="outline-secondary" 
//                 onClick={handleBackToNewForm}
//                 className="d-flex align-items-center me-2"
//               >
//                 <i className="bi bi-arrow-left me-2"></i>Back
//               </Button>
//               <Button 
//                 variant="outline-primary" 
//                 onClick={handleBackToForm}
//                 className="d-flex align-items-center"
//               >
//                 <i className="bi bi-pencil-square me-2"></i>Edit
//               </Button>
//             </div>
//             <div>
//               <Button 
//                 variant="outline-primary" 
//                 className="me-2"
//                 onClick={handlePrintPreview}
//                 style={{ borderColor: '#051937', color: '#051937' }}
//               >
//                 <i className="bi bi-printer me-2"></i>Print
//               </Button>
//               <Button 
//                 variant="success"
//                 onClick={handleSaveAndDownload}
//                 disabled={isGeneratingPdf}
//                 style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', borderColor: '#051937' }}
//               >
//                 {isGeneratingPdf ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                     Generating PDF...
//                   </>
//                 ) : (
//                   <>
//                     <i className="bi bi-check-circle me-2"></i>Save
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
          
//           <div 
//             id="invoice-preview" 
//             className="invoice-document" 
//             ref={invoiceRef}
//             style={{
//               maxWidth: '850px',
//               margin: '0 auto',
//               padding: '20px',
//               backgroundColor: '#fff',
//               boxShadow: '0 0 10px rgba(0,0,0,0.1)',
//               border: '1px solid #ddd'
//             }}
//           >
//             {/* Header */}
//             <div style={{ 
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               background: 'white',
//               color: '#004d7a',
//               padding: '20px',
//               marginBottom: '30px',
//               borderBottom: '2px solid #004d7a',
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <img 
//                   src={logo} 
//                   alt="Company Logo" 
//                   style={{ height: '80px', backgroundColor: '#fff', padding: '5px', marginRight: '15px' }} 
//                 />
//                 <div>
//                   <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '18px' }}>Infopearl Tech Solutions Pvt Ltd</h2>
//                   <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>www.infopearl.in</p>
//                 </div>
//               </div>
//               <div style={{ marginRight: '50px' }}>
//                 <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>G1 Akansha Apartment</p>
//                 <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>Patel Nagar, City center</p>
//                 <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>7000937390</p>
//                 <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>infopearl396@gmail.com</p>
//               </div>
//             </div>

//             {/* Invoice & Customer Info */}
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
//               <div style={{ width: '40%' }}>
//                 <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#051937', textAlign: 'left' }}>BILL TO</h3>
//                 <p style={{ margin: '0 0 5px 0', textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>{formData.customerInfo.name || 'Customer Name'}</p>
//                 <p style={{ margin: '0 0 5px 0', textAlign: 'left' }}>{formData.customerInfo.address1 || 'Address'}</p>
//                 <p style={{ margin: '0 0 5px 0', textAlign: 'left' }}>{formData.customerInfo.town || 'Town/City'}</p>
//                 <p style={{ margin: '0 0 5px 0', textAlign: 'left' }}>{formData.customerInfo.country || 'Country'}</p>
//                 <p style={{ margin: '0 0 5px 0', textAlign: 'left' }}>{formData.customerInfo.phone || 'Phone'}</p>
//                 <p style={{ margin: '0 0 5px 0', textAlign: 'left' }}>{formData.customerInfo.email || 'Email'}</p>
//               </div>
//               <div style={{ width: '40%', textAlign: 'right' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                   <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#051937' }}>INVOICE #</h3>
//                   <p style={{ margin: '0', fontSize: '16px' }}>{formData.invoiceNumber}</p>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                   <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#051937' }}>CREATION DATE</h3>
//                   <p style={{ margin: '0', fontSize: '16px' }}>{formData.invoiceDate}</p>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#051937' }}>DUE DATE</h3>
//                   <p style={{ margin: '0', fontSize: '16px' }}>{formData.dueDate}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Items table */}
//             <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
//               <thead>
//                 <tr style={{ background: 'white', color: '#051937', border: '1px solid #051937' }}>
//                   <th style={{ padding: '10px', textAlign: 'left' }}>DESCRIPTION</th>
//                   <th style={{ padding: '10px', textAlign: 'center' }}>QTY</th>
//                   <th style={{ padding: '10px', textAlign: 'right' }}>PRICE</th>
//                   <th style={{ padding: '10px', textAlign: 'right' }}>AMOUNT</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.items.map((item, index) => (
//                   <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff', borderBottom: '1px solid #ddd' }}>
//                     <td style={{ padding: '10px', textAlign: 'left' }}>{item.description}</td>
//                     <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
//                     <td style={{ padding: '10px', textAlign: 'right' }}>₹{(parseFloat(item.price) || 0).toFixed(2)}</td>
//                     <td style={{ padding: '10px', textAlign: 'right' }}>₹{item.amount}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Totals & Sign */}
//             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//               <div style={{ width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                 <img 
//                   src={signature} 
//                   alt="Authorized Signature" 
//                   style={{ height: '60px', marginBottom: '10px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} 
//                 />
//                 <p style={{ margin: '0', borderTop: '1px solid #000', paddingTop: '5px', fontSize: '14px', fontWeight: 'bold', width: '200px', textAlign: 'center' }}>
//                   Authorized Signature
//                 </p>
//               </div>
              
//               <div style={{ width: '40%' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                   <p style={{ margin: '0', fontWeight: 'bold', color: '#051937' }}>SUBTOTAL</p>
//                   <p style={{ margin: '0' }}>₹{formData.subtotal}</p>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                   <p style={{ margin: '0', fontWeight: 'bold', color: '#051937' }}>CGST (9%)</p>
//                   <p style={{ margin: '0' }}>₹{formData.cgst}</p>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                   <p style={{ margin: '0', fontWeight: 'bold', color: '#051937' }}>SGST (9%)</p>
//                   <p style={{ margin: '0' }}>₹{formData.sgst}</p>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', color: '#051937', padding: '10px', fontWeight: 'bold', border: '1px solid #051937' }}>
//                   <p style={{ margin: '0' }}>TOTAL</p>
//                   <p style={{ margin: '0' }}>₹{formData.total}</p>
//                 </div>
//                 {formData.taxInclusive && (
//                   <div style={{ marginTop: '6px', fontSize: '12px', color: '#555', textAlign: 'right' }}>
//                     (Prices are tax-inclusive)
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Footer */}
//             <div style={{
//               borderTop: '2px solid #004d7a',
//               marginTop: '50px',
//               paddingTop: '18px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               gap: '24px',
//               flexWrap: 'wrap',
//             }}>
//               <div style={{ flex: 1, minWidth: '220px' }}>
//                 <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#004d7a' }}>CIN: U72100MP2025PTC074945 </div>
//                 <div style={{ fontSize: '0.98rem', color: '#222' }}>infopearl396@gmail.com</div>
//                 <div style={{ fontSize: '0.98rem', color: '#222' }}>G1 Akansha Apartment, Patel Nagar, City center</div>
//                 <div style={{ fontSize: '0.98rem', color: '#222' }}>Gwalior, M.P</div>
//               </div>
//               <div style={{ flex: 'none', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <QRCode value="https://www.infopearl.in" size={70} bgColor="#fff" fgColor="#004d7a" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default InvoiceCreate;




import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Button, Row, Col } from 'react-bootstrap';
import InvoiceCreate from '../invoices/InvoiceCreate.js';
import SalarySlipCreate from '../salaryslip/createSalarySlip.js';  // Replace with actual Salary Slip page import
import LetterCreate from '../letters/LetterCreate.js';  // Replace with actual Letters page import

const AdminPage = () => {
  const [key, setKey] = useState('invoices');  // Default tab is 'invoices'

  useEffect(() => {
    // You can add any data fetching or logic you need to initialize here
  }, []);

  return (
    <Container fluid style={{ marginTop: '30px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '36px', fontWeight: 'bold' }}>
        Admin Panel - Manage Documents
      </h1>

      <Tabs
        id="admin-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        style={{ marginBottom: '30px' }}
      >
        {/* Invoice Tab */}
        <Tab eventKey="invoices" title="Invoices">
          <InvoiceCreate />
        </Tab>

        {/* Salary Slip Tab */}
        <Tab eventKey="salaryslips" title="Salary Slips">
          <SalarySlipCreate />
        </Tab>

        {/* Letter Tab */}
        <Tab eventKey="letters" title="Letters">
          <LetterCreate />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminPage;

