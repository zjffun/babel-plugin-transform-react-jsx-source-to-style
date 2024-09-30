/**
 * This adds style['--source-code-location'] to JSX tags.
 *
 * NOTE: lineNumber and columnNumber are both 1-based.
 *
 * == JSX Literals ==
 *
 * <sometag />
 *
 * becomes:
 *
 * var __jsxFileName = 'this/file.js';
 * <sometag style={{'--source-code-location': `${__jsxFileName}:${lineNumber}:${columnNumber}`}}/>
 */
import { declare } from "@babel/helper-plugin-utils";
import { types as t, template } from "@babel/core";

import htmlTags from "./htmlTags";
import taroComponentNames from "./taroComponentNames";

const TRACE_ID = "--source-code-location";
const FILE_NAME_VAR = "_jsxFileName";

// Taro Components or HTML tags
const atomicNodeName = [...taroComponentNames, ...htmlTags];

const createNodeFromNullish = <T, N extends t.Node>(
  val: T | null,
  fn: (val: T) => N,
): N | t.NullLiteral => (val == null ? t.nullLiteral() : fn(val));

type State = {
  fileNameIdentifier: t.Identifier;
};
export default declare<State>((api) => {
  api.assertVersion(7);

  function makeSourceCodeLocationString(
    fileNameIdentifier: t.Identifier,
    { line, column }: { line: number; column: number },
  ) {
    const fileLineLiteral = createNodeFromNullish(line, t.numericLiteral);
    const fileColumnLiteral = createNodeFromNullish(column, (c) =>
      // c + 1 to make it 1-based instead of 0-based.
      t.numericLiteral(c + 1),
    );

    return template.expression
      .ast`${fileNameIdentifier}+':'+${fileLineLiteral}+':'+${fileColumnLiteral}`;
  }

  function makeStyleString(
    fileNameIdentifier: t.Identifier,
    { line, column }: { line: number; column: number },
  ) {
    const sourceCodeLocationStrAst = makeSourceCodeLocationString(
      fileNameIdentifier,
      { line, column },
    );
    const styleStringAst = template.expression(
      `'${TRACE_ID}:' + SOURCE_CODE_LOCATION_STRING + ';'`,
    )({
      SOURCE_CODE_LOCATION_STRING: sourceCodeLocationStrAst,
    });

    return styleStringAst;
  }

  function makeTrace(
    fileNameIdentifier: t.Identifier,
    { line, column }: { line: number; column: number },
  ) {
    const sourceCodeLocationStrAst = makeSourceCodeLocationString(
      fileNameIdentifier,
      { line, column },
    );
    const styleAst = template.expression(
      `{'${TRACE_ID}': SOURCE_CODE_LOCATION_STRING}`,
    )({
      SOURCE_CODE_LOCATION_STRING: sourceCodeLocationStrAst,
    });

    return styleAst;
  }

  const isStyleAttr = (attr: t.Node) =>
    t.isJSXAttribute(attr) && attr.name.name === "style";

  return {
    name: "transform-react-jsx-source-to-style",
    visitor: {
      JSXOpeningElement(path, state) {
        const { node } = path;
        if (
          // the element was generated and doesn't have location information
          !node.loc ||
          // the element is not a atomic node (i.e. a component)
          !atomicNodeName.includes(node.name.name)
        ) {
          return;
        }

        let lastStyleAttr;
        for (const attr of node.attributes) {
          if (t.isJSXSpreadAttribute(attr)) {
            // JSXSpreadAttribute may contain a style, so style will not added when meet JSXSpreadAttribute
            return;
          }

          if (isStyleAttr(attr)) {
            lastStyleAttr = attr;
          }
        }

        if (!state.fileNameIdentifier) {
          const fileNameId = path.scope.generateUidIdentifier(FILE_NAME_VAR);
          state.fileNameIdentifier = fileNameId;

          path.scope.getProgramParent().push({
            id: fileNameId,
            init: t.stringLiteral(state.filename || ""),
          });
        }

        if (lastStyleAttr) {
          const value = lastStyleAttr.value;
          if (t.isJSXExpressionContainer(value)) {
            const expression = value.expression;
            if (
              t.isObjectExpression(expression) ||
              t.isIdentifier(expression) ||
              t.isNullLiteral(expression)
            ) {
              const trace = makeTrace(state.fileNameIdentifier, node.loc.start);

              const newExpression = template.expression(
                `Object.assign(SOURCE_CODE_LOCATION_OBJECT, ORIGINAL_VALUE)`,
              )({
                SOURCE_CODE_LOCATION_OBJECT: trace,
                ORIGINAL_VALUE: expression,
              });

              value.expression = newExpression;
            } else if (
              t.isStringLiteral(expression) ||
              t.isNumericLiteral(expression)
            ) {
              const styleStringAst = makeStyleString(
                state.fileNameIdentifier,
                node.loc.start,
              );

              const newExpression = template.expression(
                `STYLE_STRING + ORIGINAL_VALUE`,
              )({
                STYLE_STRING: styleStringAst,
                ORIGINAL_VALUE: expression,
              });

              value.expression = newExpression;
            }
          } else if (t.isStringLiteral(value)) {
            const styleStringAst = makeStyleString(
              state.fileNameIdentifier,
              node.loc.start,
            );

            const expressionAst = template.expression(
              `STYLE_STRING + ORIGINAL_VALUE`,
            )({
              STYLE_STRING: styleStringAst,
              ORIGINAL_VALUE: value,
            });

            const newValue = t.jsxExpressionContainer(expressionAst);

            lastStyleAttr.value = newValue;
          }
        } else {
          node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier("style"),
              t.jsxExpressionContainer(
                makeTrace(state.fileNameIdentifier, node.loc.start),
              ),
            ),
          );
        }
      },
    },
  };
});
