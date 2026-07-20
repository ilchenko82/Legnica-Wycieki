const fs = require('fs');
const path = require('path');

const FILES = ['index.html', 'cennik.html', 'uslugi.html', 'sprzet.html', 'galeria.html', 'faq.html'];
const BASE_URL = 'https://wyciekipro.pl';

function main() {
    if (!fs.existsSync('en')) {
        fs.mkdirSync('en');
    }

    FILES.forEach(filename => {
        if (!fs.existsSync(filename)) {
            console.log(`File ${filename} not found, skipping.`);
            return;
        }

        let content = fs.readFileSync(filename, 'utf-8');

        // --- PROCESS ROOT (POLISH) FILE ---

        // 1. Strip existing hreflang tags to avoid duplicates if run multiple times
        content = content.replace(/\s*<link rel="alternate" hreflang=.*?>/g, '');

        // 2. Inject fresh hreflang tags
        const url_pl = filename === 'index.html' ? `${BASE_URL}/` : `${BASE_URL}/${filename}`;
        const url_en = filename === 'index.html' ? `${BASE_URL}/en/` : `${BASE_URL}/en/${filename}`;

        const hreflang_tags = `
  <link rel="alternate" hreflang="pl" href="${url_pl}">
  <link rel="alternate" hreflang="en" href="${url_en}">
  <link rel="alternate" hreflang="x-default" href="${url_pl}">
</head>`;
        content = content.replace('</head>', hreflang_tags);

        // 3. Update Language Switcher from <button> to <a> for SEO and functionality
        // On first run:
        content = content.replace(/<button class="lang-switch__btn(.*?)" data-lang="pl">PL<\/button>/g, 
            `<a href="${filename}" class="lang-switch__btn$1">PL</a>`);
        content = content.replace(/<button class="lang-switch__btn(.*?)" data-lang="en">EN<\/button>/g, 
            `<a href="en/${filename}" class="lang-switch__btn$1">EN</a>`);
        
        // On subsequent runs, enforce correct root paths
        content = content.replace(/<a href="[^"]*" class="lang-switch__btn(.*?)">PL<\/a>/g, 
            `<a href="${filename}" class="lang-switch__btn$1">PL</a>`);
        content = content.replace(/<a href="[^"]*" class="lang-switch__btn(.*?)">EN<\/a>/g, 
            `<a href="en/${filename}" class="lang-switch__btn$1">EN</a>`);
        
        // Save modifications back to ROOT file
        fs.writeFileSync(filename, content, 'utf-8');

        // --- PROCESS EN (ENGLISH) FILE ---
        let en_content = content;

        // 1. Adjust canonical URL
        en_content = en_content.replace(`<link rel="canonical" href="${url_pl}">`, 
                                        `<link rel="canonical" href="${url_en}">`);

        // 2. Fix paths for static assets (css, js, images)
        en_content = en_content.replace(/href="css\//g, 'href="../css/');
        en_content = en_content.replace(/src="js\//g, 'src="../js/');
        en_content = en_content.replace(/href="js\//g, 'href="../js/');
        en_content = en_content.replace(/src="images\//g, 'src="../images/');
        en_content = en_content.replace(/href="images\//g, 'href="../images/');
        en_content = en_content.replace(/srcset="images\//g, 'srcset="../images/');
        en_content = en_content.replace(/, images\//g, ', ../images/');

        // 3. Fix language switcher for EN environment
        // PL points up one directory, EN points to self and becomes active
        en_content = en_content.replace(/<a href="[^"]*" class="lang-switch__btn( active)?">PL<\/a>/g, 
            `<a href="../${filename}" class="lang-switch__btn">PL</a>`);
        en_content = en_content.replace(/<a href="[^"]*" class="lang-switch__btn( active)?">EN<\/a>/g, 
            `<a href="${filename}" class="lang-switch__btn active">EN</a>`);

        // Save to en/ directory
        fs.writeFileSync(`en/${filename}`, en_content, 'utf-8');
    });

    console.log("Success: Deterministic EN structure generated flawlessly.");
}

main();
