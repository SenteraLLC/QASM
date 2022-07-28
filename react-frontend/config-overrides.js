const { removeModuleScopePlugin } = require('customize-cra')

// Allow importing outside of /src
module.exports = removeModuleScopePlugin()