import { parse } from '@babel/parser';
import { ExpressionStatement, Identifier, Program, Node } from '@babel/types';
import { deviceMappingFunctions } from './devices-props-functions';
import { get } from './utils/helpers';
import { logging } from './utils/logging';

export interface DeviceFromProps {
  domain: string;
  name: string;
  prop: string;
}

const cleanSwitchDomain = (v: string): string =>
  v
    .replaceAll('switch.', '__switch.')
    .replaceAll("'__switch.", "'switch.")
    .replaceAll('"__switch.', '"switch.');

const restoreSwitchDomain = (v: string): string =>
  v.replaceAll('__switch', 'switch');

const resolveType = (node: Node, object: any, resolve: boolean): any => {
  if (node.type === 'StringLiteral') {
    return node.value;
  }

  if (node.type === 'NumericLiteral') {
    return node.value;
  }

  if (node.type === 'MemberExpression') {
    const o = resolveType(node.object, object, resolve);
    const p = resolveType(node.property, object, resolve);
    if (resolve) {
      const r =
        typeof o === 'string' ? get(object, `${o}.${p}`, `${o}.${p}`) : o[p];
      return r;
    }

    if (typeof o === 'string') {
      object[o] = {};
      object[o][p] = {};
      return object[o][p];
    }

    return (o[p] = {});
  }

  if (node.type === 'Identifier') {
    return restoreSwitchDomain(node.name);
  }

  if (node.type === 'CallExpression') {
    return deviceMappingFunctions[(node.callee as Identifier).name](
      ...resolveTypes(node.arguments, object, resolve)
    );
  }

  if (node.type === 'BooleanLiteral') {
    return node.value;
  }

  if (node.type === 'ConditionalExpression') {
    const test = resolveType(node.test, object, resolve);

    return test
      ? resolveType(node.consequent, object, resolve)
      : resolveType(node.alternate, object, resolve);
  }

  if (node.type === 'ArrayExpression') {
    return node.elements.map((x) => {
      return x ? resolveType(x, object, resolve) : undefined;
    });
  }

  if (node.type === 'UnaryExpression') {
    if (node.operator === "!"){
      return !resolveType(node.argument, object, resolve)
    }
    throw `Unknown UnaryExpression ${node.operator}`;
  }

  logging.error('unknown resolveType', node.type, node);
};

const resolveTypes = (nodes: Node[], object: any, resolve: boolean): any[] => {
  return nodes.map((x) => resolveType(x, object, resolve));
};

export const resolveValue = <T>(value: string, object: any): T => {
  const ast = parse(cleanSwitchDomain(value), {
    sourceType: 'module',
    plugins: [],
  });

  const body = (ast.program as Program).body;

  const expressionStatement: ExpressionStatement[] = body.filter(
    (x) => x.type === 'ExpressionStatement'
  ) as ExpressionStatement[];

  const results = expressionStatement.map((x) => {
    const expression = x.expression;
    return resolveType(expression, object, true);
  });
  return results[0];
};

const findReferances = (value: string): { [key: string]: any } => {
  const object = {};
  const ast = parse(value, {
    sourceType: 'module',
    plugins: [],
  });

  const body = (ast.program as Program).body;

  const expressionStatement: ExpressionStatement[] = body.filter(
    (x) => x.type === 'ExpressionStatement'
  ) as ExpressionStatement[];

  expressionStatement.forEach((x) => {
    const expression = x.expression;
    resolveType(expression, object, false);
  });
  return object;
};

export const getDevicesFromProps = (
  stringOrExpression: string
): DeviceFromProps[] | undefined => {
  const deviceProp = cleanSwitchDomain(stringOrExpression);

  const referances = findReferances(deviceProp);

  if (!referances) {
    return;
  }

  const results: DeviceFromProps[] = [];

  Object.keys(referances).forEach((d) => {
    Object.keys(referances[d]).forEach((e) => {
      Object.keys(referances[d][e]).forEach((p) => {
        results.push({
          domain: restoreSwitchDomain(d),
          name: e,
          prop: p,
        });
      });
    });
  });

  return results;
};
