import os
import re

FILES = ['index.html', 'cennik.html', 'uslugi.html', 'sprzet.html', 'galeria.html', 'faq.html']
BASE_URL = 'https://wyciekipro.pl'

def main():
    # 1. Ensure the en/ directory exists
    if not os.path.exists('en'):
        os.makedirs('en')

    for filename in FILES:
        if not os.path.exists(filename):
            print(f"File {filename} not found, skipping.")
            continue
            
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # --- PROCESS ROOT (POLISH) FILE ---

        # 1. Strip existing hreflang tags to avoid duplicates if run multiple times
        content = re.sub(r'\s*<link rel="alternate" hreflang=.*?>', '', content)

        # 2. Inject fresh hreflang tags
        url_pl = f"{BASE_URL}/" if filename == 'index.html' else f"{BASE_URL}/{filename}"
        url_en = f"{BASE_URL}/en/" if filename == 'index.html' else f"{BASE_URL}/en/{filename}"
        
        hreflang_tags = f"""
  <link rel="alternate" hreflang="pl" href="{url_pl}">
  <link rel="alternate" hreflang="en" href="{url_en}">
  <link rel="alternate" hreflang="x-default" href="{url_pl}">
</head>"""
        content = content.replace('</head>', hreflang_tags)

        # 3. Update Language Switcher from <button> to <a> for SEO and functionality
        # Replace <button> with <a> on first run
        content = re.sub(r'<button class="lang-switch__btn(.*?)" data-lang="pl">PL</button>', 
                         f'<a href="{filename}" class="lang-switch__btn\\1">PL</a>', content)
        content = re.sub(r'<button class="lang-switch__btn(.*?)" data-lang="en">EN</button>', 
                         f'<a href="en/{filename}" class="lang-switch__btn\\1">EN</a>', content)
        
        # If already replaced with <a> in subsequent runs, enforce correct root paths
        content = re.sub(r'<a href="[^"]*" class="lang-switch__btn(.*?)">PL</a>', 
                         f'<a href="{filename}" class="lang-switch__btn\\1">PL</a>', content)
        content = re.sub(r'<a href="[^"]*" class="lang-switch__btn(.*?)">EN</a>', 
                         f'<a href="en/{filename}" class="lang-switch__btn\\1">EN</a>', content)
        
        # Save modifications back to ROOT file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)


        # --- PROCESS EN (ENGLISH) FILE ---
        en_content = content
        
        # 1. Adjust canonical URL
        en_content = en_content.replace(f'<link rel="canonical" href="{url_pl}">', 
                                        f'<link rel="canonical" href="{url_en}">')

        # 2. Fix paths for static assets (css, js, images)
        en_content = re.sub(r'href="css/', 'href="../css/', en_content)
        en_content = re.sub(r'src="js/', 'src="../js/', en_content)
        en_content = re.sub(r'href="js/', 'href="../js/', en_content)
        en_content = re.sub(r'src="images/', 'src="../images/', en_content)
        en_content = re.sub(r'href="images/', 'href="../images/', en_content)

        # 3. Fix language switcher for EN environment
        # PL points up one directory, EN points to self and becomes active
        en_content = re.sub(r'<a href="[^"]*" class="lang-switch__btn( active)?">PL</a>', 
                            f'<a href="../{filename}" class="lang-switch__btn">PL</a>', en_content)
        en_content = re.sub(r'<a href="[^"]*" class="lang-switch__btn( active)?">EN</a>', 
                            f'<a href="{filename}" class="lang-switch__btn active">EN</a>', en_content)

        # Save to en/ directory
        with open(f'en/{filename}', 'w', encoding='utf-8') as f:
            f.write(en_content)

    print("Success: Deterministic EN structure generated flawlessly.")

if __name__ == '__main__':
    main()
