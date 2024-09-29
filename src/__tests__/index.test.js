const babel = require("@babel/core");
const plugin = require("../../");

const babelConfig = {
  filename: "/fake/path/mock.js",
  presets: ["@babel/preset-react"],
  plugins: [plugin],
};

it("basic-sample", () => {
  const example = `
var x = <sometag />;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("no-jsx", () => {
  const example = `
var x = 42;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("with-style add assign object style", () => {
  const example = `
var x = <sometag style={null} />;
var x = <sometag style={undefined} />;
var x = <sometag style={{'--source-code-location': test}} />;
var x = <sometag style={styleObj} />;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});

it("with-style add add string style", () => {
  const example = `
var x = <sometag style="" />;
var x = <sometag style={""} />;
var x = <sometag style={0} />;
var x = <sometag style={1} />;
var x = <sometag style={"--source-code-location: test"} />;
`;
  const { code } = babel.transform(example, babelConfig);
  expect(code).toMatchSnapshot();
});
