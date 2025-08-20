import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import './ContactMessages.css';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,   // server-provided; UI will compute derived values instead
    total_count: 0,   // server-provided; UI will compute derived values instead
    limit: 10,
  });
  const [filters, setFilters] = useState({
    search: '',
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('contact'); // 'contact' | 'career'

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, selectedTab]);

  const listEndpoint =
    selectedTab === 'contact'
      ? 'https://backend.infopearl.in/showmessages.php'
      : 'https://backend.infopearl.in/career-showmessages.php';

  // Delete endpoints
  const deleteEndpoint =
    selectedTab === 'contact'
      ? 'https://backend.infopearl.in/contact-delete.php'
      : 'https://backend.infopearl.in/career-delete.php';

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(listEndpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        setMessages(result?.data?.messages || []);
        // Keep server pagination for compatibility, but UI will compute client totals
        setPagination((prev) => ({
          ...prev,
          total_pages: result?.pagination?.total_pages ?? 1,
          total_count: result?.pagination?.total_count ?? (result?.data?.messages?.length ?? 0),
          limit: result?.pagination?.limit ?? prev.limit,
        }));
      } else {
        setError(result?.message || 'Failed to fetch messages');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search (name/email) + client-side pagination over fetched messages
  const normalize = (s = '') => String(s).toLowerCase();
  const filteredMessages = useMemo(() => {
    const q = normalize(filters.search);
    if (!q) return messages;
    return messages.filter((m) => {
      const name = normalize(m.name);
      const email = normalize(m.email);
      return name.includes(q) || email.includes(q);
    });
  }, [messages, filters.search]);

  // Derived pagination (client side)
  const pageLimit = pagination.limit || 10;
  const totalCount = filteredMessages.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageLimit));
  const currentPage = Math.min(pagination.current_page, totalPages);
  const start = (currentPage - 1) * pageLimit;
  const pagedMessages = filteredMessages.slice(start, start + pageLimit);

  const deleteMessage = async (messageId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
    if (!confirmDelete) return;

    // Optimistic UI
    const prevMessages = messages;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    try {
      setError('');
      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result?.message || 'Failed to delete entry');
        setMessages(prevMessages); // revert on failure
        return;
      }

      // Re-sync list (counts, etc.)
      await fetchMessages();
    } catch {
      setMessages(prevMessages);
      setError('Network error. Please try again.');
    }
  };

  const handleFilterChange = (value) => {
    setFilters({ search: value });
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setPagination((prev) => ({ ...prev, current_page: clamped }));
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  // Status badge kept for modal display (optional)
  const getStatusBadge = (status) => {
    const statusConfigContact = {
      new: { class: 'badge-new', text: 'New' },
      read: { class: 'badge-read', text: 'Read' },
      replied: { class: 'badge-replied', text: 'Replied' },
      archived: { class: 'badge-archived', text: 'Archived' },
    };
    const statusConfigCareer = {
      new: { class: 'badge-new', text: 'New' },
      interviewing: { class: 'badge-read', text: 'Interviewing' },
      hired: { class: 'badge-replied', text: 'Hired' },
      rejected: { class: 'badge-archived', text: 'Rejected' },
    };
    const map = selectedTab === 'contact' ? statusConfigContact : statusConfigCareer;
    const config = map[status] || { class: 'badge-default', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // Headers: add ID first, remove Status
  const renderTableHeaders = () => {
    if (selectedTab === 'career') {
      return (
        <div className="table-header">
          <div className="header-cell">ID</div>
          <div className="header-cell">Name</div>
          <div className="header-cell">Email</div>
          <div className="header-cell">Position</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Actions</div>
        </div>
      );
    }
    return (
      <div className="table-header">
        <div className="header-cell">ID</div>
        <div className="header-cell">Name</div>
        <div className="header-cell">Email</div>
        <div className="header-cell">Subject</div>
        <div className="header-cell">Date</div>
        <div className="header-cell">Actions</div>
      </div>
    );
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Helpers for career modal actions
  const getCvDownloadUrl = (filename) =>
    `https://backend.infopearl.in/uploads/cv/${encodeURIComponent(filename)}`; // <-- adjust path if needed

  const downloadCv = (filename) => {
    if (!filename) {
      setError('No CV found to download.');
      return;
    }
    const url = getCvDownloadUrl(filename);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openGmailCompose = (email, subject = '') => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}${
      subject ? `&su=${encodeURIComponent(subject)}` : ''
    }`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
          {/* Removed Status dropdown as requested */}

          <div className="filter-group">
            <label htmlFor="search-filter">Search:</label>
            <input
              type="text"
              id="search-filter"
              placeholder={
                selectedTab === 'contact'
                  ? 'Search by name or email...'
                  : 'Search by name or email...'
              }
              value={filters.search}
              onChange={(e) => handleFilterChange(e.target.value)}
            />
          </div>

          <div className="tabs">
            <button
              onClick={() => {
                setSelectedTab('contact');
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className={selectedTab === 'contact' ? 'active' : ''}
            >
              Contact Messages
            </button>
            <button
              onClick={() => {
                setSelectedTab('career');
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
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
              {renderTableHeaders()}

              <div className="table-body">
                {pagedMessages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages found</p>
                  </div>
                ) : (
                  pagedMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      className="table-row"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="cell id-cell">
                        <strong>{message.id}</strong>
                      </div>

                      <div className="cell name-cell">
                        <strong>{message.name}</strong>
                      </div>

                      <div className="cell email-cell">{message.email}</div>

                      {selectedTab === 'contact' ? (
                        <div className="cell subject-cell">{message.subject}</div>
                      ) : (
                        <div className="cell subject-cell">{message.position}</div>
                      )}

                      <div className="cell date-cell">{message.formatted_date}</div>

                      {/* ACTIONS: view (eye icon) + delete (dustbin) */}
                      <div className="cell actions-cell">
                        <button className="btn-view" onClick={() => openMessageModal(message)} title="View">
                          <i className="fas fa-eye" style={{ marginRight: 6 }}></i>
                          View
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => deleteMessage(message.id)}
                          title="Delete"
                          aria-label={`Delete message from ${message.name}`}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Pagination (client-side derived) */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages} ({totalCount} total messages)
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
              <h2>Details</h2>

              {/* Contact: keep close button; Career: remove it */}
                <button
                  onClick={closeModal}
                  style={{ color: 'black', backgroundColor: 'white', border: 'none', fontSize: '30px' }}
                >
                  ×
                </button>
            </div>

            <div className="modal-content">
              <div className="message-info">
                {selectedTab === 'contact' ? (
                  <>
                    <div className="info-row">
                      <label>From:</label>
                      <span>
                        {selectedMessage.name} ({selectedMessage.email})
                      </span>
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
                      <span>{selectedMessage.message}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-row">
                      <label>Email:</label>
                      <span>{selectedMessage.email}</span>
                    </div>
                    <div className="info-row">
                      <label>Phone:</label>
                      <span>{selectedMessage.phone || '—'}</span>
                    </div>
                    <div className="info-row">
                      <label>Position:</label>
                      <span>{selectedMessage.position || '—'}</span>
                    </div>
                    <div className="info-row">
                      <label>Status:</label>
                      <span>{getStatusBadge(selectedMessage.status)}</span>
                    </div>
                    <div className="info-row">
                      <label>CV:</label>
                      <span>{selectedMessage.cv_filename || '—'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {selectedTab === 'contact' ? (
                <>
                  <button
                    className="btn-reply"
                    onClick={() =>
                      openGmailCompose(
                        selectedMessage.email,
                        selectedMessage.position
                          ? `Regarding your application for ${selectedMessage.position}`
                            : `Regarding your application about ${selectedMessage.subject}`
                      )
                    }
                  >
                    Reply via Email
                  </button>
                  {/* <button className="btn-close" onClick={closeModal}>
                    Close
                  </button> */}
                  <button onClick={closeModal} className="button" style={{ backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', flex: 1, padding: '10px 20px', fontWeight: 'bold' }}>
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-download"
                    onClick={() => downloadCv(selectedMessage.cv_filename)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="btn-reply"
                    onClick={() =>
                      openGmailCompose(
                        selectedMessage.email,
                        selectedMessage.position
                          ? `Regarding your application for ${selectedMessage.position}`
                          : 'Regarding your application'
                      )
                    }
                  >
                    Reply via Email
                  </button>
                  {/* No explicit Close button; click outside the modal to close */}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
