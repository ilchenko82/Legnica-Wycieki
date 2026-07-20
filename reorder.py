import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Hero text
html = html.replace('Dostępni 24/7', 'Dostępni 7-23')

# 2. Update Hero counters
html = re.sub(r'<span class=\"counter-animated\" data-target=\"500\">0</span>', r'<span class=\"counter-animated\" data-target=\"300\">300</span>', html)
html = re.sub(r'<span class=\"counter-animated\" data-target=\"12\">0</span>', r'<span class=\"counter-animated\" data-target=\"10\">10</span>', html)
html = re.sub(r'<span class=\"counter-animated\" data-target=\"98\">0</span>', r'<span class=\"counter-animated\" data-target=\"95\">95</span>', html)

# 3. Extract sections based on comments
sections = {}
patterns = {
    'header': r'(  <!-- ═══ HEADER ═══ -->.*?)(?=  <!-- ═══ 1\. HERO ═══ -->)',
    'hero': r'(  <!-- ═══ 1\. HERO ═══ -->.*?)(?=  <!-- ═══ 2\. FEATURES \(Why Us\) ═══ -->)',
    'features': r'(  <!-- ═══ 2\. FEATURES \(Why Us\) ═══ -->.*?)(?=  <!-- ═══ 3\. GALLERY ═══ -->)',
    'gallery': r'(  <!-- ═══ 3\. GALLERY ═══ -->.*?)(?=  <!-- ═══ 4\. PROCESS ═══ -->)',
    'process': r'(  <!-- ═══ 4\. PROCESS ═══ -->.*?)(?=  <!-- ═══ 5\. PRICING ═══ -->)',
    'pricing': r'(  <!-- ═══ 5\. PRICING ═══ -->.*?)(?=  <!-- ═══ ABOUT SPECIALIST ═══ -->)',
    'about': r'(  <!-- ═══ ABOUT SPECIALIST ═══ -->.*?)(?=  <!-- ═══ 6\. SERVICES ═══ -->)',
    'services': r'(  <!-- ═══ 6\. SERVICES ═══ -->.*?)(?=  <!-- ═══ 7\. EQUIPMENT ═══ -->)',
    'equipment': r'(  <!-- ═══ 7\. EQUIPMENT ═══ -->.*?)(?=  <!-- ═══ 8\. REVIEWS ═══ -->)',
    'reviews': r'(  <!-- ═══ 8\. REVIEWS ═══ -->.*?)(?=  <!-- ═══ 9\. CONTACT ═══ -->)',
    'contact': r'(  <!-- ═══ 9\. CONTACT ═══ -->.*?)(?=  <!-- ═══ MODAL FORM ═══ -->)',
    'footer_and_rest': r'(  <!-- ═══ MODAL FORM ═══ -->.*)'
}

for name, pattern in patterns.items():
    match = re.search(pattern, html, flags=re.DOTALL)
    if not match:
        print(f'Failed to extract {name}')
    else:
        sections[name] = match.group(1)

# 4. Extract and move insurance banner from pricing to features
insurance_pattern = r'(\s*<div class=\"pricing__insurance reveal\">.*?</div>\s*</div>\s*</div>)'
insurance_match = re.search(insurance_pattern, sections['pricing'], flags=re.DOTALL)

if insurance_match:
    insurance_html = insurance_match.group(1)
    # Remove from pricing
    sections['pricing'] = sections['pricing'].replace(insurance_html, '')
    
    # Modify insurance HTML
    insurance_html = insurance_html.replace('Koszt usługi możesz rozliczyć w ramach swojego ubezpieczenia.', 'Koszt usługi możesz rozliczyć w ramach swojego ubezpieczenia (m.in. PZU, Warta).')
    
    # Add to features (after features grid, before closing section div)
    # The end of features looks like:
    #       </div>
    #     </div>
    #   </section>
    
    features_insert = '      </div>' + insurance_html + '\n    </div>\n  </section>\n'
    sections['features'] = re.sub(r'      </div>\s*</div>\s*</section>\s*', features_insert, sections['features'])
else:
    print('Failed to find insurance banner')

# Clean up section tags for alternating backgrounds
def set_bg(html_chunk, is_alt):
    # Remove section--alt if present
    html_chunk = html_chunk.replace('section--alt', '')
    if is_alt:
        html_chunk = re.sub(r'<section class=\"([^\"]+)\"', r'<section class=\"\1 section--alt\"', html_chunk, count=1)
    # clean up double spaces
    html_chunk = html_chunk.replace('  \"', '\"').replace(' \"', '\"')
    return html_chunk

# Desired Order:
# 1. Hero
# 2. Pricing (alt)
# 3. Features (normal)
# 4. Services (alt)
# 5. Equipment (normal)
# 6. Process (alt)
# 7. About Specialist (normal)
# 8. Gallery (alt)
# 9. Reviews (normal)
# 10. Contact (alt)

new_html = sections['header'] + \
           sections['hero'] + \
           set_bg(sections['pricing'], True) + \
           set_bg(sections['features'], False) + \
           set_bg(sections['services'], True) + \
           set_bg(sections['equipment'], False) + \
           set_bg(sections['process'], True) + \
           set_bg(sections['about'], False) + \
           set_bg(sections['gallery'], True) + \
           set_bg(sections['reviews'], False) + \
           set_bg(sections['contact'], True) + \
           sections['footer_and_rest']

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Done rewriting index.html')
