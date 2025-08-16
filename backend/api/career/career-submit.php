<?php
// career-submit.php
declare(strict_types=1);

require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Response.php';

// session_start();
// Uncomment the session check if needed
// if (empty($_SESSION['is_admin'])) {
//     http_response_code(403);
//     exit('Forbidden');
// }

$response = new Response();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $response->error('Invalid JSON data', 400);
    }
    
    // Validate required fields
    $required_fields = ['name', 'email', 'phone', 'position'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $response->error("Field '{$field}' is required", 400);
        }
    }

    if (!isset($_FILES['cv']) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK) {
        $response->error('CV file is required and must be uploaded correctly.', 400);
    }
    
    $name = trim($input['name']);
    $email = trim($input['email']);
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $subject = trim($input['position']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response->error('Invalid email format', 400);
}

// Process the CV file upload
// $cv_filename = null;
// $upload_dir = '../../uploads/cvs/';

// // Ensure the upload directory exists and is writable
// if (!is_dir($upload_dir)) {
//     mkdir($upload_dir, 0777, true);  // Create the directory if it doesn't exist
// }

// $cv_filename = uniqid('cv_') . basename($_FILES['cv']['name']);
// $upload_path = $upload_dir . $cv_filename;

// // Move the uploaded file to the desired location
// if (!move_uploaded_file($_FILES['cv']['tmp_name'], $upload_path)) {
//     $response->error('Failed to upload CV', 500);
// }

// Connect to the database
$db = new Database();
$conn = $db->getConnection();

if (!$conn) {
    $response->error('Database connection failed', 500);
}

// Insert into the database
try {
    $stmt = $conn->prepare("
        INSERT INTO career_applications (name, email, phone, position, cv_filename)
        VALUES (?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([$name, $email, $phone, $position, $cv_filename])) {
        // Get the last inserted ID (optional for email content)
        $application_id = $conn->lastInsertId();

        // Send email notification
        $email_sent = sendCareerEmail($name, $email, $phone, $position, $cv_filename);

        // Get the created message
        $get_stmt = $conn->prepare("SELECT * FROM career_applications WHERE id = ?");
        $get_stmt->execute([$application_id]);
        $career_application = $get_stmt->fetch();

        // Prepare response data
        $response_data = [
            'application_id' => $application_id,
            'email_sent' => $email_sent
        ];

        $response->success($response_data, 'Career application submitted successfully', 201);
    } else {
        $response->error('Failed to submit career application', 500);
    }
} catch (PDOException $e) {
    $response->error('Database error: ' . $e->getMessage(), 500);
}
}

$response->error('Method not allowed', 405);

// Send email function
function sendCareerEmail($name, $email, $phone, $position, $cv_filename) {
    $to = 'ratmelem@gmail.com'; // Your email address
    $cc = 'mayankratmele12abh@gmail.com';
    // $cc = 'ceo@infopearl.in'; // Additional email address (optional)

    $email_subject = "New Career Application - $position";

    $email_body = "
    <html>
    <head>
        <title>New Career Application</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #007bff; }
            .field-value { margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>New Career Application</h1>
                <p>InfoPearl Website Career Application</p>
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
                    <div class='field-label'>Position:</div>
                    <div class='field-value'>$position</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>CV Filename:</div>
                    <div class='field-value'>$cv_filename</div>
                </div>
            </div>
            <div class='footer'>
                <p>This message was sent from the InfoPearl website career application form.</p>
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
