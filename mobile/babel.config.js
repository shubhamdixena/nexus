module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@shared': '../shared',
          },
        },
      ],
      // NOTE: Must be last
      'react-native-reanimated/plugin',
    ],
  }
}
