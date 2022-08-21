import { readFileSync } from 'fs';
import YAML from 'yaml';

const processItem = (key, item) => {
  if (key === 'availableThermostatModes') {
    const subItem = item['oneOf'][1];
    return {
      type: subItem.type,
      default: subItem.default,
      description: subItem.description,
      supportedValues: subItem.items.oneOf.map((x) => x.enum[0]),
    };
  }

  if (key === 'thermostatMode') {
    return {
      type: item.type,
      default: item.default,
      description: item.description,
      supportedValues: item.oneOf.map((x) => x.enum[0]),
    };
  }

  return {
    type: item.type,
    default: item.default,
    description: item.description,
  };
};

const getAttributes = (name, basePath, attributes) => {
  const results = {};

  if (attributes && attributes['$ref']) {
    const attributesJson = JSON.parse(
      readFileSync(`${basePath}/${attributes['$ref']}`, 'utf8')
    );

    Object.keys(attributesJson.properties).forEach((key) => {
      const item = attributesJson.properties[key];

      results[key] = processItem(key, item);
    });

    if (attributesJson.oneOf) {
      if (name === 'TemperatureSetting') {
        Object.keys(attributesJson.oneOf[0].properties).forEach((key) => {
          const item = attributesJson.oneOf[0].properties[key];

          results[key] = processItem(key, item);
        });
      } else {
        console.log('getAttributes oneOf', name);
      }
    }
  } else {
    // throw 'No Attributes';
  }
  return results;
};

const getParams = (properties) => {
  const keepKeys = ['description', 'type'];

  return Object.keys(properties || {}).reduce((acc, key) => {
    const pram = properties[key];

    acc[key] = Object.keys(pram).reduce((inner, p) => {
      if (keepKeys.includes(p)) {
        inner[p] = pram[p];
      } else if (p === 'oneOf') {
        // inner['type'] = 'string';
        inner['supportedValues'] = pram[p].map((x) => x.enum[0]);
      } else if (p === 'items') {
        // inner['type'] = 'string';
        if (pram[p].oneOf && Array.isArray(pram[p].oneOf)) {
          inner['supportedValues'] = pram[p].oneOf.map((x) => x.enum[0]);
        }
      } else {
        console.log('getParams pram', p, pram[p]);
      }

      return inner;
    }, {});

    return acc;
  }, {});
};

const getCommands = (basePath, commands) => {
  const results = Object.keys(commands || {}).reduce((acc, k) => {
    const item = commands[k];

    const params = JSON.parse(
      readFileSync(`${basePath}/${item.params['$ref']}`, 'utf8')
    );

    // console.log('params', params);

    acc[k] = {
      command: k,
      params: getParams(params.properties),
    };

    return acc;
  }, {});

  return results;
};

export const parseTraits = (acc, traitName) => {
  const basePath = `./src/ref/smart-home-schema/traits/${traitName}`;

  const file = readFileSync(`${basePath}/index.yaml`, 'utf8');

  const yaml = YAML.parse(file);
  // console.log(yaml);

  const attributes = getAttributes(traitName, basePath, yaml.attributes);
  const states = getAttributes(traitName, basePath, yaml.states);

  const commands = getCommands(basePath, yaml.commands);

  acc[yaml.name] = {
    type: yaml.name,
    humanName: yaml.shortname,
    states: states,
    attributes: attributes,
    commands: Object.values(commands),
  };

  return acc;
};
