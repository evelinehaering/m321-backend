const createServer = require('./logic');

const port = 3000;
const serverName = 'server1';
const nextServerUrl = 'http://localhost:3001/increment';
const otherServers = ['http://localhost:3001', 'http://localhost:3002'];

createServer(port, serverName, nextServerUrl, otherServers);
