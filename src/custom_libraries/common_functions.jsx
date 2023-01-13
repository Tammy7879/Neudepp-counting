import { GridToolbarColumnsButton, GridToolbarFilterButton } from '@material-ui/data-grid';
import PropTypes from 'prop-types';
import { post } from "./serverRequests"
import globalVariables from "./globalVariables"
import { IconButton, TextField } from '@material-ui/core';
import { Clear, Search } from '@material-ui/icons';

// export async function serverRequest(url, post_data = {}) {
//     let headers = {
//         'Authorization': `Bearer ${localStorage.getItem(globalVariables.AUTH_TOKEN)}`,
//         'Content-Type': 'application/json'
//     }
//     let response = await post(url, headers, post_data)
//     if (response !== false) {
//         // console.log(response)
//         return response
//         // if (response['success']) {
//         //     let all_records = response['data']
//         //     return all_records
//         // }
//         // else {
//         //     alert(response['message'])
//         //     return false
//         // }
//     }
//     else {
//         alert('Something went wrong. Please try again !!!')
//         return false
//     }
// }


export function DataGridCustomToolbar(props) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <GridToolbarColumnsButton style={{ padding: '5px 15px', fontSize: '0.90rem' }} variant='outlined' className='m-2 txt_bold' />
                <GridToolbarFilterButton style={{ padding: '5px 15px', fontSize: '0.90rem' }} variant='outlined' className='m-2 txt_bold' />
            </div>
            <TextField
                variant="standard"
                value={props.value}
                onChange={props.onChange}
                placeholder="Search…"
                className='m-2 w-50'
                variant='outlined'
                InputProps={{
                    startAdornment: <Search fontSize="small" className='mr-2' />,
                    endAdornment: (
                        <IconButton
                            title="Clear"
                            aria-label="Clear"
                            size="small"
                            style={{ visibility: props.value ? 'visible' : 'hidden' }}
                            onClick={props.clearSearch}
                        >
                            <Clear fontSize="small" />
                        </IconButton>
                    ),
                }}
            />
        </div>
    );
}

DataGridCustomToolbar.propTypes = {
    clearSearch: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
};

DataGridCustomToolbar.defaultProps = {
    value: '',
};


function escapeRegExp(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function searchResult(search_value, all_records) {
    const search_regex = new RegExp(escapeRegExp(search_value), 'i');
    const filtered_records = all_records.filter((row) => {
        return Object.keys(row).some((field) => {
            let text = row[field]
            if (text == null)
                text = ''
            return search_regex.test(text.toString());
        });
    });
    return filtered_records
}

export async function base64ToBlobURL(base64Data) {
    const response = await fetch(base64Data);
    const data = await response.blob();
    return window.URL.createObjectURL(data);
}