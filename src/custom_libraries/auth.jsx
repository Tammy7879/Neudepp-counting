import urls from "./urls"
import globalVariables from "./globalVariables"
import { post } from './serverRequests'

// export async function getFreshToken() {
//     let refresh_token = localStorage.getItem(globalVariables.REFRESH_TOKEN)
//     if (refresh_token === null) {
//         return false
//     }
//     let headers = {
//         "Authorization": `Bearer ${refresh_token}`,
//         'content-type': 'application/json'
//     }
//     let data = await post(urls.TOKEN_REFRESH, headers);
//     if (data !== false) {
//         // console.log(data)
//         if (data['success']) {
//             localStorage.setItem(globalVariables.AUTH_TOKEN, data['access_token'])
//             return true
//         }
//         else {
//             localStorage.clear()
//             window.location.replace('/')
//             return false
//         }
//     }
//     else {
//         return false
//     }
// }


export async function signOut(history) {
    let refresh_token = localStorage.getItem(globalVariables.REFRESH_TOKEN)
    let headers = {
        "Authorization": `Bearer ${refresh_token}`,
        'content-type': 'application/json'
    }
    let post_data = {}
    let data = await post(urls.SIGNOUT, post_data, headers);
    if (data !== false) {
        // console.log(data)
        if (data['success']) {
            let ip_address = localStorage.getItem(globalVariables.IP_ADDRESS)
            localStorage.clear();
            localStorage.setItem(globalVariables.IP_ADDRESS, ip_address)
            // window.location.replace("/sign_in");
            history.replace("/sign_in")
        }
        else {
            alert(data['message'])
        }
    }
    else {
        alert('Some thing went wrong. Please try again !!!')
    }
}