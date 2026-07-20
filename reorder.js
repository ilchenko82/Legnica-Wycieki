const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update Hero text
html = html.replace('Dostępni 24/7', 'Dostępni 7-23');

// 2. Update Hero counters
html = html.replace(/<span class="counter-animated" data-target="500">0<\/span>/, '<span class="counter-animated" data-target="300">300</span>');
html = html.replace(/<span class="counter-animated" data-target="12">0<\/span>/, '<span class="counter-animated" data-target="10">10</span>');
html = html.replace(/<span class="counter-animated" data-target="98">0<\/span>/, '<span class="counter-animated" data-target="95">95</span>');

// 3. Extract sections based on comments
const sections = {};
const patterns = {
    'header': /(  <!-- ═══ HEADER ═══ -->[\s\S]*?)(?=  <!-- ═══ 1\. HERO ═══ -->)/,
    'hero': /(  <!-- ═══ 1\. HERO ═══ -->[\s\S]*?)(?=  <!-- ═══ 2\. FEATURES \(Why Us\) ═══ -->)/,
    'features': /(  <!-- ═══ 2\. FEATURES \(Why Us\) ═══ -->[\s\S]*?)(?=  <!-- ═══ 3\. GALLERY ═══ -->)/,
    'gallery': /(  <!-- ═══ 3\. GALLERY ═══ -->[\s\S]*?)(?=  <!-- ═══ 4\. PROCESS ═══ -->)/,
    'process': /(  <!-- ═══ 4\. PROCESS ═══ -->[\s\S]*?)(?=  <!-- ═══ 5\. PRICING ═══ -->)/,
    'pricing': /(  <!-- ═══ 5\. PRICING ═══ -->[\s\S]*?)(?=  <!-- ═══ ABOUT SPECIALIST ═══ -->)/,
    'about': /(  <!-- ═══ ABOUT SPECIALIST ═══ -->[\s\S]*?)(?=  <!-- ═══ 6\. SERVICES ═══ -->)/,
    'services': /(  <!-- ═══ 6\. SERVICES ═══ -->[\s\S]*?)(?=  <!-- ═══ 7\. EQUIPMENT ═══ -->)/,
    'equipment': /(  <!-- ═══ 7\. EQUIPMENT ═══ -->[\s\S]*?)(?=  <!-- ═══ 8\. REVIEWS ═══ -->)/,
    'reviews': /(  <!-- ═══ 8\. REVIEWS ═══ -->[\s\S]*?)(?=  <!-- ═══ 9\. CONTACT ═══ -->)/,
    'contact': /(  <!-- ═══ 9\. CONTACT ═══ -->[\s\S]*?)(?=  <!-- ═══ MODAL FORM ═══ -->)/,
    'footer_and_rest': /(  <!-- ═══ MODAL FORM ═══ -->[\s\S]*)/
};

for (const [name, pattern] of Object.entries(patterns)) {
    const match = html.match(pattern);
    if (!match) {
        console.error(`Failed to extract ${name}`);
    } else {
        sections[name] = match[1];
    }
}

// 4. Extract and move insurance banner
const insurancePattern = /(\s*<div class="pricing__insurance reveal">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
const insuranceMatch = sections['pricing'].match(insurancePattern);

if (insuranceMatch) {
    let insuranceHtml = insuranceMatch[1];
    sections['pricing'] = sections['pricing'].replace(insuranceHtml, '');
    
    insuranceHtml = insuranceHtml.replace('Koszt usługi możesz rozliczyć w ramach swojego ubezpieczenia.', 'Koszt usługi możesz rozliczyć w ramach swojego ubezpieczenia (m.in. PZU, Warta).');
    
    const featuresInsert = '      </div>' + insuranceHtml + '\n    </div>\n  </section>\n';
    sections['features'] = sections['features'].replace(/      <\/div>\s*<\/div>\s*<\/section>\s*/, featuresInsert);
} else {
    console.error('Failed to find insurance banner');
}

function setBg(htmlChunk, isAlt) {
    let clean = htmlChunk.replace(/section--alt/g, '');
    if (isAlt) {
        clean = clean.replace(/<section class="([^"]+)"/, '<section class="$1 section--alt"');
    }
    return clean.replace(/  "/g, '"').replace(/ "/g, '"');
}

// Ensure the ID of About is 'about' and Pricing is 'pricing' etc if needed.
// Wait, the ids are already there.

// Output Order:
// 1. Hero
// 2. Pricing (alt)
// 3. Features (normal)
// 4. Services (alt)
// 5. Equipment (normal)
// 6. Process (alt)
// 7. About (normal)
// 8. Gallery (alt)
// 9. Reviews (normal)
// 10. Contact (alt)

let newHtml = sections['header'] +
              sections['hero'] +
              setBg(sections['pricing'], true) +
              setBg(sections['features'], false) +
              setBg(sections['services'], true) +
              setBg(sections['equipment'], false) +
              setBg(sections['process'], true) +
              setBg(sections['about'], false) +
              setBg(sections['gallery'], true) +
              setBg(sections['reviews'], false) +
              setBg(sections['contact'], true) +
              sections['footer_and_rest'];

fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('Done rewriting index.html');
