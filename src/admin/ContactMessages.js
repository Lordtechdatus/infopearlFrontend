// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import './ContactMessages.css';

// const ContactMessages = () => {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [pagination, setPagination] = useState({
//     current_page: 1,
//     total_pages: 1,
//     total_count: 0,
//     limit: 10
//   });
//   const [filters, setFilters] = useState({
//     status: 'all',
//     search: ''
//   });
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // const token = localStorage.getItem('adminToken');

//   useEffect(() => {
//     fetchMessages();
//   }, [pagination.current_page, filters]);
  
//   const fetchMessages = async () => {
//     try {
//       setLoading(true);
//       // const params = new URLSearchParams({
//       //   page: pagination.current_page,
//       //   limit: pagination.limit,
//       //   status: filters.status,
//       //   search: filters.search
//       // });

//       // const response = await fetch(`/backend/api/admin/showmessages.php?${params}`);
  
//       // const response = await fetch(`/backend/api/admin/showmessages.php?${params}`, {
//       //   headers: {
//       //     'Authorization': `Bearer ${token}`  // Include your token here for authentication
//       //   }
//       // });

//       const response = await fetch(`https://backend.infopearl.in/showmessages.php`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         // headers: {
//         //   'Authorization': `Bearer ${token}`,
//         // },
//       });

//       // const response = await fetch(`http://localhost:3000/backend/api/admin/showmessages.php?${params.toString()}`, {
//       //   method: 'GET',
//       //   headers: {
//       //         'Content-Type': 'application/json',
//       //       },
//       //   // headers: {
//       //   //   'Authorization': `Bearer ${token}`,
//       //   // },
//       // });
  
//       const result = await response.json();
  
//       if (response.ok) {
//         setMessages(result.data.messages);
//         setPagination(result.pagination);
//       } else {
//         setError(result.message || 'Failed to fetch messages');
//       }
//     } catch (error) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateMessageStatus = async (messageId, newStatus) => {
//     try {
//       const response = await fetch('/backend/api/contact/update-status.php', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           // 'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           id: messageId,
//           status: newStatus
//         })
//       });

//       const result = await response.json();

//       if (response.ok) {
//         // Update the message in the list
//         setMessages(prevMessages => 
//           prevMessages.map(msg => 
//             msg.id === messageId 
//               ? { ...msg, status: newStatus }
//               : msg
//           )
//         );
//       } else {
//         setError(result.message || 'Failed to update status');
//       }
//     } catch (error) {
//       setError('Network error. Please try again.');
//     }
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   };

//   const handlePageChange = (page) => {
//     setPagination(prev => ({ ...prev, current_page: page }));
//   };

//   const openMessageModal = (message) => {
//     setSelectedMessage(message);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedMessage(null);
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       new: { class: 'badge-new', text: 'New' },
//       read: { class: 'badge-read', text: 'Read' },
//       replied: { class: 'badge-replied', text: 'Replied' },
//       archived: { class: 'badge-archived', text: 'Archived' }
//     };

//     const config = statusConfig[status] || { class: 'badge-default', text: status };
//     return <span className={`status-badge ${config.class}`}>{config.text}</span>;
//   };

//   const fadeIn = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
//   };

//   return (
//     <div className="contact-messages-page">
//       <motion.div 
//         className="page-header"
//         initial="hidden"
//         animate="visible"
//         variants={fadeIn}
//       >
//         <h1 style={{ color: 'white' }}>Contact Messages</h1>
//         <p>Manage and respond to contact form submissions</p>
//       </motion.div>

//       <motion.div 
//         className="content-wrapper"
//         initial="hidden"
//         animate="visible"
//         variants={fadeIn}
//         transition={{ delay: 0.1 }}
//       >
//         {/* Filters */}
//         <div className="filters-section">
//           <div className="filter-group">
//             <label htmlFor="status-filter">Status:</label>
//             <select
//               id="status-filter"
//               value={filters.status}
//               onChange={(e) => handleFilterChange('status', e.target.value)}
//             >
//               <option value="all">All Messages</option>
//               <option value="new">New</option>
//               <option value="read">Read</option>
//               <option value="replied">Replied</option>
//               <option value="archived">Archived</option>
//             </select>
//           </div>

//           <div className="filter-group">
//             <label htmlFor="search-filter">Search:</label>
//             <input
//               type="text"
//               id="search-filter"
//               placeholder="Search by name, email, subject..."
//               value={filters.search}
//               onChange={(e) => handleFilterChange('search', e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="error-message">
//             <p>{error}</p>
//             <button onClick={() => setError('')}>×</button>
//           </div>
//         )}

//         {/* Messages Table */}
//         <div className="messages-table-container">
//           {loading ? (
//             <div className="loading-spinner">
//               <div className="spinner"></div>
//               <p>Loading messages...</p>
//             </div>
//           ) : (
//             <>
//               <div className="table-header">
//                 <div className="header-cell">Name</div>
//                 <div className="header-cell">Email</div>
//                 <div className="header-cell">Subject</div>
//                 <div className="header-cell">Date</div>
//                 <div className="header-cell">Status</div>
//                 <div className="header-cell">Actions</div>
//               </div>

//               <div className="table-body">
//                 {messages.length === 0 ? (
//                   <div className="no-messages">
//                     <p>No messages found</p>
//                   </div>
//                 ) : (
//                   messages.map((message) => (
//                     <motion.div
//                       key={message.id}
//                       className="table-row"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       <div className="cell name-cell">
//                         <strong>{message.name}</strong>
//                         {message.phone && <div className="phone">{message.phone}</div>}
//                       </div>
//                       <div className="cell email-cell">{message.email}</div>
//                       <div className="cell subject-cell">{message.subject}</div>
//                       <div className="cell date-cell">{message.formatted_date}</div>
//                       <div className="cell status-cell">
//                         {getStatusBadge(message.status)}
//                       </div>
//                       <div className="cell actions-cell">
//                         <button
//                           className="btn-view"
//                           onClick={() => openMessageModal(message)}
//                         >
//                           View
//                         </button>
//                         <div className="status-dropdown">
//                           <select
//                             value={message.status}
//                             onChange={(e) => updateMessageStatus(message.id, e.target.value)}
//                           >
//                             <option value="new">New</option>
//                             <option value="read">Read</option>
//                             <option value="replied">Replied</option>
//                             <option value="archived">Archived</option>
//                           </select>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))
//                 )}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Pagination */}
//         {pagination.total_pages > 1 && (
//           <div className="pagination">
//             <button
//               onClick={() => handlePageChange(pagination.current_page - 1)}
//               disabled={pagination.current_page === 1}
//               className="pagination-btn"
//             >
//               Previous
//             </button>
            
//             <span className="page-info">
//               Page {pagination.current_page} of {pagination.total_pages}
//               ({pagination.total_count} total messages)
//             </span>
            
//             <button
//               onClick={() => handlePageChange(pagination.current_page + 1)}
//               disabled={pagination.current_page === pagination.total_pages}
//               className="pagination-btn"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </motion.div>

//       {/* Message Modal */}
//       {showModal && selectedMessage && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <motion.div 
//             className="message-modal"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="modal-header">
//               <h2>Message Details</h2>
//               <button className="close-btn" onClick={closeModal}>×</button>
//             </div>
            
//             <div className="modal-content">
//               <div className="message-info">
//                 <div className="info-row">
//                   <label>From:</label>
//                   <span>{selectedMessage.name} ({selectedMessage.email})</span>
//                 </div>
//                 {selectedMessage.phone && (
//                   <div className="info-row">
//                     <label>Phone:</label>
//                     <span>{selectedMessage.phone}</span>
//                   </div>
//                 )}
//                 <div className="info-row">
//                   <label>Subject:</label>
//                   <span>{selectedMessage.subject}</span>
//                 </div>
//                 <div className="info-row">
//                   <label>Date:</label>
//                   <span>{selectedMessage.formatted_date}</span>
//                 </div>
//                 <div className="info-row">
//                   <label>Status:</label>
//                   <span>{getStatusBadge(selectedMessage.status)}</span>
//                 </div>
//               </div>
              
//               <div className="message-content">
//                 <label>Message:</label>
//                 <div className="message-text">{selectedMessage.message}</div>
//               </div>
//             </div>
            
//             <div className="modal-footer">
//               <button 
//                 className="btn-reply"
//                 onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
//               >
//                 Reply via Email
//               </button>
//               <button className="btn-close" onClick={closeModal}>
//                 Close
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ContactMessages; 




import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ContactMessages.css';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('contact'); // Track which tab is selected ('contact' or 'career')

  useEffect(() => {
    fetchMessages();
  }, [pagination.current_page, filters, selectedTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const url =
        selectedTab === 'contact'
          ? 'https://backend.infopearl.in/showmessages.php'
          : 'https://backend.infopearl.in/career-showmessages.php'; // Adjust API endpoint for Career

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setMessages(result.data.messages);
        setPagination(result.pagination);
      } else {
        setError(result.message || 'Failed to fetch messages');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const response = await fetch('/backend/api/contact/update-status.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: messageId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, status: newStatus } : msg
          )
        );
      } else {
        setError(result.message || 'Failed to update status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: 'badge-new', text: 'New' },
      read: { class: 'badge-read', text: 'Read' },
      replied: { class: 'badge-replied', text: 'Replied' },
      archived: { class: 'badge-archived', text: 'Archived' },
    };

    const config = statusConfig[status] || { class: 'badge-default', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="contact-messages-page">
      <motion.div className="page-header" initial="hidden" animate="visible" variants={fadeIn}>
        <h1 style={{ color: 'white' }}>
          {selectedTab === 'contact' ? 'Contact Messages' : 'Career Applications'}
        </h1>
        <p>Manage and respond to {selectedTab === 'contact' ? 'contact' : 'career'} form submissions</p>
      </motion.div>

      <motion.div
        className="content-wrapper"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.1 }}
      >
        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Messages</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter">Search:</label>
            <input
              type="text"
              id="search-filter"
              placeholder="Search by name, email, subject..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="tabs">
            <button
              onClick={() => setSelectedTab('contact')}
              className={selectedTab === 'contact' ? 'active' : ''}
            >
              Contact Messages
            </button>
            <button
              onClick={() => setSelectedTab('career')}
              className={selectedTab === 'career' ? 'active' : ''}
            >
              Career Applications
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Messages Table */}
        <div className="messages-table-container">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : (
            <>
              <div className="table-header">
                <div className="header-cell">Name</div>
                <div className="header-cell">Email</div>
                <div className="header-cell">Subject</div>
                <div className="header-cell">Date</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Actions</div>
              </div>

              <div className="table-body">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages found</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className="table-row"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="cell name-cell">
                        <strong>{message.name}</strong>
                      </div>
                      <div className="cell email-cell">{message.email}</div>
                      <div className="cell subject-cell">{message.subject}</div>
                      <div className="cell date-cell">{message.formatted_date}</div>
                      <div className="cell status-cell">{getStatusBadge(message.status)}</div>
                      <div className="cell actions-cell">
                        <button className="btn-view" onClick={() => openMessageModal(message)}>
                          View
                        </button>
                        <div className="status-dropdown">
                          <select
                            value={message.status}
                            onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="pagination-btn"
            >
              Previous
            </button>

            <span className="page-info">
              Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_count} total
              messages)
            </span>

            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>

      {/* Message Modal */}
      {showModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeModal}>
          <motion.div
            className="message-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Message Details</h2>
              <button onClick={closeModal} style={{ color: 'black', backgroundColor: 'white', border: 'none', fontSize: '30px'}}>×</button>
            </div>

            <div className="modal-content">
              <div className="message-info">
                <div className="info-row">
                  <label>From:</label>
                  <span>{selectedMessage.name} ({selectedMessage.email})</span>
                </div>
                <div className="info-row">
                  <label>Subject:</label>
                  <span>{selectedMessage.subject}</span>
                </div>
                <div className="info-row">
                  <label>Status:</label>
                  <span>{getStatusBadge(selectedMessage.status)}</span>
                </div>
                <div className="info-row">
                  <label>Message:</label>
                  <span>{getStatusBadge(selectedMessage.message)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-reply" onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}>
                Reply via Email
              </button>
              <button className="btn-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
