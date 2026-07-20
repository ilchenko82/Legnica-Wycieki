# Directive: Sync Google Reviews (SOP)

This document describes the Standard Operating Procedure (SOP) for synchronizing, displaying, and curating Google reviews on the WyciekiPro website.

---

## 1. Overview & Goals
The goal of this process is to showcase real-time customer feedback on the website footer/reviews section in both Polish and English. The system uses a cached JSON structure (`data/reviews.json`) to guarantee maximum site speed, perfect offline resilience, and search engine readability (SEO), while keeping data updated automatically upon each site deployment.

---

## 2. Architecture & Components
This feature is built upon the **3-layer architecture**:
1. **Layer 1 (Directive)**: This document (`directives/sync_reviews.md`).
2. **Layer 2 (Orchestration)**: Integrations in `execution/deploy_app.py` that trigger the synchronization automatically prior to any server uploads.
3. **Layer 3 (Execution)**: The Python script `execution/sync_reviews.py` which interacts with Google's APIs, handles date translation, and merges new data with manual translations.
4. **Data Cache**: `data/reviews.json` which contains the dynamic payload.
5. **Presentation Layer**: Dynamic hooks in `index.html`, `en/index.html`, and `js/main.js` that fetch the JSON and inject values safely.

---

## 3. How to Configure & Connect Google Maps

### Step A: Central Configuration in `.env`
Open the `.env` file at the root of the project and set the following parameters:

```ini
# Google Maps Integration
GOOGLE_MAPS_URL=https://maps.google.com/?cid=18151900155099238804
GOOGLE_WRITE_REVIEW_URL=https://search.google.com/local/writereview?placeid=ChIJ-Tq9m4HPG0cRpEvz86lR4fw

# (Optional) For automated Place API syncing
GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_CLOUD_API_KEY
GOOGLE_PLACE_ID=ChIJ-Tq9m4HPG0cRpEvz86lR4fw
```

### Step B: How to get a Google Place ID
1. Go to the [Google Place ID Finder tool](https://developers.google.com/maps/documentation/places/web-service/place-id).
2. Type your business name "WyciekiPro" in the search box.
3. Copy the returned `Place ID` (e.g. `ChIJ-Tq9m4HPG0cRpEvz86lR4fw`) and paste it into `.env` under `GOOGLE_PLACE_ID`.

### Step C: How to get a Free Google API Key (Optional)
To fetch reviews automatically from Google’s servers, you can create a developer API key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a free project and enable **Places API (New)**.
3. Set up billing (Google grants you **$200 in free credit every month**, which translates to 11,000+ free queries monthly. Since you only sync during deployment, your actual usage will be 100% free).
4. Go to **APIs & Services > Credentials** and generate an **API Key**.
5. Paste it in `.env` under `GOOGLE_PLACES_API_KEY`.

---

## 4. How to Curate and Translate Reviews Manually (Recommended)

Since Google does not provide automatic high-quality human translation for your bilingual site, we have built a **Smart Merging Engine**!
You can curate, polish, and translate your favorite reviews directly in `data/reviews.json`. 

### Merging Rules:
- If a review in `data/reviews.json` is manually translated (using `{ "pl": "...", "en": "..." }`), the `sync_reviews.py` script **will not overwrite** your beautiful translations!
- It will keep your manual text and only update the rating, profile avatar, and dates automatically.
- This allows you to hand-curate your best reviews for marketing appeal.

Example structure for a manually curated review in `data/reviews.json`:
```json
{
  "author": "Marek Kowalski",
  "rating": 5,
  "text": {
    "pl": "Szybka reakcja, profesjonalny sprzęt. Wyciek znaleziony w 30 minut! Polecam każdego.",
    "en": "Quick response, professional equipment. Leak found in 30 minutes! Highly recommend to everyone."
  },
  "avatar": "M",
  "date": {
    "pl": "2 tygodnie temu",
    "en": "2 weeks ago"
  }
}
```

---

## 5. Execution & Verification

### Automated Execution
You do not need to run any scripts manually! When you open `execution/deploy_app.py` (the Deployer GUI) and click **Sync** or **Deploy**, the following happens:
1. The deployer launches `sync_reviews.py` in the background.
2. It logs progress in the Tkinter terminal: `[Sync] Запуск синхронизации отзывов Google...`
3. It refreshes `data/reviews.json`.
4. It uploads the updated cache directly to your hosting.

### Manual Sync (Optional)
If you want to sync reviews without deploying the whole site, you can open PowerShell/Command Prompt in the project folder and run:
```bash
python execution/sync_reviews.py
```

---

## 6. Edge Cases & Resilience
- **No API Key / No Connection**: The synchronizer will fail silently and gracefully. It will not interrupt your deployment, and the site will simply display the last saved reviews from `data/reviews.json` or fallback to static HTML.
- **Bilingual Switch**: The site detects if the user is on the `/en/` subdirectory and automatically pulls English dates and text from the cache, while maintaining Polish on the main site.
