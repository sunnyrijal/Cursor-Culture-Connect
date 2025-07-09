module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'react'
      }]
    ],
    plugins: [
      // Add runtime helpers for better compatibility
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
        useESModules: false
      }],
      // Ensure proper handling of React JSX
      ['@babel/plugin-transform-react-jsx', {
        runtime: 'automatic'
      }],
      // Add reanimated plugin if using react-native-reanimated
      'react-native-reanimated/plugin'
    ]
  };
};