import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Home.css';
import { Button, CircularProgress, TableContainer, Table, TableBody, TableRow, TableCell, MenuItem, Backdrop, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, InputLabel } from '@material-ui/core';
import { PowerSettingsNew } from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import CustomToolbar from "../../custom_libraries/CustomToolbar";
import { getFreshToken, post } from '../../custom_libraries/serverRequests';
import urls from '../../custom_libraries/urls';
import globalVariables from '../../custom_libraries/globalVariables';
import { signOut } from "../../custom_libraries/auth";
import { isEmpty } from "../../custom_libraries/validation";

const useStyles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
});

class AdminHome extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        all_clients: [],
        selected_client: '',
        client: '',
        batches: [],
        selected_batch: '',
        batch: '',
        all_operators: [],
        selected_operator: '',
        operator: '',
        client_name: '----',
        operator_name: '----',
        batch_name: '----',
        batch_code: '----',

        dialog_assign_client: false,
        open_progress_bar: false
    }

    componentDidMount() {
        this.validateSignedIn()
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = () => {
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
    }

    isEmptyFields = () => {
        let data = [
            this.state.selected_client,
            this.state.selected_batch,
            this.state.selected_operator
        ]
        return isEmpty(data)
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
                    <div className='row'>
                        <div className='col-md-2 border-right bg-light d-flex justify-content-center align-items-center'>
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
                        <div className='col-md-10 scroll_shown' style={{ height: 'calc(100vh - 4.1rem)' }}>
                            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100%' }}>
                                <div className='pt-4 pb-4'>
                                    <div className='row'>
                                        <div className='col'>
                                            <b>Greetings, {localStorage.getItem(globalVariables.USER_NAME)}</b>
                                        </div>
                                        
                                    </div>
                                    <div className='row'>
                                        <div className='col d-flex justify-content-center align-items-center'>
                                            <div className='row'>
                                                <div className='col-md-6 pt-2 pb-2'>
                                                    <Button
                                                        variant='contained'
                                                        onClick={() => this.props.history.replace('/admin-data')}
                                                        className='p-2 border w-100 h-100' style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}>
                                                        <b>VIEW / EDIT <br /> PLU DATA</b>
                                                    </Button>
                                                </div>
                                                <div className='col-md-6 pt-2 pb-2'>
                                                    <Button
                                                        variant='contained'
                                                        onClick={() => this.props.history.replace('/admin-reports')}
                                                        className='p-2 border w-100 h-100' style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}>
                                                        <b>REPORT <br />MANAGEMENT</b>
                                                    </Button>
                                                </div>
                                                <div className='col-md-6 pt-2 pb-2'>
                                                    <Button
                                                        variant='contained'
                                                        onClick={() => this.props.history.replace('/admin-users')}
                                                        className='p-2 border w-100 h-100' style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}>
                                                        <b>USER <br /> MANAGEMENT<br /></b>
                                                    </Button>
                                                </div>
                                                {/* <div className='col-md-6 pt-2 pb-2'>
                                                    <Button variant='contained' className='bg-white p-2 border w-100 h-100'>
                                                        <b>PROFILE <br /> SETTINGS</b>
                                                    </Button>
                                                </div> */}
                                                <div className='col-md-6 pt-2 pb-2'>
                                                    <Button variant='contained'
                                                        onClick={() => this.props.history.replace('/admin-settings')}
                                                        className='p-2 border w-100 h-100' style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}>
                                                        <b>SETTINGS</b>
                                                    </Button>
                                                </div>
                                             
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
               
                <Backdrop className={this.props.classes.backdrop} open={this.state.open_progress_bar}>
                    <CircularProgress size={80} color="inherit" />
                </Backdrop>
            </div>
        );
    }
}

export default withStyles(useStyles)(AdminHome);

