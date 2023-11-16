keytool -keystore kafka.server.keystore.jks -alias localhost -keyalg RSA -validity 365 -genkey
keytool -keystore kafka.client.keystore.jks -alias localhost -keyalg RSA -validity 365 -genkey 

openssl req -new -x509 -keyout ca-key -out ca-cert -days 365
keytool -keystore kafka.client.truststore.jks -alias CARoot -importcert -file ca-cert
keytool -keystore kafka.server.truststore.jks -alias CARoot -importcert -file ca-cert


keytool -keystore kafka.server.keystore.jks -alias localhost -certreq -file cert-file
openssl x509 -req -CA ca-cert -CAkey ca-key -in cert-file -out cert-signed -days 365 -CAcreateserial -passin pass:monika
keytool -keystore kafka.server.keystore.jks -alias CARoot -importcert -file ca-cert
keytool -keystore kafka.server.keystore.jks -alias localhost -importcert -file cert-signed


keytool -keystore kafka.client.keystore.jks -alias localhost -certreq -file cert-file
openssl x509 -req -CA ca-cert -CAkey ca-key -in cert-file -out cert-signed -days 365 -CAcreateserial -passin pass:monika
keytool -keystore kafka.client.keystore.jks -alias CARoot -importcert -file ca-cert
keytool -keystore kafka.client.keystore.jks -alias localhost -importcert -file cert-signed