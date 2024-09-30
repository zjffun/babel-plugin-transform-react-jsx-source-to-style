const babel = require("@babel/core");
const plugin = require("../../");

const babelConfig = {
  filename: "/fake/path/mock.js",
  presets: ["@babel/preset-react"],
  plugins: [plugin],
};

it("basic-sample should work", () => {
  const example = `
var x = <div></div>;
var x = <View></View>;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("no-jsx will do nothing", () => {
  const example = `
var x = 42;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("compoent will not add style", () => {
  const example = `
var x = <TestComp />;
var x = <TestComp></TestComp>;
var x = <TestComp style={{color: red}} />;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("with object style should work", () => {
  const example = `
var x = <img style={null} />;
var x = <img style={undefined} />;
var x = <img style={{'--source-code-location': test}} />;
var x = <img style={styleObj} />;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("with string style should work", () => {
  const example = `
var x = <img style="" />;
var x = <img style={""} />;
var x = <img style={0} />;
var x = <img style={1} />;
var x = <img style={"--source-code-location: test"} />;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("with multiple styles shoudl work", () => {
  const example = `
var x = <img style="" style={{'--source-code-location': test}} style={"--source-code-location: test"} />;
var x = <img style="" style={"--source-code-location: test"} style={{'--source-code-location': test}} />;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});


it("with JSXSpreadAttribute will not add style", () => {
  const example = `
var x = <div {...test}></div>;
var x = <View {...test}></View>;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});
