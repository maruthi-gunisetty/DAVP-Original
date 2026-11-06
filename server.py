import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run():
    global PORT
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server = None
    for attempt_port in range(PORT, PORT + 20):
        try:
            server = socketserver.TCPServer(("", attempt_port), QuietHandler)
            PORT = attempt_port
            break
        except OSError:
            continue

    if not server:
        print("Could not find an available port to start web server.")
        sys.exit(1)

    url = f"http://localhost:{PORT}"
    print("=" * 60)
    print("  🛒 DAVP E-Commerce Intelligence Dashboard Server")
    print("=" * 60)
    print(f"  Local Address:  {url}")
    print(f"  Serving Dir:    {os.getcwd()}")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 60)

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        server.server_close()

if __name__ == "__main__":
    run()

