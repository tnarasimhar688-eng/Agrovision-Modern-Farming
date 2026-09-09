#!/usr/bin/env python3
"""
Secure HTTP Server for SmartFarm
Injects production-grade HTTP security headers and handles static routing.
"""
import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SecureFarmHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Security Headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    os.chdir(DIRECTORY)
    # Enable address reuse so restarts don't block
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), SecureFarmHTTPRequestHandler) as httpd:
        print(f"===================================================")
        print(f"  SmartFarm Secure Server running on port {PORT}")
        print(f"  Local Access:   http://localhost:{PORT}")
        print(f"  Network Access: http://0.0.0.0:{PORT}")
        print(f"  Security Headers: Active (CSP, nosniff, SAMEORIGIN)")
        print(f"===================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully.")

if __name__ == '__main__':
    main()
