import http.server
import socketserver

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        return super().do_GET()

def start_server(port=8000):
    with socketserver.ThreadingTCPServer(("", port), CustomHandler) as httpd:
        print(f"Serving at http://localhost:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    start_server(3000)

