// index.js - simple signaling server
const WebSocket = require('ws');

const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });

console.log(`Signaling server listening on port ${port}`);

const clients = new Map(); // id -> ws

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      // register: { type: "register", id: "<client-id>" }
      if (data.type === 'register' && data.id) {
        clients.set(data.id, ws);
        ws.clientId = data.id;
        console.log(`Registered ${data.id}`);
        return;
      }

      // direct message: { to: "<other-id>", ... }
      if (data.to && clients.has(data.to)) {
        const peer = clients.get(data.to);
        if (peer.readyState === WebSocket.OPEN) peer.send(JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Bad message', e);
    }
  });

  ws.on('close', () => {
    if (ws.clientId) {
      clients.delete(ws.clientId);
      console.log(`Disconnected ${ws.clientId}`);
    }
  });
});
