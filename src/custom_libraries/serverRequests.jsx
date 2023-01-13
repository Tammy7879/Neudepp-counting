import globalVariables from "./globalVariables";
import urls from "./urls";

export async function get(url, headers = {}) {
    await getFreshToken()
    if (Object.keys(headers).length === 0) {
        headers = {
            'Authorization': `Bearer ${localStorage.getItem(globalVariables.AUTH_TOKEN)}`,
            'Content-Type': 'application/json'
        }
    }
    try {
        const response = await fetch(url, {
            headers: headers,
            method: 'GET',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        // handle error
        console.log(error);
        return false;
    }
}

export async function post(url, post_data = {}, headers = {}) {
    await getFreshToken()
    if (Object.keys(headers).length === 0) {
        headers = {
            'Authorization': `Bearer ${localStorage.getItem(globalVariables.AUTH_TOKEN)}`,
            'Content-Type': 'application/json'
        }
    }
    try {
        const response = await fetch(url, {
            headers: headers,
            method: 'POST',
            body: post_data,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        // handle error
        console.log(error);
        return false;
    }
}

export async function getFreshToken() {
    let refresh_token = localStorage.getItem(globalVariables.REFRESH_TOKEN)
    if (refresh_token === null) {
        return false
    }
    let headers = {
        "Authorization": `Bearer ${refresh_token}`,
        'content-type': 'application/json'
    }
    try {
        const response = await fetch(urls.TOKEN_REFRESH, {
            headers: headers,
            method: 'POST',
            body: {},
        });
        const data = await response.json();
        if (data['success']) {
            localStorage.setItem(globalVariables.AUTH_TOKEN, data['access_token'])
            return true
        }
        else {
            localStorage.clear()
            window.location.replace('/')
            return false
        }
        // return data
    } catch (error) {
        // handle error
        console.log(error);
        return false
    }
}