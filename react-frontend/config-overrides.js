const { override, removeModuleScopePlugin } = require('customize-cra')

module.exports = override(
    // Allow importing outside of /src
    removeModuleScopePlugin(), 

    // Allow use of await when building the app
    function (config) {
        config.experiments = {
            topLevelAwait: true
        }
        return config
    }
);    