const { removeModuleScopePlugin } = require('customize-cra')

// Allow importing outside of /src
module.exports = removeModuleScopePlugin(); 

// module.exports = function override (config) {
    
//     // Allow use of await when building the app
//     config.experiments = {
//         topLevelAwait: true
//     }
//     // return config
// }