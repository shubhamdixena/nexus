// @ts-check
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('metro-config').ConfigT} */
module.exports = (() => {
  const projectRoot = __dirname
  const workspaceRoot = path.resolve(projectRoot, '..')

  const config = getDefaultConfig(projectRoot)

  // Allow importing from workspace (../shared, etc.)
  config.watchFolders = [workspaceRoot]
  const resolver = config.resolver || /** @type {any} */({})
  resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ]

  // Support ts/tsx from monorepo
  resolver.sourceExts = [
    'expo.ts',
    'expo.tsx',
    'expo.js',
    'expo.jsx',
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'cjs',
    'mjs',
  ]

  // Assign back if we created a new object
  // @ts-ignore - resolver may be read-only in types but is mutable in runtime
  config.resolver = resolver

  return config
})()
