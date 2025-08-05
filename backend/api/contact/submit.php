<?php
require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Response.php';

$response = new Response();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $response->error('Invalid JSON data', 400);
    }
    
    // Validate required fields
    $required_fields = ['name', 'email', 'subject', 'message'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $response->error("Field '{$field}' is required", 400);
        }
    }
    
    $name = trim($input['name']);
    $email = trim($input['email']);
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $subject = trim($input['subject']);
    $message = trim($input['message']);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response->error('Invalid email format', 400);
    }
    
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        $response->error('Database connection failed', 500);
    }
    
    try {
        // Insert contact message into database
        $stmt = $conn->prepare("
            INSERT INTO contact_messages (name, email, phone, subject, message) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([$name, $email, $phone, $subject, $message])) {
            $message_id = $conn->lastInsertId();
            
            // Send email notification
            $email_sent = sendContactEmail($name, $email, $phone, $subject, $message);
            
            // Get the created message
            $get_stmt = $conn->prepare("SELECT * FROM contact_messages WHERE id = ?");
            $get_stmt->execute([$message_id]);
            $contact_message = $get_stmt->fetch();
            
            $response_data = [
                'message' => $contact_message,
                'email_sent' => $email_sent
            ];
            
            $response->success($response_data, 'Contact message submitted successfully', 201);
        } else {
            $response->error('Failed to submit contact message', 500);
        }
    } catch (PDOException $e) {
        $response->error('Database error: ' . $e->getMessage(), 500);
    }
}

$response->error('Method not allowed', 405);

function sendContactEmail($name, $email, $phone, $subject, $message) {
    $to = 'infopearl396@gmail.com'; // Your email address
    $cc = 'ceo@infopearl.in'; // Additional email address
    
    $email_subject = "New Contact Form Submission - $subject";
    
    $email_body = "
    <html>
    <head>
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #007bff; }
            .field-value { margin-top: 5px; }
            .message-box { background-color: white; padding: 15px; border-left: 4px solid #007bff; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>New Contact Form Submission</h1>
                <p>InfoPearl Website Contact Form</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='field-label'>Name:</div>
                    <div class='field-value'>$name</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>Email:</div>
                    <div class='field-value'>$email</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>Phone:</div>
                    <div class='field-value'>" . ($phone ? $phone : 'Not provided') . "</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>Subject:</div>
                    <div class='field-value'>$subject</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>Message:</div>
                    <div class='message-box'>$message</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>Submission Time:</div>
                    <div class='field-value'>" . date('Y-m-d H:i:s') . "</div>
                </div>
            </div>
            <div class='footer'>
                <p>This message was sent from the InfoPearl website contact form.</p>
                <p>Please respond to the sender at: $email</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: InfoPearl Website <noreply@infopearl.in>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion()
    );
    
    if ($cc) {
        $headers[] = 'Cc: ' . $cc;
    }
    
    // Send email
    $mail_sent = mail($to, $email_subject, $email_body, implode("\r\n", $headers));
    
    return $mail_sent;
}
?> 