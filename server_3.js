const express = require('express');
const axios = require('axios');

const app = express();
var counter = 0;
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

app.post('/increment', async (req, res) => {
    const serverName = 'server3';
    const originServers = req.headers['x-origin-servers']?.split(',') || [];

    if (originServers.includes(serverName)) {
        console.log(`${serverName} - Request denied: Origin server is the same`);
        return res.json({ counter });
    }

    counter++;
    res.json({ counter });

    originServers.push(serverName);
    const headers = { 'x-origin-servers': originServers.join(',') };

    try {
        await axios.post('http://localhost:3000/increment', null, { headers });
    } catch (error) {
        console.error(`${serverName} - Error forwarding request: `, error.message);
    }
});

app.get('/counter', (req, res) => {
    res.send({ counter });
});

app.listen(3002, () => {
    console.log('Server running on port 3002');
});
