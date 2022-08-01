import { parser } from './simple.grammar';
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent,
} from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';

export const EXAMPLELanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({ closing: ')', align: false }),
      }),
      foldNodeProp.add({
        Application: foldInside,
      }),
      styleTags({
        Identifier: t.variableName,
        Boolean: t.bool,
        String: t.string,
        Number: t.number,

        BooleanLiteral: t.bool,
        VariableName: t.variableName,
        PropertyName: t.propertyName,
        MemberExpression: t.propertyName,
        '( )': t.paren,
        "[ ]": t.squareBracket,
        ", ;": t.separator,
        "CallExpression/VariableName": t.function(t.variableName),
        "CallExpression/MemberExpression/PropertyName": t.function(t.propertyName),
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: ';' },
  },
});

export function EXAMPLE() {
  return new LanguageSupport(EXAMPLELanguage);
}
