# WebOfThings

This project is a reference implementation of Web of Things using NodeJs.

It supports HTTP(s), MQTT(s), and Kafka protocol.


The security mechanisms supported are:
- Basic Authentication
- Digest Authentication
- Bearer Token
- API Key Authentication
- OAuth2 (Client credential)
- OpenID Connect
- Symmetric and Asymmetric
This project can be used with node-wot i.e., either Thing or consumer can use node-wot and another one can use this implementation and it will be able to communicate with each other.



### Without node-wot client
1. npm install
2. npm run build
3. To start the producer use cmd ``node ./producer.js`` To start the client use cmd ````node ./client.js````


### With node-wot client
1. cd ./node-wot-client
2. npm install
3. cd ..
4. node ./producer.js
5. node ./node-wot-client/client.js

