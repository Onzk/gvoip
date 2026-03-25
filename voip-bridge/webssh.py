#!/usr/bin/env python3
"""
WebSSH proxy — lance ttyd sur port fixe par IP et proxifie via nginx-like
Architecture: client -> :9061/ssh?ip=X -> ttyd process sur port fixe
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess, socket, re, threading, time, os, signal

procs = {}  # ip -> {"proc": Popen, "port": int, "last_used": float}

PORT_BASE = 9100  # ports fixes à partir de 9100
port_map = {}     # ip -> port fixe (9100, 9101, ...)

THEME = '{"background":"#0d1117","foreground":"#e6edf3","cursor":"#58a6ff","cursorAccent":"#0d1117","selection":"rgba(88,166,255,0.3)","black":"#484f58","red":"#ff7b72","green":"#3fb950","yellow":"#d29922","blue":"#58a6ff","magenta":"#bc8cff","cyan":"#39c5cf","white":"#b1bac4","brightBlack":"#6e7681","brightRed":"#ffa198","brightGreen":"#56d364","brightYellow":"#e3b341","brightBlue":"#79c0ff","brightMagenta":"#d2a8ff","brightCyan":"#56d4dd","brightWhite":"#f0f6fc"}'

def get_server_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return '127.0.0.1'

def get_or_create_ttyd(ip, ssh_user="root"):
    if ip in procs and procs[ip]["proc"].poll() is None:
        procs[ip]["last_used"] = time.time()
        return procs[ip]["port"]

    # Assigner port fixe
    if ip not in port_map:
        port_map[ip] = PORT_BASE + len(port_map)
    port = port_map[ip]

    # Tuer l'ancien process si existant
    if ip in procs:
        try: procs[ip]["proc"].terminate()
        except: pass

    proc = subprocess.Popen([
        'ttyd', '-p', str(port),
        '--writable',
        '--once',
        '-t', f'theme={THEME}',
        '-t', 'fontSize=13',
        '-t', 'fontFamily=JetBrains Mono,Fira Code,monospace',
        'ssh',
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        f'{ssh_user}@{ip}'
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    procs[ip] = {"proc": proc, "port": port, "last_used": time.time()}
    time.sleep(0.8)  # laisser ttyd démarrer
    return port

def cleanup_old_procs():
    """Nettoie les process ttyd inutilisés depuis plus de 10min"""
    while True:
        time.sleep(60)
        now = time.time()
        for ip in list(procs.keys()):
            if now - procs[ip].get("last_used", 0) > 600:
                try: procs[ip]["proc"].terminate()
                except: pass
                del procs[ip]

threading.Thread(target=cleanup_old_procs, daemon=True).start()

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def do_GET(self):
        # Route: /ssh?ip=X.X.X.X&user=root
        m = re.match(r'/ssh\?ip=([\d.]+)(?:&user=(\S+))?', self.path)
        if not m:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not found')
            return

        ip = m.group(1)
        user = m.group(2) or "root"
        server_ip = get_server_ip()

        port = get_or_create_ttyd(ip, user)

        # Redirect vers le port ttyd
        self.send_response(302)
        self.send_header('Location', f'http://{server_ip}:{port}/')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
    logging.info("WebSSH proxy démarré sur port 9061")
    logging.info(f"Ports ttyd alloués à partir de {PORT_BASE}")
    HTTPServer(('0.0.0.0', 9061), Handler).serve_forever()
