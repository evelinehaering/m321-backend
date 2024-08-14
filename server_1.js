const express = require('express');
const axios = require('axios');

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

app.post('/increment', async (req, res) => {
    counter++;
    res.send(`Counter incremented to ${counter}`);
});

app.get('/counter', (req, res) => {
    res.json({ counter });
});


app.listen(3000, async () => {
    console.log('Server running on port 3000')
});