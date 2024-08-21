const createServer = require('./logic');

const port = 3001;
const serverName = 'server2';
const nextServerUrl = 'http://localhost:3002/increment';
const otherServers = ['http://localhost:3000', 'http://localhost:3002'];

createServer(port, serverName, nextServerUrl, otherServers);