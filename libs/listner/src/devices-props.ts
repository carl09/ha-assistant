import { parse } from '@babel/parser';
import { ExpressionStatement, Identifier, Program, Node } from '@babel/types';

export interface DeviceFromProps {
  domain: string;
  name: string;
  prop: string;
}

const cleanSwitchDomain = (v: string): string =>
  v.replace('switch.', '__switch.');

const restoreSwitchDomain = (v: string): string =>
  v.replace('__switch', 'switch');

const fn: { [key: string]: (...args: any[]) => any } = {
  equals: (...args: any[]) => {
    // console.log('equals', args);
    return args[0] === args[1];
  },
  toNum: (...args: any[]) => {
    // console.log('toNum', args[0]);
    return parseFloat(args[0]);
  },
  toInt: (...args: any[]) => {
    // console.log('toInt', args[0]);
    return parseInt(args[0]);
  }
};

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
      const r = typeof o === 'string' ? object[o][p] : o[p];
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
    return fn[(node.callee as Identifier).name](
      ...resolveTypes(node.arguments, object, resolve)
    );
  }

  console.error('resolveType', node.type, node);
};

const resolveTypes = (nodes: Node[], object: any, resolve: boolean): any[] => {
  return nodes.map((x) => resolveType(x, object, resolve));
};

export const resolveValue = (value: string, object: any) => {
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

  // console.log('getDevicesFromProps.referances', referances);

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
