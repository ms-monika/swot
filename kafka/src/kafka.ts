


//import Thing from './things';
import { KafkaBrokerServerConfig } from './types';
import {WebOfThing} from "./server"
import { Kafka, Producer,Consumer, ConsumerSubscribeTopics, logLevel} from 'kafkajs'

//var messageBus =require('./eventHandler')
var i=1
var messageBus = require('./eventHandler')
const actionEmitter = require("./actionHandler")

/*export class WebOfThing {
    private thing: Thing;

    constructor(thing: Thing) {
        this.thing = thing;
    }
    getThing(): Thing {
        return this.thing;
    }

}*/

const { exec } = require('child_process');
export class WoTKafkaServer {
    readonly scheme: string = "kafka";
    things: WebOfThing;
    brokerURI!: string;
    private producer: Producer;
    private consumer: Consumer;
    config: KafkaBrokerServerConfig;
    

    constructor(
        things: WebOfThing,
        config: KafkaBrokerServerConfig
    ) {
        this.things = things;
        this.config = config ;
        this.producer = this.createProducer()   
        this.consumer = this.createKafkaConsumer()    
    }

    private createProducer() : Producer {
        const kafka = new Kafka(this.config
          //{
            //clientId: this.config.clientId,
            //brokers: [this.config.brokers],
            //logLevel: logLevel.NOTHING,
        //}
        )
    
        return kafka.producer()
      }

      private createKafkaConsumer(): Consumer {
        this.config
        const kafka = new Kafka(this.config
          //{ 
            //clientId: this.config.clientId,
            //brokers: [this.config.brokers],
            //logLevel: logLevel.NOTHING,
        //}
        )
        const consumer = kafka.consumer({ groupId: 'consumer-group' })
        return consumer
      }

     expose(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            let actionList = this.things.getThing().getActionDescriptions()
            for (let action in actionList) {
                let actionTopic = "actions-" + actionList[action].forms[0]['href'].split("/")[1]
                let topic: ConsumerSubscribeTopics = {
                    topics: [actionTopic],
                    fromBeginning: true
                  } 
                //console.log("Action topic: " + topic)
                await this.consumer.subscribe(topic)
                //this.broker?.subscribe(topic)
            }
            let eventList = this.things.getThing().getEventDescriptions()
            for (let eventName in eventList) {
                //console.log("Event name:")
                //console.log(eventName)
                var addMessageListener = () => {
                    //console.log(eventList[eventName].forms[0]['href'])
                    messageBus.emitEvent.on(eventName, async (load:any) => {    
                        //console.log("Emit event is triggered. Publishing to the subscribers subscribed to topic: " + eventName)                    
                        let eventTopic = "events-" + eventList[eventName].forms[0]['href'].split("/")[1]
                        await this.producer.send({
                            topic: eventTopic,
                            messages: [
                                {
                                    key: "events" + + String(i++),
                                    value: Object.keys(load).length > 0 ? JSON.stringify(load) : "",
                                },
                            ],
                        })
                    })
                }
                addMessageListener()

            }
            if (this.consumer !== undefined) {
              //this.consumer.run("message", this.handleMessage.bind(this));
              await this.consumer.run({
                  // this function is called every time the consumer gets a new message
                  eachMessage: async ({ topic, message }) => {
                      //const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
                      //console.log(`- ${prefix} ${message.key}#${message.value}`)
                      if(topic.split("-")[0] === "actions") {
                          actionEmitter.invokeAction.emit(topic.split("-")[1], message.value)
                      }
                      //this.handleMessage.bind(this)
                    },
              })
          }
            resolve();
        })
    }


    start(): Promise<void> {
        return new Promise<void>(async (resolve, rejects) => {
            /*const dockerCommand = 'docker-compose -f '+ this.config.docker +"  up -d";
            const childProcess = exec(dockerCommand, (error: { message: any; }, stdout: any, stderr: any) => {
                if (error) {
                  console.error(`Error executing Docker command: ${error.message}`);
                  return;
                }
                if (stderr) {
                  console.error(`Docker command stderr: ${stderr}`);
                  return;
                }
                console.log(`Docker command stdout: ${stdout}`);
                
              });
               
              childProcess.on('exit', async (code: number, signal: any) => {
                if (code === 0) {*/
                  //console.log('Command execution successful');
                  try {
                    await this.producer.connect()
                    await this.consumer.connect()
                    console.log("Wot Server Started")
                    //await this.expose()
                    resolve()
                  } catch (error) {
                    console.log('Error connecting the producer: ', error)
                    rejects()
                  }
                  

                /*} else {
                  console.error(`Command execution failed with code ${code} and signal ${signal}`);
                }
            });*/
        });
    }

    async stop(): Promise<void> {
        await this.producer.disconnect()
        const dockerCommand = 'docker-compose -f '+ this.config.docker +"  down";
        exec(dockerCommand, (error: { message: any; }, stdout: any, stderr: any) => {
            if (error) {
              console.error(`Error executing Docker command: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Docker command stderr: ${stderr}`);
              return;
            }
            console.log(`Docker command stdout: ${stdout}`);
          });
    }
}
