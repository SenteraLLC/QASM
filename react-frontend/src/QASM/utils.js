// Utils

/**
 * Call a backend function and log the response
 * 
 * @param {*} window active window
 * @param {*} function_name function name listed in electron_constants.js
 * @param {*} data data to be sent to the backend
 */
exports.call_backend = async (window, function_name, data) => {
    return await window.electron.invoke(function_name, data);
}