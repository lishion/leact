const config = {
    verbose: true,
    jest: {
        "moduleFileExtensions": ["js", "jsx"],
        "moduleDirectories": ["src"],
        "moduleNameMapper": {
          "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
          "\\.(gif|ttf|eot|svg)$": "<rootDir>/__mocks__/fileMock.js"
        }
     },
     transform: {
        "\\.[jt]sx?$": "babel-jest"
    }
};
  
module.exports = config;
  
  // Or async function
module.exports = async () => {
    return {
        verbose: true,
    };
};