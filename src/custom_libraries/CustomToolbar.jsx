import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../pages/Home.css';
import client_logo from '../images/client_logo.jpg'
import { IconButton, AppBar, Toolbar, Tooltip, Menu, MenuList, MenuItem, Divider, TableBody, TableRow, TableCell, Table, Dialog, DialogContent, FormControl, InputLabel, Select, TextField, DialogActions, Button, InputAdornment } from '@material-ui/core';
import { Wifi, SignalWifi3BarLock,PowerSettingsNew, WifiOff, Refresh, VpnKey, Visibility, VisibilityOff, WifiLock } from '@material-ui/icons'
import { displayDateTime } from "./validation";
import urls from "./urls";
import { post } from "./serverRequests";
import globalVariables from "./globalVariables";
import { signOut } from "./auth";

const WIFI_DATA = globalVariables.WIFI_DATA

class CustomToolbar extends Component {
    constructor(props) {
        super(props);
    }

    user_type = localStorage.getItem(globalVariables.USER_TYPE)
    user_name = localStorage.getItem(globalVariables.USER_NAME)

    wifi_data = JSON.parse(localStorage.getItem(WIFI_DATA) || '{}')

    state = {
        wifi_options: {},
        wifi: '',
        wifi_pwd: '',
        date_time: '',
        anchorEl: null,
        is_wifi_off: false,
        dialog_wifi: false,
        is_show_password: false,
    }

    intervalId = 0

    componentDidMount() {
        this.dateTime()
        this.intervalId = setInterval(this.dateTime, 10000);
        this.getWiFiList()
    }

    componentWillUnmount() {
        clearInterval(this.intervalId)
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = () => {
            return;
        };
    }

    dateTime = () => {
        this.setState({ date_time: displayDateTime() })
    }

    turnOnOffWiFi = () => {
        this.setState({
            is_wifi_off: !this.state.is_wifi_off,
            anchorEl: null
        })
    }

    getWiFiList = async () => {
        let response = await post(urls.WIFI_LIST)
        if (response !== false) {
            if (response['success']) {
                let wifi_list = response['data']
                let wifi_options = {}
                wifi_list.forEach(wifi => {
                    if (this.wifi_data.hasOwnProperty(wifi)) {
                        wifi_options[wifi] = this.wifi_data[wifi]
                    }
                    else {
                        wifi_options[wifi] = ''
                    }
                });
                this.setState({ wifi_options: wifi_options })
            }
        }
        else {
            alert('Something went wrong. Please try again !!!')
        }
    }

    openWifi = (wifi) => {
        this.setState({
            wifi: wifi,
            wifi_pwd: this.state.wifi_options[wifi],
            dialog_wifi: true,
            anchorEl: null
        })
    }

    handleWiFi = (evt) => {
        let wifi = evt.target.value
        this.setState({
            wifi: wifi,
            wifi_pwd: this.state.wifi_options[wifi]
        })
    }

    connectWiFi = async () => {
        let wifi = this.state.wifi
        let wifi_pwd = this.state.wifi_pwd
        let post_data = JSON.stringify({
            'wifi': wifi,
            'password': wifi_pwd
        })
        let response = await post(urls.WIFI_CONNECT, post_data)
        if (response !== false) {
            if (response['success']) {
                this.wifi_data[wifi] = wifi_pwd
                localStorage.setItem(WIFI_DATA, JSON.stringify(this.wifi_data))
            }
        }
        else {
            alert('Something went wrong. Please try again !!!')
        }
    }

    render() {
        return (
            <div>
                <AppBar position="sticky" color='default'>
                    <Toolbar className='bg-white pr-0 pl-1'>
                        <img src={client_logo} style={{ height: '2.5rem' }} />
                        <div style={{ flexGrow: 1 }}>
                            <span className='border rounded ml-3 pl-2 pr-2 pt-1 pb-1'>
                                ID: 092134443
                            </span>
                            <span className='border rounded ml-3 pl-2 pr-2 pt-1 pb-1'>
                                ACC: 0.01
                            </span>
                            <span className='border rounded ml-3 pl-2 pr-2 pt-1 pb-1'>
                                {this.user_type.toUpperCase() + ' : ' + this.user_name}
                            </span>
                        </div>
                        <div className='pr-2'>
                            <Tooltip title="WiFi" placement="left-start" arrow>
                                <IconButton onClick={(evt) => this.setState({ anchorEl: evt.currentTarget })}>
                                    {
                                        this.state.is_wifi_off === false
                                            ?
                                            <Wifi />
                                            :
                                            <WifiOff />
                                    }
                                </IconButton>
                            </Tooltip>
                            <label className='ml-2'>
                                {this.state.date_time}
                            </label>
                        </div>
                    </Toolbar>
                </AppBar>
                <Menu
                    getContentAnchorEl={null}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={Boolean(this.state.anchorEl)}
                    onClose={() => this.setState({ anchorEl: null })} >
                    <Table>
                        <TableBody className='pointer'>
                            {Object.keys(this.state.wifi_options).map((k, i) => (
                                <TableRow key={k} hover onClick={() => this.openWifi(k)}>
                                    <TableCell>
                                        {k}
                                    </TableCell>
                                    <TableCell>
                                        <SignalWifi3BarLock className='text-secondary' />
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow hover onClick={this.getWiFiList}>
                                <TableCell>
                                    <b>Refresh</b>
                                </TableCell>
                                <TableCell>
                                    <Refresh className='ml-2' />
                                </TableCell>
                            </TableRow>
                            <TableRow hover onClick={this.turnOnOffWiFi}>
                                <TableCell colSpan={2}>
                                    {
                                        this.state.is_wifi_off === false
                                            ?
                                            <b>Turn Off</b>
                                            :
                                            <b>Turn On</b>
                                    }
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Menu>
                <Dialog
                    open={this.state.dialog_wifi}
                    onClose={() => this.setState({ dialog_wifi: false })}
                    fullWidth
                    maxWidth="xs">
                    <DialogContent className=''>
                        <FormControl size="small" variant="outlined" className="w-100 mt-4">
                            <InputLabel>WiFi Name</InputLabel>
                            <Select
                                value={this.state.wifi}
                                onChange={this.handleWiFi}
                                startAdornment={
                                    <InputAdornment position="start" className='mr-3'>
                                        <WifiLock color='action' />
                                    </InputAdornment>
                                }
                                label="WiFi Name">
                                {Object.keys(this.state.wifi_options).map((k, i) => (
                                    <MenuItem key={k} value={k}>
                                        {k}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Password"
                            type={this.state.is_show_password ? 'text' : 'password'}
                            variant="outlined"
                            size="small"
                            className="w-100 mt-4"
                            value={this.state.wifi_pwd}
                            onChange={(evt) => this.setState({ wifi_pwd: evt.target.value })}
                            InputProps={{
                                startAdornment:
                                    <InputAdornment position="start">
                                        <VpnKey color="action" className="mr-2" />
                                    </InputAdornment>,
                                endAdornment:
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => this.setState({ is_show_password: !this.state.is_show_password })}>
                                            {this.state.is_show_password ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>,
                            }}
                        />
                    </DialogContent>
                    <DialogActions className='pt-3'>
                        <Button onClick={this.connectWiFi} color="primary" variant="contained" style={{ fontWeight: 'bolder' }}>
                            Connect
                        </Button>
                        <Button onClick={() => this.setState({ dialog_wifi: false })} color="default" variant="outlined" style={{ fontWeight: 'bolder' }}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}
export default CustomToolbar;