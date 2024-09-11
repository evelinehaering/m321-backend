const createServer = require('./server');

const port = 3002;
const serverName = 'server3';
const nextServerUrl = 'http://localhost:3000/increment';
const otherServers = ['http://localhost:3001', 'http://localhost:3000'];

createServer(port, serverName, nextServerUrl, otherServers);