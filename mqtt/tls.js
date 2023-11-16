const https = require('https');
const fs = require('fs');
const tls = require('tls');

const ciphers = ['ECDHE-RSA-AES128-GCM-SHA256'];
const sslOptions = {
  ciphers: ciphers.join(':'),
  // Other SSL/TLS options
};

// Create a custom SSL context for the server
const serverOptions = {
  key: fs.readFileSync('server-private-key.pem'),
  cert: fs.readFileSync('server-certificate.pem'),
  // Specify the SSL/TLS options for the server
  secureOptions: sslOptions
};

const server = https.createServer(serverOptions, (req, res) => {
  res.writeHead(200);
  res.end('Hello World!');
});

// Create a custom SSL context for the client
const clientOptions = {
  hostname: 'localhost',
  port: 443,
  path: '/',
  method: 'GET',
  // Specify the SSL/TLS options for the client
  secureContext: tls.createSecureContext(sslOptions),
  // Other HTTPS options
};

const req = https.request(clientOptions, (res) => {
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
