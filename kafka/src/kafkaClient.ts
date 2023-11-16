
import { KafkaBrokerServerConfig } from './types';
import {WebOfThing} from "./server"
import { Kafka, Producer, Consumer, ConsumerSubscribeTopics, logLevel } from 'kafkajs'

//var messageBus =require('./eventHandler')
var i = 1
var messageBus = require('./eventHandler')
const actionEmitter = require("./actionHandler")



const { exec } = require('child_process');

export class WoTKafkaClientServer {
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
    this.config = config ?? { uri: "localhost:9092" };
    this.producer = this.createProducer()
    this.consumer = this.createKafkaConsumer()
  }

  private createProducer(): Producer {
    const kafka = new Kafka(this.config
      /*{
      clientId: this.config.clientId,
      brokers: [this.config.brokers],
      logLevel: logLevel.NOTHING,
    }*/
    )

    return kafka.producer()
  }

  private createKafkaConsumer(): Consumer {
    const kafka = new Kafka(this.config /*{
      clientId: this.config.clientId,
      brokers: [this.config.brokers],
      logLevel: logLevel.NOTHING,
    }*/)
    const consumer = kafka.consumer({ groupId: 'consumer-group-client' })
    return consumer
  }

  expose(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      let actionList = this.things.getThing().getActionDescriptions()
      for (let actionName in actionList) {
        var addMessageListener = () => {
          actionEmitter.invokeAction.on(actionName, async (load: any) => {
            //console.log('help ' + (load))
            let actionTopic = "actions-" + actionList[actionName].forms[0]['href'].split("/")[1]
            await this.producer.send({
              topic: actionTopic,
              messages: [
                {
                  key: "actions" + String(i++),
                  value: Object.keys(load).length > 0 ? JSON.stringify(load) : "",
                },
              ],
            })
          })
        }
        addMessageListener()
        //this.broker?.subscribe(topic)
      }
      let eventList = this.things.getThing().getEventDescriptions()
      for (let eventName in eventList) {
        //console.log(eventName)
        //console.log(eventList[eventName].forms[0]['href'])
        let eventTopic = "events-" + eventList[eventName].forms[0]['href'].split("/")[1]
        let topic: ConsumerSubscribeTopics = {
          topics: [eventTopic],
          fromBeginning: false
        }
        //console.log(topic)
        await this.consumer.subscribe(topic)

      }

      if (this.consumer !== undefined) {
        //this.consumer.run("message", this.handleMessage.bind(this));
        await this.consumer.run({
          // this function is called every time the consumer gets a new message
          eachMessage: async ({ topic, message }) => {
            //const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
            if (topic.split("-")[0] === "events") {
              messageBus.emitEvent.emit(topic.split("-")[1], message.value)
            }
            //this.handleMessage.bind(this)
          },
        })
      }
      resolve();
    })
  }


  start(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      try {
        await this.producer.connect()
        await this.consumer.connect()
        console.log("WoT Client started successfully")
        //this.expose()
        resolve()
      } catch (error) {
        console.log('Error connecting the producer: ', error)
      }
    });
  }

  async stop(): Promise<void> {
    await this.producer.disconnect()
    const dockerCommand = 'docker-compose -f ' + this.config.docker + "  down";
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