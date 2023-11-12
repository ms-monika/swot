
import Ajv from 'ajv';
import Thing from './things';


const ajv = new Ajv();

export function verifyThingId(storeThingsId: Array<Thing>, idToVerify: string) {
  let validate = false
  let thingsRunning = storeThingsId;
  thingsRunning.forEach(td => {
    if (td.id == idToVerify) {
      validate = true
    }
  });
  return validate;

}

export function verifyProtocolSecurity(secConf: JSON, storedSecConfig: any) {
  //var validate = ajv.compile(storedSecConfig);
  return ajv.validate(storedSecConfig, secConf)
}
