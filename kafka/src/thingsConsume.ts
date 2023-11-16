
import Thing from './things';
import Property from './property'
import Action from './action';
import Event from './event';

class ThingsConsume extends Thing {
    constructor(td:any) {
        super(td.id, td.title, td.description);
        let metaData:any = {}
        if(td.hasOwnProperty("securityDefinitions") && td.hasOwnProperty("security")) {
            this.setsecurity(td.securityDefinitions, td.security)
        } else {
            let def = {
                nosec_sc: {
                    scheme: 'nosec',
                },
            };
            this.setsecurity(def,'nosec_sc')
        }
        //console.log(typeof td.properties + " " + Object.keys(td.properties).length);
        for (const property in td.properties) {
            metaData = {}
            // adding the property
            Object.entries(td.properties[property]).forEach(([key, value]) => {
                metaData[key] = value
            })
            this.addProperty(
                new Property(this, property, null, metaData)
            );
        }
        // adding the actions
        if (Object.keys(td.actions).length > 0) {
            for (const action in td.actions) {
                metaData = {}
                Object.entries(td.actions[action]).forEach(([key, value]) => {
                    metaData[key] = value
                })
                this.addAction(
                    new Action (action, metaData)
                );
            }
        }
        if (Object.keys(td.events).length > 0) {
            // adding the events
            for (const event in td.events) {
                metaData = {}
                Object.entries(td.events[event]).forEach(([key, value]) => {
                    metaData[key] = value
                })
                this.addEvent(
                    new Event (event, metaData)
                );
            }
        }
    }
}
module.exports = ThingsConsume