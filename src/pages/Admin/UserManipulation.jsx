import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; //npm install --save bootstrap
import '../Home.css';
import { InputAdornment, FormLabel, RadioGroup, FormControlLabel, IconButton, Button, Radio, Tooltip, CircularProgress, Backdrop, Fab, FormControl, Select, MenuItem, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@material-ui/core';
import { PowerSettingsNew, Person, Email, VpnKey, Visibility, VisibilityOff, Home, Add, Call } from '@material-ui/icons'

import { post, getFreshToken } from '../../custom_libraries/serverRequests';
import urls from '../../custom_libraries/urls';
import globalVariables from '../../custom_libraries/globalVariables';
import { isEmpty, percentToPixel } from '../../custom_libraries/validation';
import { signOut } from '../../custom_libraries/auth';
import { withStyles } from '@material-ui/core/styles';
import { useStyles } from "../../custom_libraries/customStyles";
import CustomToolbar from "../../custom_libraries/CustomToolbar";
import { DataGridCustomToolbar, searchResult } from "../../custom_libraries/common_functions";
import { DataGrid } from "@material-ui/data-grid";
import { CustomNoRowsOverlay } from "../../custom_libraries/customComponents";

const CONFIRMATION_DELETE = 'delete'
const CONFIRMATION_UPDATE = 'update'
const CONFIRMATION_INSERT = 'insert'

class UserManipulation extends Component {

    constructor(props) {
        super(props);
        this.page = React.createRef()
    }

    state = {
        columns: [],
        all_records: [],
        filtered_records: [],
        search_value: '',
        user_id: '',
        user_type: '',
        name: '',
        username: '',
        email: '',
        mobile: '',
        password: '',
        gender: '',
        user_access: '',
        is_show_password: false,

        records_per_page: 5,
        hidden_add_new: false,
        dialog_record_manipulation: false,
        dialog_confirmation_msg: '',
        dialog_confirmation_action: '',
        dialog_confirmation: false,
        open_progress_bar: false
    }

    user_type_list = ['admin', 'operator']

    componentDidMount() {
        this.validateSignedIn()
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    validateSignedIn = async () => {
        let is_fresh_token = await getFreshToken()
        if (!is_fresh_token) {
            this.props.history.replace("/sign_in");
            return
        }
        let user_type = localStorage.getItem(globalVariables.USER_TYPE)
        if (user_type === globalVariables.USER_TYPE_OPERATOR) {
            this.props.history.replace("/operator-home");
            return
        }
        this.setColumns()
        this.getAllUsers()
    }

    setColumns = () => {
        let columns = [
            {
                field: 'sr_no',
                headerName: 'SR.NO.',
                type: 'number',
                minWidth: 120,
                width: percentToPixel(10, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'user_type',
                headerName: 'USER TYPE',
                type: 'singleSelect',
                valueOptions: ['admin', 'operator'],
                minWidth: 200,
                width: percentToPixel(20, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white',
                headerAlign: 'center',
                align: 'center',
                renderCell: (params) => {
                    if (params.value == globalVariables.USER_TYPE_ADMIN) {
                        return <b>ADMIN</b>;
                    } else {
                        return <span>OPERATOR</span>;
                    }
                }
            },
            {
                field: 'name',
                headerName: 'NAME',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer text-capitalize',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'username',
                headerName: 'USERNAME',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'email',
                headerName: 'EMAIL',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'mobile',
                headerName: 'MOBILE',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'gender',
                headerName: 'GENDER',
                type: 'singleSelect',
                valueOptions: ['male', 'female'],
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer text-capitalize',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'user_access',
                headerName: 'USER ACCESS',
                minWidth: 200,
                width: percentToPixel(20, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer text-uppercase',
                headerClassName: 'bg-secondary text-white',
                headerAlign: 'center',
                align: 'center',
                renderCell: (params) => {
                    if (params.value == globalVariables.USER_ACCESS_ALLOW) {
                        return <b className='text-secondary'>ALLOW</b>;
                    } else {
                        return <b className='text-secondary'>DENY</b>;
                    }
                }
            },
            {
                field: 'is_active',
                headerName: 'USER STATUS',
                minWidth: 200,
                width: percentToPixel(20, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white',
                headerAlign: 'center',
                align: 'center',
                renderCell: (params) => {
                    if (params.value === globalVariables.USER_STATE_ACTIVE) {
                        return (
                            <Tooltip title="Active" placement="right-start" arrow>
                                <Radio checked={true} className='text-success' />
                            </Tooltip>
                        )
                    }
                    else {
                        return (
                            <Tooltip title="Inactive" placement="right-start" arrow>
                                <Radio checked={true} className='text-danger' />
                            </Tooltip>
                        )
                    }
                }
            },
            {
                field: 'last_active',
                headerName: 'LAST ACTIVE',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            }
        ]
        this.setState({ columns: columns })
    }

    handlePageSize = (records_per_page) => {
        this.setState({ records_per_page: records_per_page })
    }

    requestSearch = (search_value) => {
        let filtered_records = searchResult(search_value, this.state.all_records)
        this.setState({
            search_value: search_value,
            filtered_records: filtered_records
        })
    }

    getAllUsers = async () => {
        this.startLoading()
        let response = await post(urls.ALL_USERS)
        if (response !== false) {
            if (response['success']) {
                let all_records = response['data']
                // Set 'sr_no' to Data
                all_records.map((currentelement, index, arrayobj) => { currentelement['sr_no'] = index + 1 });
                this.setState({
                    all_records: all_records,
                    filtered_records: all_records
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

    closeDialogRecordManipulation = () => {
        this.setState({
            dialog_record_manipulation: false,
            dialog_confirmation: false
        });
    }

    openDialogRecordManipulation = (action, data) => {
        if (action === CONFIRMATION_INSERT) {
            this.setState({ user_id: '' });
            this.setState({ user_type: '' });
            this.setState({ name: '' });
            this.setState({ username: '' });
            this.setState({ email: '' });
            this.setState({ mobile: '' });
            this.setState({ password: '' });
            this.setState({ gender: '' });
            this.setState({ user_access: '' });
            this.setState({ edit_hidden: true });
            this.setState({ add_hidden: false });
        }
        else if (action === CONFIRMATION_UPDATE) {
            this.setState({ user_id: data['id'] });
            this.setState({ user_type: data['user_type'] });
            this.setState({ name: data['name'] });
            this.setState({ username: data['username'] });
            this.setState({ email: data['email'] });
            this.setState({ mobile: data['mobile'] });
            this.setState({ password: data['password'] });
            this.setState({ gender: data['gender'] });
            this.setState({ user_access: data['user_access'].toString() });
            this.setState({ edit_hidden: false });
            this.setState({ add_hidden: true });
        }
        this.setState({ dialog_record_manipulation: true })
    }

    confirmationDialog = (action) => {
        if (action === CONFIRMATION_UPDATE) {
            if (this.isEmptyFields()) {
                alert("Fill All Fields !!!")
                return
            }
            this.setState({ dialog_confirmation_msg: 'Do you want to "UPDATE" this User ?' });
            this.setState({ dialog_confirmation: true });
        }
        else if (action === CONFIRMATION_DELETE) {
            this.setState({ dialog_confirmation_msg: 'Do you want to "DELETE" this User ?' });
            this.setState({ dialog_confirmation: true });
        }
        this.setState({ dialog_confirmation_action: action });
    }

    confirmationDialogAction = () => {
        if (this.state.dialog_confirmation_action === CONFIRMATION_UPDATE) {
            this.updateUser()
        }
        else if (this.state.dialog_confirmation_action === CONFIRMATION_DELETE) {
            this.deleteUser()
        }
    }

    jsonData = (is_id = false) => {
        let data = {
            "user_type": this.state.user_type,
            "name": this.state.name.trim(),
            "username": this.state.username.trim(),
            "email": this.state.email.trim(),
            "mobile": this.state.mobile.trim(),
            "password": this.state.password.trim(),
            "gender": this.state.gender,
            "user_access": this.state.user_access,
        }
        if (is_id) {
            data['id'] = this.state.user_id
        }
        return JSON.stringify(data)
    }

    isEmptyFields = () => {
        let data = [
            this.state.user_type, this.state.name,
            this.state.username, this.state.email,
            this.state.password, this.state.user_access
        ]
        return isEmpty(data)
    }

    addUser = async () => {
        if (this.isEmptyFields()) {
            alert("Fill All Fields !!!")
            return
        }
        this.startLoading()
        let post_data = this.jsonData()
        let response = await post(urls.ADD_USER, post_data)
        if (response !== false) {
            if (response['success']) {
                this.closeDialogRecordManipulation()
                this.getAllUsers()
                alert(response['message'])
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

    updateUser = async () => {
        this.startLoading()
        let post_data = this.jsonData(true)
        let response = await post(urls.UPDATE_USER, post_data)
        if (response !== false) {
            // console.log('response', response)
            if (response['success']) {
                this.closeDialogRecordManipulation()
                this.getAllUsers()
                alert(response['message'])
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

    deleteUser = async () => {
        this.startLoading()
        let post_data = JSON.stringify({
            'id': this.state.user_id,
            'user_type': this.state.user_type
        })
        let response = await post(urls.DELETE_USER, post_data)
        if (response !== false) {
            // console.log('response', response)
            // let response = { "is_password_correct": true }
            if (response['success']) {
                this.closeDialogRecordManipulation()
                this.getAllUsers()
                alert(response['message'])
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
            <div className='vh-100 scroll_hidden'>
                <CustomToolbar />
                <div className="container-fluid">
                    <div className='row scroll_shown' style={{ height: 'calc(100vh - 4rem)' }}>
                        <div className='col-md-2 border-right bg-light d-flex justify-content-center align-items-center'>
                            <div className='w-100 p-2' style={{ position: 'absolute', top: 10 }}>
                                <Button
                                    variant="contained"
                                    size="medium"
                                    className="w-100 mt-2"
                                    style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}
                                    onClick={() => this.props.history.replace('/admin-home')}>
                                    <Home className="mr-2" />
                                    <b>Back to Home</b>
                                </Button>
                            </div>
                            <div className='w-100 p-2' style={{ position: 'absolute', bottom: 10 }}>
                                <Button
                                    variant="contained"
                                    size="medium"
                                    className="w-100 mt-4 mb-2"
                                    style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}
                                    onClick={() => signOut(this.props.history)}>
                                    <b>Logout</b>
                                    <PowerSettingsNew className="ml-2" />
                                </Button>
                            </div>
                        </div>
                        <div className='col-md-10'>
                            <div className='pt-4' ref={this.page}>
                                <div style={{ height: 'calc(100vh - 6rem)', width: '100%' }}>
                                    <DataGrid
                                        rows={this.state.filtered_records}
                                        columns={this.state.columns}
                                        rowsPerPageOptions={[5, 10, 15, 20]}
                                        pageSize={this.state.records_per_page}
                                        onPageSizeChange={this.handlePageSize}
                                        pagination
                                        disableSelectionOnClick
                                        showCellRightBorder
                                        showColumnRightBorder
                                        disableExtendRowFullWidth
                                        hideFooterSelectedRowCount
                                        onRowDoubleClick={(e) => this.openDialogRecordManipulation(CONFIRMATION_UPDATE, e.row)}
                                        components={{
                                            Toolbar: DataGridCustomToolbar,
                                            NoRowsOverlay: () => CustomNoRowsOverlay('No results found.')
                                        }}
                                        componentsProps={{
                                            toolbar: {
                                                value: this.state.search_value,
                                                onChange: (event) => this.requestSearch(event.target.value),
                                                clearSearch: () => this.requestSearch(''),
                                            },
                                        }}
                                        className={this.props.classes.dataGrid}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <Dialog
                        open={this.state.dialog_record_manipulation}
                        disableEscapeKeyDown
                        fullWidth
                        maxWidth="md">
                        <div className='text-center'>
                            <DialogTitle>USER MANIPULATION</DialogTitle>
                        </div>
                        <DialogContent className=''>
                            <div className='row'>
                                <div className='col-md-4' hidden={this.state.add_hidden}>
                                    <FormControl size="small" variant="outlined" className="w-100 mt-3">
                                        <InputLabel>User Type</InputLabel>
                                        <Select
                                            value={this.state.user_type}
                                            onChange={(evt) => this.setState({ user_type: evt.target.value })}
                                            className='text-capitalize'
                                            label="User Type">
                                            {Object.keys(this.user_type_list).map((k, i) => (
                                                <MenuItem key={k} value={this.user_type_list[i]} className='text-capitalize'>
                                                    {this.user_type_list[i]}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Name"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.name}
                                        onChange={(evt) => this.setState({ name: evt.target.value })}
                                        InputProps={{
                                            startAdornment:
                                                <InputAdornment position="start">
                                                    <Person color="action" className="mr-2" />
                                                </InputAdornment>,
                                        }}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Username"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.username}
                                        onChange={(evt) => this.setState({ username: evt.target.value })}
                                        InputProps={{
                                            startAdornment:
                                                <InputAdornment position="start">
                                                    <Person color="action" className="mr-2" />
                                                </InputAdornment>,
                                        }}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Email"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.email}
                                        onChange={(evt) => this.setState({ email: evt.target.value })}
                                        InputProps={{
                                            startAdornment:
                                                <InputAdornment position="start">
                                                    <Email color="action" className="mr-2" />
                                                </InputAdornment>,
                                        }}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Mobile"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.mobile}
                                        onChange={(evt) => this.setState({ mobile: evt.target.value.replace(/[^0-9]+/g, "") })}
                                        inputProps={{ maxLength: 10 }}
                                        InputProps={{
                                            startAdornment:
                                                <InputAdornment position="start">
                                                    <Call color="action" className="mr-2" />
                                                    +91
                                                </InputAdornment>,
                                        }}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Password"
                                        type={this.state.is_show_password ? 'text' : 'password'}
                                        variant="outlined"
                                        size="small"
                                        className="w-100 mt-3"
                                        value={this.state.password}
                                        onChange={(evt) => this.setState({ password: evt.target.value })}
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
                                <div className='col-md-4' hidden={!this.state.add_hidden} />
                                <div className='col-md-4'>
                                    <FormControl component="fieldset" className='mt-3'>
                                        <FormLabel component="legend" className='mb-0' style={{ fontSize: 'small' }}>Gender</FormLabel>
                                        <RadioGroup
                                            row
                                            aria-label="gender"
                                            value={this.state.gender}
                                            onChange={(evt) => this.setState({ gender: evt.target.value })}>
                                            <FormControlLabel className='mr-5' value='male' control={<Radio />} label="Male" />
                                            <FormControlLabel value='female' control={<Radio />} label="Female" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                <div className='col-md-4'>
                                    <FormControl component="fieldset" className='mt-3'>
                                        <FormLabel component="legend" className='mb-0' style={{ fontSize: 'small' }}>User Access</FormLabel>
                                        <RadioGroup
                                            row
                                            aria-label="user_access"
                                            value={this.state.user_access}
                                            onChange={(evt) => this.setState({ user_access: evt.target.value })}>
                                            <FormControlLabel className='mr-5' value='1' control={<Radio />} label="Allow" />
                                            <FormControlLabel value='0' control={<Radio />} label="Deny" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.confirmationDialog(CONFIRMATION_DELETE)} color="secondary" variant="outlined" style={{ fontWeight: 'bolder' }} hidden={this.state.edit_hidden}>
                                Delete User
                            </Button>
                            <Button onClick={() => this.confirmationDialog(CONFIRMATION_UPDATE)} color="primary" variant="outlined" style={{ fontWeight: 'bolder' }} hidden={this.state.edit_hidden}>
                                Update User
                            </Button>
                            <Button onClick={() => this.addUser()} color="primary" variant="outlined" style={{ fontWeight: 'bolder' }} hidden={this.state.add_hidden}>
                                Add User
                            </Button>
                            <Button onClick={this.closeDialogRecordManipulation} color="default" variant="outlined" style={{ fontWeight: 'bolder' }}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={this.state.dialog_confirmation}
                        onClose={() => this.setState({ dialog_confirmation: false })}>
                        <DialogTitle>{this.state.dialog_confirmation_msg}</DialogTitle>
                        <DialogActions>
                            <Button size='small' variant="outlined" onClick={this.confirmationDialogAction}
                                color="primary">
                                Yes
                            </Button>
                            <Button size='small' variant="outlined" onClick={() => this.setState({ dialog_confirmation: false })}
                                color="primary">
                                No
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <Tooltip title="Add New" placement='top-start' arrow>
                    <Fab
                        size='large'
                        color="secondary"
                        onClick={() => this.openDialogRecordManipulation(CONFIRMATION_INSERT)}
                        className='bottom_right'>
                        <Add fontSize='large' />
                    </Fab>
                </Tooltip>
                <Backdrop className={this.props.classes.backdrop} open={this.state.open_progress_bar}>
                    <CircularProgress size={80} color="inherit" />
                </Backdrop>
            </div >
        )
    }
}

export default withStyles(useStyles)(UserManipulation);
