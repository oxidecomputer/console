module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { browsers: "last 1 version" } }],
    "@babel/preset-react",
  ],
  plugins: ["react-hot-loader/babel"],
};
