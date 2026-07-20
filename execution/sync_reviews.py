import os
import json
import urllib.request
import urllib.error

# --- PATH CONFIGURATION ---
PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_FILE = os.path.join(PROJECT_DIR, '.env')
REVIEWS_JSON = os.path.join(PROJECT_DIR, 'data', 'reviews.json')

def load_env():
    """Reads environment variables from .env file manually to avoid external dependencies."""
    env_vars = {}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars

def translate_relative_time(time_str, target_lang='pl'):
    time_str_lower = time_str.lower().strip()
    
    # Check if input is in Polish
    is_polish = 'temu' in time_str_lower or 'chwilą' in time_str_lower or 'tydzień' in time_str_lower or 'miesiąc' in time_str_lower or 'rok' in time_str_lower
    
    if is_polish:
        if target_lang == 'pl':
            return time_str
            
        pl_to_en = {
            'rok temu': 'a year ago',
            'miesiąc temu': 'a month ago',
            'tydzień temu': 'a week ago',
            'dzień temu': 'a day ago',
            'godzinę temu': 'an hour ago',
            'minutę temu': 'a minute ago',
            'przed chwilą': 'just now'
        }
        
        if time_str_lower in pl_to_en:
            return pl_to_en[time_str_lower]
            
        try:
            parts = time_str_lower.split()
            if len(parts) >= 3 and parts[0].isdigit():
                num = parts[0]
                unit = parts[1]
                mapped_unit = 'ago'
                if 'tygod' in unit: mapped_unit = 'weeks ago'
                elif 'miesiąc' in unit or 'miesiec' in unit: mapped_unit = 'months ago'
                elif 'dni' in unit or 'dnia' in unit: mapped_unit = 'days ago'
                elif 'lat' in unit or 'lata' in unit: mapped_unit = 'years ago'
                elif 'godzin' in unit: mapped_unit = 'hours ago'
                elif 'minut' in unit: mapped_unit = 'minutes ago'
                
                return f"{num} {mapped_unit}"
        except Exception:
            pass
        return time_str
    else:
        # Input is in English
        if target_lang == 'en':
            return time_str
            
        en_to_pl = {
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
        }
        
        if time_str_lower in en_to_pl:
            return en_to_pl[time_str_lower]
            
        try:
            parts = time_str_lower.split()
            if len(parts) >= 3 and parts[0].isdigit():
                num = parts[0]
                unit = parts[1]
                
                if 'year' in unit:
                    mapped_unit = 'lat temu' if int(num) >= 5 or int(num) == 0 else 'lata temu'
                elif 'month' in unit:
                    mapped_unit = 'miesięcy temu' if int(num) >= 5 or int(num) == 0 else 'miesiące temu'
                elif 'week' in unit:
                    mapped_unit = 'tygodni temu' if int(num) >= 5 or int(num) == 0 else 'tygodnie temu'
                elif 'day' in unit:
                    mapped_unit = 'dni temu'
                elif 'hour' in unit:
                    mapped_unit = 'godzin temu' if int(num) >= 5 or int(num) == 0 else 'godziny temu'
                elif 'minute' in unit:
                    mapped_unit = 'minut temu' if int(num) >= 5 or int(num) == 0 else 'minuty temu'
                else:
                    mapped_unit = 'temu'
                    
                return f"{num} {mapped_unit}"
        except Exception:
            pass
        return time_str

def main():
    print("[Sync] Initializing Google Reviews synchronizer...")
    env_vars = load_env()
    
    api_key = env_vars.get('GOOGLE_PLACES_API_KEY')
    place_id = env_vars.get('GOOGLE_PLACE_ID')
    maps_url = env_vars.get('GOOGLE_MAPS_URL')
    write_review_url = env_vars.get('GOOGLE_WRITE_REVIEW_URL')
    
    # Load existing reviews if they exist to protect manual curation/translations
    existing_data = {
        "rating": 5.0,
        "reviews_count": 12,
        "google_maps_url": maps_url or "https://maps.google.com/?cid=18151900155099238804",
        "write_review_url": write_review_url or "https://search.google.com/local/writereview?placeid=ChIJ-Tq9m4HPG0cRpEvz86lR4fw",
        "reviews": []
    }
    
    if os.path.exists(REVIEWS_JSON):
        try:
            with open(REVIEWS_JSON, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
                if isinstance(loaded, dict):
                    existing_data.update(loaded)
                    print("[Sync] Existing reviews data loaded successfully.")
        except Exception as e:
            print(f"[Sync] Warning: Could not parse existing reviews.json: {e}")
            
    # Always update profile URLs from .env if provided
    if maps_url:
        existing_data["google_maps_url"] = maps_url
    if write_review_url:
        existing_data["write_review_url"] = write_review_url

    # Check if we can do an automated Google Places API sync
    if api_key and place_id and api_key != "YOUR_GOOGLE_CLOUD_API_KEY" and place_id != "YOUR_GOOGLE_PLACE_ID":
        print(f"[Sync] Attempting live Google Places API sync for Place ID: {place_id}...")
        
        # Google Places API (New) Details URL
        url = f"https://places.googleapis.com/v1/places/{place_id}"
        
        # Fields to request
        fields = "rating,userRatingCount,reviews"
        
        # Headers
        headers = {
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": fields,
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Accept-Language": "pl"
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                
                # Fetch rating and review counts
                if 'rating' in res_data:
                    existing_data["rating"] = float(res_data['rating'])
                if 'userRatingCount' in res_data:
                    existing_data["reviews_count"] = int(res_data['userRatingCount'])
                    
                print(f"[Sync] Success! Rating updated to {existing_data['rating']} ({existing_data['reviews_count']} reviews)")
                
                # Format and merge reviews if available
                google_reviews = res_data.get('reviews', [])
                if google_reviews:
                    updated_reviews = []
                    
                    for gr in google_reviews:
                        author = gr.get('authorAttribution', {}).get('displayName', 'Klient')
                        rating = int(gr.get('rating', 5))
                        text_val = gr.get('text', {}).get('text', '')
                        avatar_img = gr.get('authorAttribution', {}).get('photoUri', '')
                        rel_time = gr.get('relativePublishTimeDescription', 'niedawno')
                        
                        # Translate dates
                        date_pl = translate_relative_time(rel_time, 'pl')
                        date_en = translate_relative_time(rel_time, 'en')
                        
                        # Look for existing review by the same author to protect manually curated translations
                        matched_existing = None
                        for r in existing_data.get('reviews', []):
                            if r.get('author') == author:
                                matched_existing = r
                                break
                                
                        if matched_existing:
                            # Update details but preserve manually curated/translated texts if available
                            matched_existing['rating'] = rating
                            matched_existing['date'] = {
                                "pl": date_pl,
                                "en": date_en
                            }
                            if avatar_img:
                                matched_existing['avatar_img'] = avatar_img
                            updated_reviews.append(matched_existing)
                            print(f"[Sync] Merged/Updated existing review from: {author}")
                        else:
                            # Create new review
                            new_rev = {
                                "author": author,
                                "rating": rating,
                                "text": {
                                    "pl": text_val,
                                    "en": text_val # Fallback both to same text
                                },
                                "avatar": author[0] if author else "U",
                                "date": {
                                    "pl": date_pl,
                                    "en": date_en
                                }
                            }
                            if avatar_img:
                                new_rev['avatar_img'] = avatar_img
                            updated_reviews.append(new_rev)
                            print(f"[Sync] Added new review from Google: {author}")
                            
                    # Fill remainder with existing curated reviews that weren't in the API's latest 5
                    for r in existing_data.get('reviews', []):
                        if r not in updated_reviews and len(updated_reviews) < 6:
                            updated_reviews.append(r)
                            
                    existing_data["reviews"] = updated_reviews
                    
        except urllib.error.URLError as e:
            print(f"[Sync] API connection error: {e}. Falling back to curated/local reviews.")
        except Exception as e:
            print(f"[Sync] Unexpected error during sync: {e}. Falling back to curated/local reviews.")
    else:
        print("[Sync] No Google Places API credentials configured in .env.")
        print("[Sync] Using manual/curated fallback and updating links from .env.")

    # Write final merged structure back to data/reviews.json
    try:
        os.makedirs(os.path.dirname(REVIEWS_JSON), exist_ok=True)
        with open(REVIEWS_JSON, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
        print(f"[Sync] Complete! Reviews written to {os.path.basename(REVIEWS_JSON)}")
    except Exception as e:
        print(f"[Sync] Error: Could not write final reviews.json: {e}")

if __name__ == "__main__":
    main()
