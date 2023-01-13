

export function isEmpty(data) {
    let trim_data = data.map((s) => s.toString().trim());
    // data.map(function(s:any) { return s.trim() });
    if (trim_data.includes("")) {
        return true
    }
    else {
        return false
    }
}

export function displayDateTime() {
    let date = new Date()
    let str_date = date.toLocaleString([], {
        hour12: true,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
    return str_date.toUpperCase()
}

export function currentDateTime() {
    let date = new Date()
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

export function dateToString(date, is_time = false) {
    let local_dt = date.toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).split(',')
    let dt = local_dt[0].split('/')
    let str_date = `${dt[2]}-${dt[1]}-${dt[0]}`
    let str_tm = local_dt[1].trim()
    if (is_time) {
        return str_date + ' ' + str_tm;
    }
    return str_date;
}

export function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function removeDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

export function getCurrentWeek(curr_date) {
    let firstday = new Date(curr_date.setDate(curr_date.getDate() - curr_date.getDay()));
    let lastday = new Date(curr_date.setDate(curr_date.getDate() - curr_date.getDay() + 6));
    return {
        'firstday': firstday,
        'lastday': lastday
    }
}

export function getCurrentMonth(curr_date) {
    let m = curr_date.getMonth();
    let y = curr_date.getFullYear()
    let firstday = new Date(y, m, 1);
    let lastday = new Date(y, m + 1, 0);
    return {
        'firstday': firstday,
        'lastday': lastday
    }
}

export function dateToISOLikeButLocal(date) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal = date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 16);
    return isoLocal;
}

export function percentToPixel(percent, total_px) {
    let px = (parseInt(total_px) / 100) * parseInt(percent)
    return px
}