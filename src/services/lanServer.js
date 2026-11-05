const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');
const { WebSocketServer, WebSocket } = require('ws');

class LanCompanionServer extends EventEmitter {
  constructor(port = 19890) {
    super();
    this.port = port;
    this.httpServer = null;
    this.wss = null;
    this.clients = new Set();
    this.staticDir = path.join(__dirname, '..', '..', 'android', 'app', 'src', 'main', 'assets', 'www');
    this.cachedStats = { viewers: 0, likes: 0 };
  }

  getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  start() {
    try {
      this.httpServer = http.createServer((req, res) => {
        let reqPath = req.url.split('?')[0];
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

        const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
        const filePath = path.join(this.staticDir, safePath);

        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
          if (err) {
            if (err.code === 'ENOENT') {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found - AnxinityStream LAN Server');
            } else {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('500 Internal Server Error');
            }
          } else {
            res.writeHead(200, {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
          }
        });
      });

      this.wss = new WebSocketServer({ server: this.httpServer });

      this.wss.on('connection', (ws) => {
        this.clients.add(ws);

        // Send current cached stats immediately on connect
        if (this.cachedStats) {
          ws.send(JSON.stringify({
            channel: 'stream-stats',
            data: this.cachedStats
          }));
        }

        ws.on('message', (raw) => {
          try {
            const data = JSON.parse(raw.toString());
            this.emit('client-command', data, ws);
          } catch (e) {}
        });

        ws.on('close', () => {
          this.clients.delete(ws);
        });

        ws.on('error', () => {
          this.clients.delete(ws);
        });
      });

      this.httpServer.listen(this.port, '0.0.0.0', () => {
        console.log(`[LAN Server] AnxinityStream Companion active at http://${this.getLocalIp()}:${this.port}`);
      });

      this.httpServer.on('error', (err) => {
        console.warn('[LAN Server] Error starting HTTP server:', err.message);
      });
    } catch (err) {
      console.warn('[LAN Server] Failed to initialize:', err.message);
    }
  }

  broadcast(channel, data) {
    if (channel === 'stream-stats' && data) {
      this.cachedStats = { ...this.cachedStats, ...data };
    }

    if (!this.wss || this.clients.size === 0) return;

    const payload = JSON.stringify({ channel, data });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (e) {}
      }
    }
  }

  stop() {
    try {
      if (this.wss) {
        for (const client of this.clients) {
          client.close();
        }
        this.wss.close();
      }
      if (this.httpServer) {
        this.httpServer.close();
      }
    } catch (e) {}
  }
}

module.exports = LanCompanionServer;

