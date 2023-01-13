import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { TextField, Button, IconButton, CircularProgress, InputAdornment, Table, TableBody, TableRow, TableCell, Backdrop, Card, CardContent, Tooltip, Menu, MenuItem, Dialog, DialogContent, DialogActions, FormControl, InputLabel, Select, DialogTitle } from '@material-ui/core';
import { LockOpen, Person, VpnKey, Visibility, VisibilityOff, Wifi, WifiOff, SignalWifi3BarLock, Refresh, WifiLock, VpnLock, Edit } from '@material-ui/icons'
import { displayDateTime, isEmpty } from '../custom_libraries/validation';
import { withStyles } from '@material-ui/core/styles';
import client_logo from '../images/client_logo.jpg'
import { useStyles } from "../custom_libraries/customStyles";
import { post } from '../custom_libraries/serverRequests';
import urls from '../custom_libraries/urls';
import globalVariables from '../custom_libraries/globalVariables';

const WIFI_DATA = globalVariables.WIFI_DATA

class SignIn extends Component {
    constructor(props) {
        super(props);
    }

    wifi_data = JSON.parse(localStorage.getItem(WIFI_DATA) || '{}')

    state = {
        wifi_options: {},
        wifi: '',
        wifi_pwd: '',
        date_time: '',
        anchorEl: null,
        ip_address: localStorage.getItem(globalVariables.IP_ADDRESS) || '',
        username_or_email: '',
        password: '',

        is_show_password: false,
        is_wifi_off: false,
        dialog_wifi: false,
        dialog_ip: false,
        open_progress_bar: false
    }

    users = [
        {
            'email': 'yun@yun.buzz',
            'password': 'yun'
        },
        {
            'email': 'demo@nityo.com',
            'password': 'Demo@12345'
        }
    ]

    intervalId = 0

    componentWillUnmount() {
        clearInterval(this.intervalId)
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = () => {
            return;
        };
    }

    validateSignedIn = async () => {
        let ip_address = localStorage.getItem(globalVariables.IP_ADDRESS)
       // if (ip_address === null) {
         //   this.setState({
           //     dialog_ip: true
           // })
            //return
        //}
        let refresh_token = localStorage.getItem(globalVariables.REFRESH_TOKEN)
        if (refresh_token !== null) {
            let user_type = localStorage.getItem(globalVariables.USER_TYPE)
            if (user_type === globalVariables.USER_TYPE_ADMIN) {
                this.props.history.replace("/admin-home");
            }
            else if (user_type === globalVariables.USER_TYPE_OPERATOR) {
                this.props.history.replace("/operator-home");
            }
            return
        }
        this.dateTime()
        this.intervalId = setInterval(this.dateTime, 10000);
        this.getWiFiList()
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

    setIpAddress = () => {
        if (this.state.ip_address.trim() === '') {
            alert('IP address should not be blank.')
            return
        }
        localStorage.setItem(globalVariables.IP_ADDRESS, this.state.ip_address)
        window.location.reload()
    }

    handleUsernameOrEmail = (evt) => {
        this.setState({ username_or_email: evt.target.value });
    }

    handlePassword = (evt) => {
        this.setState({ password: evt.target.value });
    }

    isEmptyFields = () => {
        let data = [
            this.state.ip_address,
            this.state.username_or_email,
            this.state.password
        ]
        return isEmpty(data)
    }

    jsonData = () => {
        let data = {
            "username_or_email": this.state.username_or_email.trim(),
            "password": this.state.password.trim()
        }
        return JSON.stringify(data)
    }

    userLogin = async () => {
        if (this.isEmptyFields()) {
            alert("Fill All Fields !!!")
            return
        }
        this.startLoading()
        let headers = {
            'content-type': 'application/json'
        }
        let post_data = this.jsonData()
        let data = await post(urls.LOGIN, post_data, headers)
        if (data !== false) {
            // console.log(data)
            if (data.hasOwnProperty('success')) {
                if (data['success']) {
                    let user_type = data['user_type']
                    localStorage.setItem(globalVariables.AUTH_TOKEN, data['access_token'])
                    localStorage.setItem(globalVariables.REFRESH_TOKEN, data['refresh_token'])
                    localStorage.setItem(globalVariables.USER_TYPE, user_type)
                    localStorage.setItem(globalVariables.USER_NAME, data['name'])
                    localStorage.setItem(globalVariables.USER_EMAIL, data['email'])
                    localStorage.setItem(globalVariables.TOKEN_EXPIRY, this.expiryTime(12))
                    if (user_type === globalVariables.USER_TYPE_ADMIN)
                        this.props.history.replace("/admin-home");
                    else if (user_type === globalVariables.USER_TYPE_OPERATOR)
                        this.props.history.replace("/operator-home");
                }
                else {
                    alert(data['message'])
                }
            }
        }
        else {
            alert('Something went wrong. Please try again !!!')
        }
        this.stopLoading()
    }

    expiryTime = (hour) => {
        let now = new Date();
        now.setHours(now.getHours() + hour);
        return now
    }

    keyPress = (evt) => {
        if (evt.key === "Enter") {
            this.userLogin()
        }
    }

    startLoading = () => {
        this.setState({ open_progress_bar: true })
    }

    stopLoading = () => {
        this.setState({ open_progress_bar: false })
    }

    render() {
        return (
            <div className='scroll_hidden vh-100' style={{ backgroundColor: '#F0F4F3' }}>
                <div className='text-right pr-2'>
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
                <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 5rem)' }}>
                    <Card>
                        <div className='row'>
                            <div className='col-sm-7 pr-0'>
                                <CardContent className=''>
                                    <div className='text-center'>
                                        <img src={client_logo} style={{ height: '3.5rem' }}></img>
                                    </div>
                                    <div className='p-2'>
                                        <div className="pt-2 text-center">
                                            <TextField
                                                label="IP Address"
                                                size="small"
                                                variant="outlined"
                                                className="w-100"
                                                disabled
                                                value={this.state.ip_address}
                                                InputProps={{
                                                    startAdornment:
                                                        <InputAdornment position="start">
                                                            <VpnLock color="action" className="mr-2" />
                                                        </InputAdornment>,
                                                    endAdornment:
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={() => this.setState({ dialog_ip: true})}>
                                                                <Edit />
                                                            </IconButton>
                                                        </InputAdornment>,
                                                }}
                                            />
                                        </div>
                                        <div className="pt-4 text-center">
                                            <TextField
                                                label="Username / Email"
                                                size="small"
                                                variant="outlined"
                                                className="w-100"
                                                value={this.state.username_or_email}
                                                onChange={this.handleUsernameOrEmail}
                                                onKeyPress={this.keyPress}
                                                InputProps={{
                                                    startAdornment:
                                                        <InputAdornment position="start">
                                                            <Person color="action" className="mr-2" />
                                                        </InputAdornment>,
                                                }}
                                            />
                                        </div>
                                        <div className="pt-3 text-center">
                                            <TextField
                                                label="Password"
                                                type={this.state.is_show_password ? 'text' : 'password'}
                                                variant="outlined"
                                                size="small"
                                                className="w-100"
                                                value={this.state.password}
                                                onChange={this.handlePassword}
                                                onKeyPress={this.keyPress}
                                                InputProps={{
                                                    startAdornment:
                                                        <InputAdornment position="start">
                                                            <VpnKey color="action" className="mr-2" />
                                                        </InputAdornment>,
                                                    endAdornment:
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={() => this.setState({ is_show_password: !this.state.is_show_password })}
                                                            >
                                                                {this.state.is_show_password ? <Visibility /> : <VisibilityOff />}
                                                            </IconButton>
                                                        </InputAdornment>,
                                                }}
                                            />
                                        </div>
                                        <div className="pt-4 text-center">
                                            <Button
                                                variant="contained"
                                                size="large"
                                                style={{ backgroundColor: '#1d1046', color: 'white' }}
                                                onClick={this.userLogin}>
                                                <LockOpen className="mr-2" />
                                                <b>SIGN IN</b>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                            <div className='col-sm-5 text-center d-flex justify-content-center align-items-center pl-0' style={{ backgroundColor: '#0c0227' }}>
                                <div className='pt-5 pb-5 pl-4 pr-4'>
                                    <h2 className='txt_bold text-white'>Hello, Friend!</h2>
                                    <div className='text-white'>Welcome to Gramton</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
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
                <Dialog
                    open={this.state.dialog_ip}
                    fullWidth
                    maxWidth="xs">
                    <DialogTitle className='text-center'>IP ADDRESS</DialogTitle>
                    <DialogContent className=''>
                        <TextField
                            label="Ip Address"
                            variant="outlined"
                            size="small"
                            className="w-100"
                            placeholder='0.0.0.0'
                            value={this.state.ip_address}
                            onChange={(evt) => this.setState({ ip_address: evt.target.value })}
                            InputProps={{
                                startAdornment:
                                    <InputAdornment position="start">
                                        <VpnLock color="action" className="mr-2" />
                                    </InputAdornment>
                            }}
                        />
                    </DialogContent>
                    <DialogActions className='pt-3'>
                        <Button onClick={this.setIpAddress} color="primary" variant="contained" style={{ fontWeight: 'bolder' }}>
                            Set IP Address
                        </Button>
                        <Button onClick={() => this.setState({ dialog_ip: false })} color="default" variant="outlined" style={{ fontWeight: 'bolder' }}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Backdrop className={this.props.classes.backdrop} open={this.state.open_progress_bar}>
                    <CircularProgress size={80} color="inherit" />
                </Backdrop>
            </div>
        );
    }
}

export default withStyles(useStyles)(SignIn);