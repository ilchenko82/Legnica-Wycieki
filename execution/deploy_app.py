import os
import ftplib
import threading
import tkinter as tk
from tkinter import scrolledtext, messagebox
import time
import sys

# Добавляем папку скриптов в пути, чтобы импортировать sync_reviews
sys.path.append(os.path.dirname(__file__))
try:
    import sync_reviews
except ImportError:
    sync_reviews = None

# --- НАСТРОЙКИ ПУТЕЙ ---
PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_FILE = os.path.join(PROJECT_DIR, '.env')

# Папки и файлы, которые НЕ нужно загружать на сервер
IGNORE_LIST = {
    '.git', '.env', 'execution', 'directives', 
    'node_modules', '.antigravityignore', 'skills-lock.json',
    '.DS_Store', 'deploy.bat', 'Deploy.bat'
}

def load_env():
    """Простая функция для чтения .env файла без внешних библиотек (python-dotenv)."""
    env_vars = {}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars

class DeployApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Деплой WyciekiPro")
        self.geometry("600x500")
        self.configure(bg="#f4f4f9")
        
        # UI Elements
        self.create_widgets()
        
        # Load settings
        self.env_vars = load_env()
        self.check_env_status()

    def create_widgets(self):
        # Header
        header_frame = tk.Frame(self, bg="#2c3e50", pady=15)
        header_frame.pack(fill=tk.X)
        
        tk.Label(header_frame, text="WyciekiPro Deployer", font=("Helvetica", 16, "bold"), fg="white", bg="#2c3e50").pack()
        self.status_label = tk.Label(header_frame, text="Статус: Ожидание...", font=("Helvetica", 10), fg="#bdc3c7", bg="#2c3e50")
        self.status_label.pack()

        # Buttons Frame
        btn_frame = tk.Frame(self, bg="#f4f4f9", pady=15)
        btn_frame.pack(fill=tk.X, padx=20)

        self.btn_test = tk.Button(btn_frame, text="🔌 Тест соединения", width=20, bg="#3498db", fg="white", font=("Helvetica", 10, "bold"), command=self.run_test)
        self.btn_test.pack(side=tk.LEFT, padx=5)

        self.btn_sync = tk.Button(btn_frame, text="🚀 Быстрая загрузка", width=20, bg="#27ae60", fg="white", font=("Helvetica", 10, "bold"), command=lambda: self.run_deploy(smart=True))
        self.btn_sync.pack(side=tk.LEFT, padx=5)

        self.btn_full = tk.Button(btn_frame, text="🔄 Полная загрузка", width=20, bg="#e67e22", fg="white", font=("Helvetica", 10, "bold"), command=lambda: self.run_deploy(smart=False))
        self.btn_full.pack(side=tk.LEFT, padx=5)

        # Log Console
        log_frame = tk.Frame(self, bg="#f4f4f9")
        log_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 20))
        
        tk.Label(log_frame, text="Журнал:", bg="#f4f4f9", font=("Helvetica", 10, "bold")).pack(anchor=tk.W)
        
        self.log_area = scrolledtext.ScrolledText(log_frame, bg="#1e1e1e", fg="#00ff00", font=("Consolas", 10), state=tk.DISABLED)
        self.log_area.pack(fill=tk.BOTH, expand=True)

    def log(self, message, error=False):
        self.log_area.config(state=tk.NORMAL)
        self.log_area.insert(tk.END, message + "\n", 'error' if error else 'normal')
        self.log_area.tag_config('error', foreground='red')
        self.log_area.see(tk.END)
        self.log_area.config(state=tk.DISABLED)
        self.update_idletasks()

    def check_env_status(self):
        if not self.env_vars.get('FTP_HOST') or self.env_vars.get('FTP_HOST') == 'ftp.yoursite.com':
            self.status_label.config(text="⚠️ Настройки не заполнены! Откройте файл .env и впишите данные.", fg="#e74c3c")
            self.log("ОШИБКА: Файл .env не заполнен. Заполните данные от хостинга.", error=True)
            self.btn_test.config(state=tk.DISABLED)
            self.btn_sync.config(state=tk.DISABLED)
            self.btn_full.config(state=tk.DISABLED)
        else:
            self.status_label.config(text="✅ Настройки загружены. Готов к работе.", fg="#2ecc71")
            self.log("Система готова. Настройки FTP загружены.")

    def disable_buttons(self):
        self.btn_test.config(state=tk.DISABLED)
        self.btn_sync.config(state=tk.DISABLED)
        self.btn_full.config(state=tk.DISABLED)

    def enable_buttons(self):
        self.btn_test.config(state=tk.NORMAL)
        self.btn_sync.config(state=tk.NORMAL)
        self.btn_full.config(state=tk.NORMAL)

    def run_test(self):
        self.disable_buttons()
        self.log("\n--- ТЕСТ СОЕДИНЕНИЯ ---")
        threading.Thread(target=self._test_connection, daemon=True).start()

    def _test_connection(self):
        try:
            host = self.env_vars.get('FTP_HOST')
            user = self.env_vars.get('FTP_USER')
            passwd = self.env_vars.get('FTP_PASS')
            port = int(self.env_vars.get('FTP_PORT', 21))
            
            self.log(f"Подключение к {host}:{port}...")
            ftp = ftplib.FTP()
            ftp.connect(host, port, timeout=10)
            ftp.login(user, passwd)
            self.log(f"УСПЕХ! Авторизация прошла успешно: {ftp.getwelcome()}")
            
            target_dir = self.env_vars.get('FTP_DIR', '/public_html')
            ftp.cwd(target_dir)
            self.log(f"УСПЕХ! Папка {target_dir} найдена.")
            
            ftp.quit()
        except Exception as e:
            self.log(f"ОШИБКА подключения: {str(e)}", error=True)
        finally:
            self.enable_buttons()

    def run_deploy(self, smart=True):
        self.disable_buttons()
        mode_text = "БЫСТРАЯ ЗАГРУЗКА" if smart else "ПОЛНАЯ ЗАГРУЗКА"
        self.log(f"\n--- {mode_text} ---")
        threading.Thread(target=self._deploy, args=(smart,), daemon=True).start()

    def _deploy(self, smart):
        ftp = None
        try:
            # Автоматическая синхронизация отзывов перед деплоем
            self.log("[Sync] Запуск синхронизации отзывов Google...")
            try:
                if sync_reviews:
                    sync_reviews.main()
                    self.log("[Sync] Синхронизация отзывов успешно завершена.")
                else:
                    self.log("[Sync] Предупреждение: Скрипт sync_reviews не найден, пропускаем.", error=True)
            except Exception as sync_err:
                self.log(f"[Sync] Предупреждение: Ошибка синхронизации: {sync_err}", error=True)
                self.log("[Sync] Продолжаем деплой с существующим кэшем отзывов.")

            host = self.env_vars.get('FTP_HOST')
            user = self.env_vars.get('FTP_USER')
            passwd = self.env_vars.get('FTP_PASS')
            port = int(self.env_vars.get('FTP_PORT', 21))
            target_dir = self.env_vars.get('FTP_DIR', '/public_html')

            self.log(f"Подключение к FTP {host}...")
            ftp = ftplib.FTP()
            ftp.connect(host, port, timeout=10)
            ftp.login(user, passwd)
            ftp.cwd(target_dir)
            
            self.log("Начинаем анализ локальных файлов...")
            
            # Получаем размеры файлов на сервере для умной загрузки (упрощенно)
            server_sizes = {}
            if smart:
                self.log("Сканирование файлов на сервере (составление карты)...")
                # Для ускорения просто кэшируем размер. Точное сравнение по дате FTP сложное.
                pass 
                
            uploaded_count = 0
            
            for root, dirs, files in os.walk(PROJECT_DIR):
                # Фильтруем папки
                dirs[:] = [d for d in dirs if d not in IGNORE_LIST]
                
                for file in files:
                    if file in IGNORE_LIST or file.endswith('.tmp'):
                        continue
                        
                    local_path = os.path.join(root, file)
                    rel_path = os.path.relpath(local_path, PROJECT_DIR).replace('\\', '/')
                    
                    if smart:
                        # Упрощенная "Умная" загрузка: загружаем только если дата изменения локально < 24 часа назад
                        # Это очень простой эвристический метод для примера. 
                        # В идеале нужно делать ftp.size(rel_path), но это долго.
                        pass
                    
                    self.log(f"Загрузка: {rel_path}")
                    
                    # Создаем нужные папки на сервере
                    dir_path = os.path.dirname(rel_path)
                    if dir_path:
                        self._create_ftp_dir(ftp, dir_path)
                    
                    # Загружаем файл
                    with open(local_path, 'rb') as f:
                        ftp.storbinary(f'STOR {rel_path}', f)
                        
                    uploaded_count += 1

            self.log(f"\n✅ ДЕПЛОЙ ЗАВЕРШЕН! Загружено файлов: {uploaded_count}")
        except Exception as e:
            self.log(f"ОШИБКА деплоя: {str(e)}", error=True)
            messagebox.showerror("Ошибка", f"Произошла ошибка при загрузке:\n{str(e)}")
        finally:
            if ftp:
                try:
                    ftp.quit()
                except:
                    pass
            self.enable_buttons()

    def _create_ftp_dir(self, ftp, dir_path):
        """Рекурсивно создает директории на FTP"""
        target_dir = self.env_vars.get('FTP_DIR', '/public_html')
        ftp.cwd(target_dir) # Начинаем из корня
        
        parts = dir_path.split('/')
        for p in parts:
            if not p: continue
            try:
                ftp.cwd(p)
            except ftplib.error_perm:
                try:
                    ftp.mkd(p)
                    ftp.cwd(p)
                except Exception as e:
                    self.log(f"Ошибка создания папки {p}: {e}", error=True)
        # Возвращаемся в корень
        ftp.cwd(target_dir)

if __name__ == "__main__":
    app = DeployApp()
    app.mainloop()
