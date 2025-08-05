# InfoPearl Contact System

This document describes the contact form system implementation for the InfoPearl website.

## Features

### Frontend Contact Form
- **Location**: `src/pages/Contact.js`
- **Features**:
  - Form validation for required fields
  - Email format validation
  - Loading states during submission
  - Success/error message display
  - Form reset after successful submission
  - Responsive design

### Backend API Endpoints

#### 1. Contact Form Submission
- **Endpoint**: `POST /backend/api/contact/submit.php`
- **Functionality**:
  - Validates form data
  - Saves message to database
  - Sends email notification to admin
  - Returns success/error response

#### 2. Contact Messages List (Admin)
- **Endpoint**: `GET /backend/api/contact/list.php`
- **Features**:
  - Pagination support
  - Status filtering (new, read, replied, archived)
  - Search functionality
  - Authentication required

#### 3. Update Message Status (Admin)
- **Endpoint**: `PUT /backend/api/contact/update-status.php`
- **Features**:
  - Update message status
  - Authentication required
  - Status validation

### Admin Dashboard
- **Location**: `src/admin/ContactMessages.js`
- **Features**:
  - View all contact messages
  - Filter by status
  - Search messages
  - Update message status
  - View message details in modal
  - Reply via email functionality
  - Responsive design

## Database Schema

### Contact Messages Table
```sql
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Status Values
- `new`: New message (default)
- `read`: Message has been read
- `replied`: Admin has replied
- `archived`: Message archived

## Email Notifications

When a contact form is submitted:
1. **Primary Email**: `infopearl396@gmail.com`
2. **CC Email**: `ceo@infopearl.in`
3. **Format**: HTML email with styled template
4. **Content**: All form fields, submission time, and contact details

## Setup Instructions

### 1. Database Setup
```bash
# Run the database setup script
php backend/setup-database.php
```

### 2. Database Configuration
Update `backend/config/database.php` with your PostgreSQL credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'infopearl_db');
define('DB_USER', 'postgres');
define('DB_PASS', 'your_password');
define('DB_PORT', '5432');
```

### 3. Email Configuration
The system uses PHP's `mail()` function. Ensure your server is configured to send emails.

### 4. Admin Access
- **URL**: `/admin/login`
- **Username**: `admin`
- **Password**: `info@123`

## API Usage Examples

### Submit Contact Form
```javascript
const response = await fetch('/backend/api/contact/submit.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    subject: 'Inquiry about services',
    message: 'I would like to know more about your services.'
  })
});
```

### Get Contact Messages (Admin)
```javascript
const response = await fetch('/backend/api/contact/list.php?page=1&limit=10&status=new', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Update Message Status (Admin)
```javascript
const response = await fetch('/backend/api/contact/update-status.php', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: 1,
    status: 'read'
  })
});
```

## File Structure

```
backend/
├── api/
│   └── contact/
│       ├── submit.php          # Contact form submission
│       ├── list.php            # Get messages (admin)
│       └── update-status.php   # Update status (admin)
├── includes/
│   ├── DatabaseClass.php       # Database connection class
│   ├── Auth.php               # Authentication class
│   └── Response.php           # API response helper
└── config/
    └── database.php           # Database configuration

src/
├── pages/
│   └── Contact.js             # Contact form page
└── admin/
    ├── ContactMessages.js     # Admin messages page
    └── ContactMessages.css    # Admin messages styling
```

## Security Features

1. **Input Validation**: All form inputs are validated
2. **Email Validation**: Email format is verified
3. **Authentication**: Admin endpoints require JWT token
4. **SQL Injection Protection**: Prepared statements used
5. **XSS Protection**: Input sanitization

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

2. **Email Not Sending**
   - Check server mail configuration
   - Verify SMTP settings
   - Check server logs

3. **Admin Login Issues**
   - Ensure admin user exists in database
   - Check JWT secret configuration
   - Verify token storage

### Debug Mode
Add error reporting to debug issues:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Future Enhancements

1. **Email Templates**: Customizable email templates
2. **Auto-Reply**: Automatic confirmation emails
3. **File Attachments**: Support for file uploads
4. **Spam Protection**: CAPTCHA integration
5. **Analytics**: Message statistics and reporting
6. **Bulk Actions**: Mass status updates
7. **Export**: Export messages to CSV/PDF

## Support

For technical support or questions about the contact system, please contact the development team. 