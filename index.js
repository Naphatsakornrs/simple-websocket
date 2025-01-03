const https = require('node:http');
const url = require('node:url');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = https.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

app.get('/', (req, res) => {
	console.log(wss.clients);
	res.send(`${wss.clients.size} client connecting`);
});

wss.on('connection', (ws, request) => {
	ws.on('message', (data) => {
		wss.clients.forEach((client) => {
			if(client != ws && client.readyState == WebSocket.OPEN && client.route == ws.route){
				client.send(data.toString());
			}
		});
	});
});

server.on('upgrade', (request, socket, head) => {
	const pathname = url.parse(request.url).pathname;
	wss.handleUpgrade(request, socket, head, (ws) => {
		ws.route = pathname;
		wss.emit('connection', ws, request);
	});
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
