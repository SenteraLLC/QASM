// API utilities 
import axios from 'axios';
import { local_env } from "./constants.js"

/**
 * Hit a terraform API endpoint and return the response.
 * 
 * @param {*} params Params to pass to the API
 * @param {*} endpoint Endpoint to hit
 */
export async function hit_terraform_api(params, endpoint) {
    // Remove leading slash from endpoint
    if (endpoint[0] === "/") {
        endpoint = endpoint.slice(1);
    }

    return await axios({
        method: "post",
        url: local_env.API_URL + endpoint,
        data: params,
    })
}

/**
 * Util to consolidate API function calls.
 * @param {*} params Params to pass to the API endpoint.
 * @param {*} endpoint Endpoint to hit
 * @param {*} data_key Key to pull data from 
 * @returns API response
 */
 export async function api_consolidator(params, endpoint, data_key=null) {
    let response = await hit_terraform_api(params, endpoint);
    if (data_key == null) {
        return response.data
    } else {
        return response.data[data_key];
    }
    
}

/**
 * Util to consolidate API function calls, with an error handler and optional callback.
 * 
 * @param {*} params Params to pass to the API endpoint.
 * @param {*} endpoint Endpoint to hit
 * @param {*} data_key Key to pull data from 
 * @param {*} callback Optional callback to run upon completion. 
 * @returns Response or error message
 */
export async function api_consolidator_error_handler(params, endpoint, data_key=null, callback=null) {
    try {
        let response = api_consolidator(params, endpoint, data_key);
        if (callback) {
            return callback(response);
        }
        return response;
    }
    catch (error) {
        console.log("Error calling API endpoint: " + endpoint);
        console.error(error);
        return null;
    }
}