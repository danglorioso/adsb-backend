const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const API_KEY = process.env.API_KEY || 'changeme';

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

let latestAircraft = [];

app.post('/api/aircraft', (req, res) => {
    if (req.headers['x-api-key'] !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    latestAircraft = req.body.aircraft || [];
    const payload = JSON.stringify({ aircraft: latestAircraft, ts: Date.now() });
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(payload);
    });
    res.json({ ok: true, count: latestAircraft.length });
});

wss.on('connection', ws => {
    ws.send(JSON.stringify({ aircraft: latestAircraft, ts: Date.now() }));
});

server.listen(process.env.PORT || 3000, () => console.log('Listening'));
