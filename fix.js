const fs = require('fs');

const head = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WyciekiPro — Lokalizacja Wycieków</title>
  
  <!-- Base -->
  <link rel="stylesheet" href="css/base/variables.css">
  <link rel="stylesheet" href="css/base/reset.css">
  <link rel="stylesheet" href="css/base/typography.css">

  <!-- Layout -->
  <link rel="stylesheet" href="css/layout/grid.css">
  <link rel="stylesheet" href="css/layout/responsive.css">

  <!-- Components -->
  <link rel="stylesheet" href="css/components/header.css">
  <link rel="stylesheet" href="css/components/hero.css">
  <link rel="stylesheet" href="css/components/features.css">
  <link rel="stylesheet" href="css/components/services.css">
  <link rel="stylesheet" href="css/components/equipment.css">
  <link rel="stylesheet" href="css/components/process.css">
  <link rel="stylesheet" href="css/components/gallery.css">
  <link rel="stylesheet" href="css/components/reviews.css">
  <link rel="stylesheet" href="css/components/contact.css">
  <link rel="stylesheet" href="css/components/about-me.css">
  <link rel="stylesheet" href="css/components/pricing.css">
  <link rel="stylesheet" href="css/components/buttons.css">
  <link rel="stylesheet" href="css/components/footer.css">
  <link rel="stylesheet" href="css/components/cards.css">
  <link rel="stylesheet" href="css/components/cases.css">
  <link rel="stylesheet" href="css/components/intro-gallery.css">

  <!-- Animations -->
  <link rel="stylesheet" href="css/animations/animations.css">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
`;

let content = fs.readFileSync('index.html', 'utf8');
if (!content.includes('<head>')) {
    content = head + content;
    fs.writeFileSync('index.html', content, 'utf8');
    console.log('Restored head block');
} else {
    console.log('Head block already exists');
}
