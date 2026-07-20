/* ==========================================================================
   WyciekiPro — Lekki Serwer Lokalny (HTTP Static Server)
   Uruchamianie: node server.js
   Serwer obsługuje wszystkie pliki statyczne (HTML, CSS, JS, obrazy, SVG)
   na porcie 8080 bez żadnych zewnętrznych bibliotek npm.
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  // Dekodowanie znaków specjalnych w URL (np. spacje, cyrylica itp.)
  let decodedUrl = '';
  try {
    decodedUrl = decodeURIComponent(req.url);
  } catch (e) {
    decodedUrl = req.url;
  }

  let filePath = '.' + decodedUrl;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Usunięcie parametrów zapytania (query parameters) lub hashy
  filePath = filePath.split('?')[0].split('#')[0];

  // Zabezpieczenie przed directory traversal (przejściem poza folder roboczy)
  const resolvedPath = path.resolve(filePath);
  const rootPath = path.resolve('.');
  if (!resolvedPath.startsWith(rootPath)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Dostęp zablokowany (Access Denied)');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Błąd 404: Nie znaleziono pliku');
      } else {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Błąd 500: Wewnętrzny błąd serwera: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('======================================================');
  console.log(`🚀 Lokalny serwer WyciekiPro działa poprawnie!`);
  console.log(`🔗 Kliknij lub otwórz w przeglądarce: http://localhost:${PORT}/`);
  console.log('======================================================');
  console.log('Naciśnij Ctrl + C w terminalu, aby zatrzymać serwer.');
});
