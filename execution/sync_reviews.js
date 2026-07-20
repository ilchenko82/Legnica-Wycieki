const fs = require('fs');
const path = require('path');
const https = require('https');

// --- PATH CONFIGURATION ---
const PROJECT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(PROJECT_DIR, '.env');
const REVIEWS_JSON = path.join(PROJECT_DIR, 'data', 'reviews.json');

// Reads environment variables manually
function loadEnv() {
    const envVars = {};
    if (fs.existsSync(ENV_FILE)) {
        const lines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#') && line.includes('=')) {
                const idx = line.indexOf('=');
                const key = line.substring(0, idx).trim();
                const val = line.substring(idx + 1).trim();
                envVars[key] = val;
            }
        });
    }
    return envVars;
}

// Translates relative publish time bi-directionally between Polish and English
function translateRelativeTime(timeStr, targetLang = 'pl') {
    const timeLower = timeStr.toLowerCase().trim();
    
    // Check if input is in Polish
    const isPolish = timeLower.includes('temu') || timeLower.includes('chwilą') || timeLower.includes('tydzień') || timeLower.includes('miesiąc') || timeLower.includes('rok');
    
    if (isPolish) {
        if (targetLang === 'pl') {
            return timeStr; // Already in Polish
        }
        
        // Translate Polish to English
        const plToEn = {
            'rok temu': 'a year ago',
            'miesiąc temu': 'a month ago',
            'tydzień temu': 'a week ago',
            'dzień temu': 'a day ago',
            'godzinę temu': 'an hour ago',
            'minutę temu': 'a minute ago',
            'przed chwilą': 'just now'
        };
        
        if (plToEn[timeLower]) return plToEn[timeLower];
        
        try {
            const parts = timeLower.split(' ');
            if (parts.length >= 3 && !isNaN(parts[0])) {
                const num = parseInt(parts[0], 10);
                const unit = parts[1];
                let mappedUnit = 'ago';
                if (unit.includes('tygod')) mappedUnit = 'weeks ago';
                else if (unit.includes('miesiąc') || unit.includes('miesiec')) mappedUnit = 'months ago';
                else if (unit.includes('dni') || unit.includes('dnia')) mappedUnit = 'days ago';
                else if (unit.includes('lat') || unit.includes('lata')) mappedUnit = 'years ago';
                else if (unit.includes('godzin')) mappedUnit = 'hours ago';
                else if (unit.includes('minut')) mappedUnit = 'minutes ago';
                
                return `${num} ${mappedUnit}`;
            }
        } catch (e) {}
        return timeStr;
    } else {
        // Input is in English (or fallback)
        if (targetLang === 'en') {
            return timeStr; // Already in English
        }
        
        // Translate English to Polish
        const enToPl = {
            'a year ago': 'rok temu',
            'years ago': 'lata temu',
            'a month ago': 'miesiąc temu',
            'months ago': 'miesiące temu',
            'a week ago': 'tydzień temu',
            'weeks ago': 'tygodnie temu',
            'a day ago': 'dzień temu',
            'days ago': 'dni temu',
            'an hour ago': 'godzinę temu',
            'hours ago': 'godziny temu',
            'a minute ago': 'minutę temu',
            'minutes ago': 'minuty temu',
            'just now': 'przed chwilą'
        };
        
        if (enToPl[timeLower]) return enToPl[timeLower];
        
        try {
            const parts = timeLower.split(' ');
            if (parts.length >= 3 && !isNaN(parts[0])) {
                const num = parseInt(parts[0], 10);
                const unit = parts[1];
                let mappedUnit = 'temu';
                if (unit.includes('year')) mappedUnit = (num >= 5 || num === 0) ? 'lat temu' : 'lata temu';
                else if (unit.includes('month')) mappedUnit = (num >= 5 || num === 0) ? 'miesięcy temu' : 'miesiące temu';
                else if (unit.includes('week')) mappedUnit = (num >= 5 || num === 0) ? 'tygodni temu' : 'tygodnie temu';
                else if (unit.includes('day')) mappedUnit = 'dni temu';
                else if (unit.includes('hour')) mappedUnit = (num >= 5 || num === 0) ? 'godzin temu' : 'godziny temu';
                else if (unit.includes('minute')) mappedUnit = (num >= 5 || num === 0) ? 'minut temu' : 'minuty temu';
                
                return `${num} ${mappedUnit}`;
            }
        } catch (e) {}
        return timeStr;
    }
}

function main() {
    console.log('[Sync] Initializing Google Reviews Node synchronizer...');
    const env = loadEnv();

    const apiKey = env.GOOGLE_PLACES_API_KEY;
    const placeId = env.GOOGLE_PLACE_ID;
    const mapsUrl = env.GOOGLE_MAPS_URL;
    const writeReviewUrl = env.GOOGLE_WRITE_REVIEW_URL;

    // Load existing reviews data as baseline
    const existingData = {
        rating: 5.0,
        reviews_count: 12,
        google_maps_url: mapsUrl || "https://maps.google.com/?cid=18151900155099238804",
        write_review_url: writeReviewUrl || "https://search.google.com/local/writereview?placeid=ChIJ-Tq9m4HPG0cRpEvz86lR4fw",
        reviews: []
    };

    if (fs.existsSync(REVIEWS_JSON)) {
        try {
            const loaded = JSON.parse(fs.readFileSync(REVIEWS_JSON, 'utf-8'));
            if (loaded && typeof loaded === 'object') {
                Object.assign(existingData, loaded);
                console.log('[Sync] Existing reviews data loaded successfully.');
            }
        } catch (e) {
            console.log(`[Sync] Warning: Could not parse existing reviews.json: ${e.message}`);
        }
    }

    // Always update links from .env
    if (mapsUrl) existingData.google_maps_url = mapsUrl;
    if (writeReviewUrl) existingData.write_review_url = writeReviewUrl;

    if (apiKey && placeId && apiKey !== 'YOUR_GOOGLE_CLOUD_API_KEY' && placeId !== 'YOUR_GOOGLE_PLACE_ID') {
        console.log(`[Sync] Querying Google Places API (New) for Place ID: ${placeId}...`);

        const postOptions = {
            hostname: 'places.googleapis.com',
            port: 443,
            path: `/v1/places/${placeId}`,
            method: 'GET',
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Accept-Language': 'pl'
            }
        };

        const req = https.request(postOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data.rating) existingData.rating = parseFloat(data.rating);
                    if (data.userRatingCount) existingData.reviews_count = parseInt(data.userRatingCount, 10);

                    console.log(`[Sync] Success! Rating updated to ${existingData.rating} (${existingData.reviews_count} reviews)`);

                    const googleReviews = data.reviews || [];
                    if (googleReviews.length > 0) {
                        const updatedReviews = [];

                        googleReviews.forEach(gr => {
                            const author = gr.authorAttribution ? gr.authorAttribution.displayName : 'Klient';
                            const rating = parseInt(gr.rating || 5, 10);
                            const textVal = gr.text ? gr.text.text : '';
                            const avatarImg = gr.authorAttribution ? gr.authorAttribution.photoUri : '';
                            const relTime = gr.relativePublishTimeDescription || 'niedawno';

                            const datePl = translateRelativeTime(relTime, 'pl');
                            const dateEn = translateRelativeTime(relTime, 'en');

                            // Find match in current database to protect hand-curated translations
                            const matched = existingData.reviews.find(r => r.author === author);

                            if (matched) {
                                matched.rating = rating;
                                matched.date = { pl: datePl, en: dateEn };
                                if (avatarImg) matched.avatar_img = avatarImg;
                                updatedReviews.push(matched);
                                console.log(`[Sync] Merged/Updated curated review from: ${author}`);
                            } else {
                                const newRev = {
                                    author: author,
                                    rating: rating,
                                    text: {
                                        pl: textVal,
                                        en: textVal
                                    },
                                    avatar: author ? author[0] : 'U',
                                    date: {
                                        pl: datePl,
                                        en: dateEn
                                    }
                                };
                                if (avatarImg) newRev.avatar_img = avatarImg;
                                updatedReviews.push(newRev);
                                console.log(`[Sync] Added new review from Google: ${author}`);
                            }
                        });

                        // Append other curated reviews that weren't in the Google API's latest feed
                        existingData.reviews.forEach(r => {
                            if (!updatedReviews.find(ur => ur.author === r.author) && updatedReviews.length < 6) {
                                updatedReviews.push(r);
                            }
                        });

                        existingData.reviews = updatedReviews;
                    }

                    writeBack(existingData);

                } catch (err) {
                    console.error('[Sync] Error parsing Google response:', err.message);
                    console.log('Raw response was:', body);
                    writeBack(existingData); // fallback write
                }
            });
        });

        req.on('error', (e) => {
            console.error(`[Sync] API HTTP request error: ${e.message}`);
            writeBack(existingData);
        });

        req.end();

    } else {
        console.log('[Sync] No Place ID or API Key configured in .env. Skipping HTTP request.');
        writeBack(existingData);
    }
}

function writeBack(data) {
    try {
        const dataDir = path.dirname(REVIEWS_JSON);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        // Save reviews.json
        fs.writeFileSync(REVIEWS_JSON, JSON.stringify(data, null, 2), 'utf-8');
        
        // Save reviews.js
        const REVIEWS_JS = path.join(dataDir, 'reviews.js');
        fs.writeFileSync(REVIEWS_JS, `window.reviewsData = ${JSON.stringify(data, null, 2)};`, 'utf-8');
        
        console.log(`[Sync] Complete! Written to reviews.json and reviews.js`);
    } catch (e) {
        console.error('[Sync] Error writing reviews files:', e.message);
    }
}

main();
