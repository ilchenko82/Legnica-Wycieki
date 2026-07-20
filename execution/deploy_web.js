const http = require('http');
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');

const PROJECT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(PROJECT_DIR, '.env');
const IGNORE_LIST = new Set([
  '.git', '.env', 'execution', 'directives', 'node_modules', 
  '.antigravityignore', 'skills-lock.json', '.DS_Store', 
  'deploy.bat', 'Deploy.bat', 'package.json', 'package-lock.json',
  'gemini.md', 'vibe-coding.md', 'readmi.md', 'server.js', 
  'fix.js', 'reorder.js', 'reorder.py', 'resize.ps1'
]);

// Расширения, которые ни при каких условиях не должны попасть на сервер
const IGNORED_EXTENSIONS = ['.md', '.py', '.ps1', '.bat', '.env', '.tmp'];

// Файлы, которые ВСЕГДА загружаются (даже в режиме sync), т.к. они критичны для SEO
const ALWAYS_UPLOAD = new Set(['robots.txt', 'sitemap.xml', '.htaccess']);

// Чтение .env без внешних зависимостей
function getEnv() {
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

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Деплой WyciekiPro</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f9; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 20px; }
        h1 { color: #2c3e50; margin-top: 0; }
        .status { padding: 10px; border-radius: 4px; margin-bottom: 20px; font-weight: bold; }
        .status.ok { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .btn-group { display: flex; gap: 10px; margin-bottom: 20px; }
        button { padding: 12px 20px; border: none; border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer; color: #fff; transition: opacity 0.2s; flex: 1; }
        button:hover { opacity: 0.9; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-test { background: #3498db; }
        .btn-sync { background: #27ae60; }
        .btn-full { background: #e67e22; }
        .log-container { background: #1e1e1e; color: #00ff00; font-family: Consolas, monospace; padding: 15px; border-radius: 4px; height: 300px; overflow-y: auto; white-space: pre-wrap; font-size: 13px; }
        .log-error { color: #ff4c4c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>WyciekiPro Deployer (Web)</h1>
        <div id="statusBox" class="status">Загрузка...</div>
        
        <div class="btn-group">
            <button id="btnTest" class="btn-test">🔌 Тест соединения</button>
            <button id="btnSync" class="btn-sync">🚀 Быстрая загрузка</button>
            <button id="btnFull" class="btn-full">🔄 Полная загрузка</button>
        </div>

        <div>
            <strong>Логи:</strong>
            <div id="logArea" class="log-container">Ожидание команд...\\n</div>
        </div>
    </div>

    <script>
        const statusBox = document.getElementById('statusBox');
        const logArea = document.getElementById('logArea');
        const buttons = document.querySelectorAll('button');

        function log(msg, isError=false) {
            const span = document.createElement('span');
            if(isError) span.className = 'log-error';
            span.innerText = msg + '\\n';
            logArea.appendChild(span);
            logArea.scrollTop = logArea.scrollHeight;
        }

        function setButtonsState(disabled) {
            buttons.forEach(b => b.disabled = disabled);
        }

        async function checkEnv() {
            try {
                const res = await fetch('/api/check');
                const data = await res.json();
                if (data.ok) {
                    statusBox.className = 'status ok';
                    statusBox.innerText = '✅ Настройки загружены. Готов к работе.';
                } else {
                    statusBox.className = 'status error';
                    statusBox.innerText = '⚠️ Настройки не заполнены! Откройте файл .env и впишите данные.';
                    setButtonsState(true);
                    log('ОШИБКА: Файл .env не заполнен. Впишите туда данные (Host, Login, Password)', true);
                }
            } catch (e) {
                log('Ошибка при проверке настроек: ' + e, true);
            }
        }

        async function runAction(action) {
            setButtonsState(true);
            log('\\n--- Выполняется: ' + action + ' ---');
            try {
                const res = await fetch('/api/run?action=' + action);
                const reader = res.body.getReader();
                const decoder = new TextDecoder("utf-8");

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\\n');
                    for (let line of lines) {
                        if (!line) continue;
                        if (line.startsWith('ERROR:')) {
                            log(line, true);
                        } else {
                            log(line);
                        }
                    }
                }
            } catch(e) {
                log('Сетевая ошибка: ' + e, true);
            }
            setButtonsState(false);
        }

        document.getElementById('btnTest').onclick = () => runAction('test');
        document.getElementById('btnSync').onclick = () => runAction('sync');
        document.getElementById('btnFull').onclick = () => runAction('full');

        checkEnv();
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML_CONTENT);
        return;
    }

    if (req.url === '/api/check') {
        const env = getEnv();
        const ok = env.FTP_HOST && env.FTP_HOST !== 'ftp.yoursite.com' && env.FTP_USER;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: !!ok }));
        return;
    }

    if (req.url.startsWith('/api/run')) {
        res.writeHead(200, { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked'
        });
        
        const action = new URL(req.url, 'http://localhost').searchParams.get('action');
        const env = getEnv();

        const log = (msg) => res.write(msg + '\\n');
        
        async function runDeploy() {
            const client = new ftp.Client();
            try {
                const host = env.FTP_HOST;
                const user = env.FTP_USER;
                const password = env.FTP_PASS;
                const port = parseInt(env.FTP_PORT) || 21;
                const targetDir = env.FTP_DIR || '/public_html';

                log('Подключение к FTP ' + host + ':' + port + '...');
                
                async function connect() {
                    const c = new ftp.Client();
                    c.ftp.timeout = 30000; // 30 секунд таймаут
                    try {
                        await c.access({
                            host: host,
                            user: user,
                            password: password,
                            port: port,
                            secure: false // Начинаем с обычного FTP
                        });
                    } catch(e) {
                        // Если ошибка, пробуем безопасное FTPS соединение
                        log('Попытка безопасного FTPS соединения...');
                        await c.access({
                            host: host,
                            user: user,
                            password: password,
                            port: port,
                            secure: true,
                            secureOptions: { rejectUnauthorized: false }
                        });
                    }
                    return c;
                }

                let client = await connect();

                if (action === 'test') {
                    log('УСПЕХ! Авторизация прошла успешно.');
                    try {
                        await client.cd(targetDir);
                        log('УСПЕХ! Папка ' + targetDir + ' найдена.');
                    } catch (e) {
                        log('ERROR: Папка ' + targetDir + ' не найдена на сервере! ' + e.message);
                    }
                    client.close();
                    res.end();
                    return;
                }

                // Синхронизация отзывов перед деплоем
                if (action === 'sync' || action === 'full') {
                    log('Запуск синхронизации отзывов Google...');
                    try {
                        const { execSync } = require('child_process');
                        // Пробуем запустить скрипт синхронизации
                        execSync('node execution/sync_reviews.js', { cwd: PROJECT_DIR });
                        log('Синхронизация отзывов успешно завершена.');
                    } catch (syncErr) {
                        log('Предупреждение: Не удалось запустить автоматическую синхронизацию отзывов: ' + syncErr.message);
                        log('Продолжаем деплой с существующим кэшем отзывов.');
                    }
                }

                // Деплой
                await client.cd(targetDir);
                log('Анализ локальных файлов...');
                
                async function uploadDir(localPath, remotePath) {
                    const entries = fs.readdirSync(localPath, { withFileTypes: true });
                    for (let entry of entries) {
                        if (IGNORE_LIST.has(entry.name)) continue;
                        
                        const fullLocal = path.join(localPath, entry.name);
                        const fullRemote = remotePath ? remotePath + '/' + entry.name : entry.name;
                        
                        if (entry.isDirectory()) {
                            try {
                                await client.ensureDir(fullRemote);
                            } catch(e) {
                                log('ERROR: Ошибка создания папки ' + fullRemote);
                            }
                            await client.cd(targetDir); // возвращаемся в корень
                            await uploadDir(fullLocal, fullRemote);
                        } else {
                            // Проверка расширения файла
                            const ext = path.extname(entry.name).toLowerCase();
                            if (IGNORED_EXTENSIONS.includes(ext)) {
                                log('Пропущен технический файл: ' + entry.name);
                                continue;
                            }
                            if (entry.name.endsWith('.tmp')) continue;
                            
                            if (action === 'sync') {
                                // Очень простая умная загрузка: только измененные за последние 24ч
                                if (!ALWAYS_UPLOAD.has(entry.name)) {
                                    const stats = fs.statSync(fullLocal);
                                    const hours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
                                    if (hours > 24) continue;
                                }
                            }
                            
                            log('Загрузка: ' + fullRemote);
                            
                            // Система автоматического перезапуска (Retry) при обрыве
                            let attempts = 0;
                            const maxAttempts = 3;
                            while (attempts < maxAttempts) {
                                try {
                                    await client.uploadFrom(fullLocal, fullRemote);
                                    break; // Успешно загрузили, выходим из цикла
                                } catch (err) {
                                    attempts++;
                                    log('⚠️ Обрыв связи при загрузке ' + entry.name + '. Попытка ' + attempts + ' из ' + maxAttempts + '...');
                                    if (attempts >= maxAttempts) {
                                        log('ERROR: Не удалось загрузить ' + entry.name + ' после 3 попыток. Пропуск.');
                                    } else {
                                        // Переподключаемся
                                        if (!client.closed) client.close();
                                        client = await connect();
                                        await client.cd(targetDir);
                                    }
                                }
                            }
                        }
                    }
                }
                
                await uploadDir(PROJECT_DIR, '');
                log('\\n✅ ДЕПЛОЙ ЗАВЕРШЕН!');

            } catch(e) {
                log('ERROR: Ошибка выполнения: ' + e.message);
            } finally {
                if (!client.closed) client.close();
                res.end();
            }
        }
        
        runDeploy();
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
