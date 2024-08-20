const express = require('express');
const axios = require('axios');

const app = express();
let counter = 0;

const serverName = 'server1';
const nextServerUrl = 'http://localhost:3001/increment';
const maxRetries = 3;
const retryDelay = 1000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.use(express.json());

async function syncCounter() {
    const otherServers = ['http://localhost:3001', 'http://localhost:3002'];
    let responses = [];

    for (const server of otherServers) {
        try {
            const response = await axios.post(`${server}/sync`, { counter });
            responses.push(response.data.counter);
        } catch (error) {
            console.error(`Cannot reach ${server}:`, error.message);
        }
    }

    if (responses.length > 0) {
        counter = Math.max(...responses);
    }
}

async function forwardRequest(url, headers, attempt = 1) {
    try {
        await axios.post(url, null, { headers });
    } catch (error) {
        console.error(`${serverName} - Error forwarding request: `, error.message);

        if (attempt < maxRetries) {
            console.log(`${serverName} - Retrying forwarding request, attempt ${attempt + 1}`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            await forwardRequest(url, headers, attempt + 1);
        } else {
            console.error(`${serverName} - Failed to forward request after ${maxRetries} attempts`);
        }
    }
}

app.post('/increment', async (req, res) => {
    const originServers = req.headers['x-origin-servers']?.split(',') || [];

    if (originServers.includes(serverName)) {
        console.log(`${serverName} - Request denied: Origin server is the same`);
        return res.json({ counter });
    }

    await syncCounter();
    counter++;
    res.json({ counter });

    originServers.push(serverName);
    const headers = { 'x-origin-servers': originServers.join(',') };

    await forwardRequest(nextServerUrl, headers);
});

app.get('/count', (req, res) => {
    res.json({ counter });
});

app.post('/sync', (req, res) => {
    const { counter: newCounter } = req.body;
    if (newCounter > counter) {
        counter = newCounter;
        console.log(`${serverName} - Counter synchronized to ${counter}`);
    }
    res.json({ counter });
});

app.listen(3000, () => {
    console.log(`${serverName} running on port 3000`);
});
