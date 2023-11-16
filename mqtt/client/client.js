var tls = require('tls');
var fs = require('fs');
const ciphers = ['ECDHE-RSA-AES128-GCM-SHA256'];
const sslOptions = {
  ciphers: ciphers.join(':'),
  // Other SSL/TLS options
};
var options = {
  // These are necessary only if using the client certificate authentication (so yeah, you need them)
  key: fs.readFileSync('client-private-key.pem'),
  cert: fs.readFileSync('client-certificate.pem'),
  requestCert: true,
  secureOptions: sslOptions
};

var cleartextStream = tls.connect(443, options, function() {
  console.log('client connected',
              cleartextStream.authorized ? 'authorized' : 'unauthorized');
  process.stdin.pipe(cleartextStream);
  process.stdin.resume();
});
cleartextStream.setEncoding('utf8');
cleartextStream.on('data', function(data) {
  console.log(data);
});
cleartextStream.on('end', function() {
  server.close();
});