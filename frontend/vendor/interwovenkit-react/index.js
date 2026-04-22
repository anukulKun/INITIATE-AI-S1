const React = require("react");

function InterwovenKitProvider({ children }) {
  return React.createElement(React.Fragment, null, children);
}

module.exports = {
  InterwovenKitProvider,
};