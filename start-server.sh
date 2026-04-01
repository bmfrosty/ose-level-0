#!/bin/bash
# Simple HTTP server for viewing the OSE character generator
# Run this script to start the server, then visit http://localhost:8000
# Serves HTML with Cache-Control: no-store so edits show immediately on navigation.

python3 - <<'EOF'
import http.server, os

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """Like SimpleHTTPRequestHandler but disables caching for HTML pages."""
    def end_headers(self):
        path = self.path.split('?')[0]
        if path.endswith('.html') or path.endswith('/') or '.' not in os.path.basename(path):
            self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quiet down JS/CSS 304 noise; only log HTML + errors
        code = args[1] if len(args) > 1 else ''
        path = args[0] if args else ''
        if str(code).startswith(('4', '5')) or path.endswith(('.html', '/')):
            super().log_message(fmt, *args)

http.server.HTTPServer(('', 8000), NoCacheHandler).serve_forever()
EOF
