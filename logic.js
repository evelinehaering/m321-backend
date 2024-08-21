const express = require('express');
const axios = require('axios');

function createServer(port, serverName, nextServerUrl, otherServers) {
    const app = express();
    let counter = 0;

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
        let responses = [];
        for (const server of otherServers) {
            try {
                const response = await axios.post(`${server}/sync`, { counter });
                responses.push(response.data.counter);
            } catch (error) {
                console.log(`Error communicating with ${server}:`, error.message);
            }
        }
        if (responses.length > 0) {
            counter = Math.max(...responses);
            console.log(`Counter synchronized to ${counter}`);
        }
    }

    async function forwardRequest(url, headers, attempt = 1) {
        const maxRetries = 3;
        const retryDelay = 1000;

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
        res.send({ counter });
    });

    app.post('/sync', (req, res) => {
        const { counter: newCounter } = req.body;
        if (newCounter > counter) {
            counter = newCounter;
            console.log(`Counter synchronized to ${counter}`);
        }
        res.json({ counter });
    });

    app.listen(port, async () => {
        console.log(`Server running on port ${port}`);
        await syncCounter();
    });
}

module.exports = createServer;
