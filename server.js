const express = require('express');
const axios = require('axios');

function createServer(port, otherServers) {

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

    app.post('/increment', async (req, res) => {
        counter++;
        await syncCounter();

        res.send(`Counter incremented to ${counter}`);
    });

    app.get('/counter', (req, res) => {
        res.json({ counter });
    });

    app.post('/sync', (req, res) => {
        const { counter: newCounter } = req.body;
        if (newCounter > counter) {
            counter = newCounter;
            console.log(`Counter synchronized to ${counter}`);
        }
        res.json({ counter });
    });

    const server = app.listen(port, async () => {
        console.log(`Server running on port ${port}`);
        await syncCounter();
    });
    return { app, server };
}

module.exports = { createServer };

createServer(3000,process.env.OTHER_SERVERS?.split(',') || []);