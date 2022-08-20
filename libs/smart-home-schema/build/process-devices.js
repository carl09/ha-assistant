import { readFileSync } from 'fs';
import YAML from 'yaml';

export const parseDevice = (deviceName) => {

    const traitSets = new Set();

    const file = readFileSync(
      `./src/ref/smart-home-schema/types/${deviceName}/index.yaml`,
      'utf8'
    );
  
    const yaml = YAML.parse(file);
    console.log(yaml);
  
    (yaml.traits.recommended || []).forEach((i) => {
      traitSets.add(i);
    });
  
    (yaml.traits.required || []).forEach((i) => {
      traitSets.add(i);
    });
  
    return {
      type: yaml.name,
      humanName: yaml.shortname,
      traits: yaml.traits.required,
      traitSets
    };
  };
