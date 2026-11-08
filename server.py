"""Dependency-free local HTTP server for the static SportEvent prototype."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

if __name__ == '__main__':
    os.chdir(Path(__file__).resolve().parent)
    address = ('127.0.0.1', 8000)
    print(f'SportEvent: http://{address[0]}:{address[1]}')
    try:
        ThreadingHTTPServer(address, SimpleHTTPRequestHandler).serve_forever()
    except KeyboardInterrupt:
        print('Server stopped')
