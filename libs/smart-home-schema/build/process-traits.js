import { readFileSync } from 'fs';
import YAML from 'yaml';

const getAttributes = (basePath, attributes) => {
  const results = {};

  if (attributes && attributes['$ref']) {
    const attributesJson = JSON.parse(
      readFileSync(`${basePath}/${attributes['$ref']}`, 'utf8')
    );
    // console.log('attributesJson', attributesJson.allOf);

    Object.keys(attributesJson.properties).forEach((key) => {
      const item = attributesJson.properties[key];

      if (key === 'availableThermostatModes') {
        const subItem = item['oneOf'][1];

        console.warn('availableThermostatModes', subItem);
        //
        results[key] = {
          type: subItem.type,
          default: subItem.default,
          description: subItem.description,
          supportedValues: subItem.items.oneOf.map((x) => x.enum[0]),
        };

        // supportedValues
      } else {
        results[key] = {
          type: item.type,
          default: item.default,
          description: item.description,
        };
      }
    });
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
        inner['supportedValues'] = pram[p].oneOf.map((x) => x.enum[0]);
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

  const attributes = getAttributes(basePath, yaml.attributes);
  const states = getAttributes(basePath, yaml.states);

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
