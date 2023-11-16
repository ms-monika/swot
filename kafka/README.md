## KAFKA Protocol for Web of Things

### Setup:
- For a broker, there are two options either use a docker file, confluent cloud, or a local setup. Please ref: https://developer.confluent.io/quickstart/kafka-local/ 
- In this code, we are using the docker file for the broker.
- For Windows, please install docker windows first.
- Run npm install
- The docker file can be created based on the requirements of the application. In this code, we are using 1 Kafka broker and 1 zookeeper.
- Start the docker file using the command 
``` 
docker-compose -f <filename> up or docker-compose up -d 
```
- After starting, you can see Zookeeper and Kafka running inside the Sasl container in the docker desktop.
- Run the following cmd to start the producer and consumer
``` 
node producer.js 
```
``` 
node consumer.js
 ```

### Security Schemes supported:

- PLAIN
    - To get the list of topics ``` docker exec kafka_sasl kafka-topics --bootstrap-server kafka_sasl:9093 --list 
--command-config /etc/kafka/secrets/configs.properties ```

- PLAIN_SSL
    - For an SSL connection, we need to generate keys and a certificate. 
    - Follow the instruction mentioned in https://docs.confluent.io/platform/current/security/security_tutorial.html#generate-the-keys-and-certificates to generate keys and certificates.

- SSL
    - While creating the certificate please use localhost as the CN value.
    - docker exec kafka kafka-topics --bootstrap-server localhost:9093 --create --topic setActionHandler --command-config /etc/kafka/secrets/client.properties

- SCRAM

### Important points
- we need to create topics before the consumer and producer can communicate with each other. To automate this please add the below configuration to the docker file. 
``` KAFKA_AUTO_CREATE_TOPICS_ENABLE: TRUE```
- Producers can only publish and consumers can only consume.

- To list all the topics use 
``` docker exec <broker-name> kafka-topics --bootstrap-server <broker-name>:port --list```

- To create a topic (ref: https://developer.confluent.io/quickstart/kafka-docker/)
``` docker exec <broker-name> kafka-topics --bootstrap-server <broker-name>:port --create --topic <topic-name>```




``` References to consider
1. https://www.confluent.io/blog/kafka-without-zookeeper-a-sneak-peek/
2. https://www.confluent.io/blog/removing-zookeeper-dependency-in-kafka/
```
