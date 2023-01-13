import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Home.css';
import { TextField, IconButton, CircularProgress, InputAdornment, Table, TableBody, TableRow, TableCell, MenuItem, Backdrop, FormControl, Select } from '@material-ui/core';
import { InfoOutlined } from '@material-ui/icons'
import { dateToISOLikeButLocal } from '../../../custom_libraries/validation';
import { post } from '../../../custom_libraries/serverRequests';
import urls from '../../../custom_libraries/urls';
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
});

class System extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        date_time: dateToISOLikeButLocal(new Date()),
        screen_res_list: ['1024 x 600'],
        screen_res: '1024 x 600',
        font_size_list: ['small', 'medium', 'large'],
        font_size: 'medium',
        storage: '----',
        system_update: 'V 0.0.1',
        open_progress_bar: false
    }

    componentDidMount() {
        this.getDiskSpace()
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = () => {
            return;
        };
    }

    getDiskSpace = async () => {
        this.startLoading()
        let response = await post(urls.DISK_SPACE)
        if (response !== false) {
            if (response['success']) {
                let disk_space = response['data']
                this.setState({
                    storage: disk_space['used'] + ' / ' + disk_space['total']
                })
            }
            else {
                alert(response['message'])
            }
        }
        else {
            alert('Something went wrong. Please try again !!!')
        }
        this.stopLoading()
    }

    startLoading = () => {
        this.setState({ open_progress_bar: true })
    }

    stopLoading = () => {
        this.setState({ open_progress_bar: false })
    }

    render() {
        return (
            <div className='scroll_hidden'>
                <div className='pt-3 d-flex justify-content-center align-items-center'>
                    <div className='row'>
                        <div className='col-sm-2' />
                        <div className='col-md-12'>
                            <Table size="medium">
                                <TableBody>
                                    <TableRow>
                                        <TableCell align='right' style={{ borderBottom: "none" }}>
                                            Date & Time
                                        </TableCell>
                                        <TableCell style={{ borderBottom: "none" }}>
                                            <TextField
                                                value={this.state.date_time}
                                                className='w-100'
                                                size='small'
                                                type='datetime-local'
                                                onChange={(evt) => this.setState({ date_time: evt.target.value })}
                                                onKeyDown={(evt) => evt.preventDefault()}
                                                inputProps={{
                                                    maxLength: 17,
                                                    min: "2000-01-01T00:00",
                                                    max: "2100-01-01T23:59",
                                                    className: 'open_calender'
                                                }}
                                                variant="outlined" />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align='right' style={{ borderBottom: "none" }}>
                                            Screen Resolution
                                        </TableCell>
                                        <TableCell style={{ borderBottom: "none" }}>
                                            <FormControl size="small" variant="outlined" className="w-100">
                                                <Select
                                                    value={this.state.screen_res}
                                                    onChange={(evt) => this.setState({ screen_res: evt.target.value })}>
                                                    {Object.keys(this.state.screen_res_list).map((k, i) => (
                                                        <MenuItem key={k} value={this.state.screen_res_list[i]}>
                                                            {this.state.screen_res_list[i]}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align='right' style={{ borderBottom: "none" }}>
                                            Font Size
                                        </TableCell>
                                        <TableCell style={{ borderBottom: "none" }}>
                                            <FormControl size="small" variant="outlined" className="w-100">
                                                <Select
                                                    value={this.state.font_size}
                                                    onChange={(evt) => this.setState({ font_size: evt.target.value })}>
                                                    {Object.keys(this.state.font_size_list).map((k, i) => (
                                                        <MenuItem key={k} value={this.state.font_size_list[i]}>
                                                            {this.state.font_size_list[i]}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align='right' style={{ borderBottom: "none" }}>
                                            Storage
                                        </TableCell>
                                        <TableCell style={{ borderBottom: "none" }}>
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                className="w-100"
                                                value={this.state.storage}
                                                InputProps={{
                                                    className: 'pr-0',
                                                    readOnly: true,
                                                    endAdornment:
                                                        <InputAdornment position="end">
                                                            <IconButton>
                                                                <InfoOutlined />
                                                            </IconButton>
                                                        </InputAdornment>,
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align='right' style={{ borderBottom: "none" }}>
                                            System Updates
                                        </TableCell>
                                        <TableCell style={{ borderBottom: "none" }}>
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                className="w-100"
                                                value={this.state.system_update}
                                                InputProps={{
                                                    className: 'pr-0',
                                                    readOnly: true,
                                                    endAdornment:
                                                        <InputAdornment position="end">
                                                            <IconButton>
                                                                <InfoOutlined />
                                                            </IconButton>
                                                        </InputAdornment>,
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <div className='col-sm-2' />
                    </div>
                </div>
                <Backdrop className={this.props.classes.backdrop} open={this.state.open_progress_bar}>
                    <CircularProgress size={80} color="inherit" />
                </Backdrop>
            </div>
        );
    }
}

export default withStyles(useStyles)(System);

