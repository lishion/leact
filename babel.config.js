module.exports = {
  "presets": [
    [
      "@babel/preset-react",
      {
        "pragma": "Leact.createElement", // default pragma is React.createElement (only in classic runtime)
        "pragmaFrag": "Leact.Fragment", // default is React.Fragment (only in classic runtime)
        "throwIfNamespace": false, // defaults to true
        "runtime": "classic" // defaults to classic
      }
    ],
    [
      '@babel/preset-env', 
      { targets: { node: 'current' } }
    ],
    '@babel/preset-typescript',
  ]
}