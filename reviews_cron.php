<?php
// Secure token to prevent unauthorized billing access
$secret_token = "wyciekipro_secure_reviews_sync_2026";

if (!isset($_GET['token']) || $_GET['token'] !== $secret_token) {
    header('HTTP/1.0 403 Forbidden');
    echo "Access denied. Invalid or missing token.";
    exit;
}

$api_key = "AIzaSyDnrnQcwfKgludmpiiu755ws1kDSrP0Aeo";
$place_id = "ChIJEZzwPtWWggURY8DMltC8aKI";
$reviews_file = __DIR__ . "/data/reviews.json";

// Query Google Places API (New)
$url = "https://places.googleapis.com/v1/places/" . $place_id;

$options = [
    "http" => [
        "method" => "GET",
        "header" => "X-Goog-Api-Key: " . $api_key . "\r\n" .
                    "X-Goog-FieldMask: rating,userRatingCount,reviews\r\n" .
                    "Accept: application/json\r\n" .
                    "Content-Type: application/json\r\n"
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response === false) {
    header('HTTP/1.0 500 Internal Server Error');
    echo "Error querying Google Places API.";
    exit;
}

$data = json_decode($response, true);
if (!$data) {
    header('HTTP/1.0 500 Internal Server Error');
    echo "Error parsing Google response.";
    exit;
}

// Baseline structure
$existing_data = [
    "rating" => 5.0,
    "reviews_count" => 12,
    "google_maps_url" => "https://maps.google.com/?cid=11702811235791454307",
    "write_review_url" => "https://search.google.com/local/writereview?placeid=ChIJEZzwPtWWggURY8DMltC8aKI",
    "reviews" => []
];

// Load current reviews to merge
if (file_exists($reviews_file)) {
    $loaded = json_decode(file_get_contents($reviews_file), true);
    if ($loaded && is_array($loaded)) {
        $existing_data = array_merge($existing_data, $loaded);
    }
}

// Update rating and reviews_count
if (isset($data['rating'])) {
    $existing_data['rating'] = floatval($data['rating']);
}
if (isset($data['userRatingCount'])) {
    $existing_data['reviews_count'] = intval($data['userRatingCount']);
}

// Translate relative publishing dates
function translate_time($time_str) {
    $translations = [
        'a year ago' => 'rok temu',
        'years ago' => 'lata temu',
        'a month ago' => 'miesiąc temu',
        'months ago' => 'miesiące temu',
        'a week ago' => 'tydzień temu',
        'weeks ago' => 'tygodnie temu',
        'a day ago' => 'dzień temu',
        'days ago' => 'dni temu',
        'an hour ago' => 'godzinę temu',
        'hours ago' => 'godziny temu',
        'a minute ago' => 'minutę temu',
        'minutes ago' => 'minuty temu',
        'just now' => 'przed chwilą'
    ];
    
    $time_lower = strtolower(trim($time_str));
    if (isset($translations[$time_lower])) {
        return $translations[$time_lower];
    }
    
    $parts = explode(' ', $time_lower);
    if (count($parts) >= 3 && is_numeric($parts[0])) {
        $num = intval($parts[0]);
        $unit = $parts[1];
        
        $mapped_unit = 'temu';
        if (strpos($unit, 'year') !== false) {
            $mapped_unit = ($num >= 5 || $num === 0) ? 'lat temu' : 'lata temu';
        } else if (strpos($unit, 'month') !== false) {
            $mapped_unit = ($num >= 5 || $num === 0) ? 'miesięcy temu' : 'miesiące temu';
        } else if (strpos($unit, 'week') !== false) {
            $mapped_unit = ($num >= 5 || $num === 0) ? 'tygodni temu' : 'tygodnie temu';
        } else if (strpos($unit, 'day') !== false) {
            $mapped_unit = 'dni temu';
        } else if (strpos($unit, 'hour') !== false) {
            $mapped_unit = ($num >= 5 || $num === 0) ? 'godzin temu' : 'godziny temu';
        } else if (strpos($unit, 'minute') !== false) {
            $mapped_unit = ($num >= 5 || $num === 0) ? 'minut temu' : 'minuty temu';
        }
        return $num . " " . $mapped_unit;
    }
    return $time_str;
}

$google_reviews = isset($data['reviews']) ? $data['reviews'] : [];
if (count($google_reviews) > 0) {
    $updated_reviews = [];
    
    foreach ($google_reviews as $gr) {
        $author = isset($gr['authorAttribution']['displayName']) ? $gr['authorAttribution']['displayName'] : 'Klient';
        $rating = isset($gr['rating']) ? intval($gr['rating']) : 5;
        $text_val = isset($gr['text']['text']) ? $gr['text']['text'] : '';
        $avatar_img = isset($gr['authorAttribution']['photoUri']) ? $gr['authorAttribution']['photoUri'] : '';
        $rel_time = isset($gr['relativePublishTimeDescription']) ? $gr['relativePublishTimeDescription'] : 'niedawno';
        
        $date_pl = translate_time($rel_time);
        
        // Match existing to protect curated translations
        $matched = null;
        foreach ($existing_data['reviews'] as $r) {
            if ($r['author'] === $author) {
                $matched = $r;
                break;
            }
        }
        
        if ($matched) {
            $matched['rating'] = $rating;
            $matched['date']['pl'] = $date_pl;
            $matched['date']['en'] = $rel_time;
            if ($avatar_img) $matched['avatar_img'] = $avatar_img;
            $updated_reviews[] = $matched;
        } else {
            $new_rev = [
                "author" => $author,
                "rating" => $rating,
                "text" => [
                    "pl" => $text_val,
                    "en" => $text_val
                ],
                "avatar" => $author ? mb_substr($author, 0, 1, 'UTF-8') : 'U',
                "date" => [
                    "pl" => $date_pl,
                    "en" => $rel_time
                ]
            ];
            if ($avatar_img) $new_rev['avatar_img'] = $avatar_img;
            $updated_reviews[] = $new_rev;
        }
    }
    
    // Append remaining curated reviews
    foreach ($existing_data['reviews'] as $r) {
        $already_added = false;
        foreach ($updated_reviews as $ur) {
            if ($ur['author'] === $r['author']) {
                $already_added = true;
                break;
            }
        }
        if (!$already_added && count($updated_reviews) < 6) {
            $updated_reviews[] = $r;
        }
    }
    
    $existing_data['reviews'] = $updated_reviews;
}

// Save merged json and js files
if (!file_exists(dirname($reviews_file))) {
    mkdir(dirname($reviews_file), 0755, true);
}
file_put_contents($reviews_file, json_encode($existing_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

$reviews_js = dirname($reviews_file) . "/reviews.js";
file_put_contents($reviews_js, "window.reviewsData = " . json_encode($existing_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";", LOCK_EX);

echo "Success! Reviews synchronized at " . date("Y-m-d H:i:s");
?>
