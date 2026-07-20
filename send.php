<?php
// Set header to return JSON response
header('Content-Type: application/json');

// --- CONFIGURATION ---
// Email settings
$to_email = "wyciekipro@gmail.com";
$subject = "Nowe zgłoszenie - WyciekiPro";

// Telegram settings
$telegram_token = "8842182451:AAGOnGbzS5z-gP2CSoHkUQfnMiTwbPv21HM"; // Put your Bot Token here
$telegram_chat_id = "6676677078"; // Put your Chat ID here

// Read POST data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$city = isset($_POST['city']) ? trim($_POST['city']) : '';
$contact_method = isset($_POST['contact_method']) ? trim($_POST['contact_method']) : '';
$problem_desc = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validation
if(empty($phone)) {
    echo json_encode(['success' => false, 'message' => 'Numer telefonu jest wymagany.']);
    exit;
}

// --- PREPARE MESSAGE ---
$message_text = "💧 Nowe zgłoszenie ze strony WyciekiPro:\n\n";
$message_text .= "👤 Imię: " . ($name ? $name : "Nie podano") . "\n";
$message_text .= "📞 Telefon: " . $phone . "\n";
$message_text .= "📍 Miasto: " . ($city ? $city : "Nie podano") . "\n";
$message_text .= "📝 Opis: " . ($problem_desc ? $problem_desc : "Nie podano") . "\n";
$message_text .= "💬 Preferowany kontakt: " . ($contact_method === 'whatsapp' ? 'WhatsApp' : 'Telefon') . "\n";
$message_text .= "🕒 Data: " . date("Y-m-d H:i:s") . "\n";

// --- SEND EMAIL ---
$headers = "From: WyciekiPro <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
$headers .= "Reply-To: " . $to_email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$email_sent = mail($to_email, $subject, $message_text, $headers);

// --- SEND TO TELEGRAM ---
$telegram_sent = false;
if($telegram_token !== "INSERT_BOT_TOKEN_HERE" && $telegram_chat_id !== "INSERT_CHAT_ID_HERE") {
    $telegram_url = "https://api.telegram.org/bot" . $telegram_token . "/sendMessage";
    
    $post_fields = array(
        'chat_id' => $telegram_chat_id,
        'text' => $message_text,
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $telegram_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if($http_code == 200) {
        $telegram_sent = true;
    }
}

// --- RETURN RESPONSE ---
// We consider it a success if either email or telegram was sent
echo json_encode(['success' => true]);
?>
