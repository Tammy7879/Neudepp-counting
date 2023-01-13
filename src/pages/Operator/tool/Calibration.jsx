import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Home.css';
import { Button,TextField, IconButton, CircularProgress, InputAdornment, Table, TableBody, TableRow, TableCell, MenuItem, Backdrop, FormControl, Select } from '@material-ui/core';
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

const inputstyle ={
    label1 :{
        'width':'100%',
        'border':'normal',
        'height':'20px'
    }
}

class Calibration extends Component {
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
        system_update: 'V 2.2.0',
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

            <div className='container-fluid scroll_shown' style={{ height: 'calc(100vh - 4rem)' }}>
                
                    <div className="pb-3 pt-3 border-top border-bottom text-center">
                        <b> Weight  </b>
                        <TextField
                                label="Total Weight"
                                variant="outlined"
                                size="small"
                                value={this.state.length}
                                className="w-100"
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: <InputAdornment position="end">{this.state.distance_unit}</InputAdornment>,
                                }}
                            />
                        
                        <TextField
                            variant="outlined"
                            className="w-100 mt-3"
                            size="small"
                            value={this.state.length_span}
                            onChange={this.handleLengthSpan}
                            placeholder="Enter Piece Count"
                           
                        />
                    </div>
                   
            
               
                <div className="pb-3 pt-3 border-top border-bottom text-center">
                    <Button
                        variant="contained"
                        color='primary'
                        className="w-75"
                        onClick={this.sensorCalibrate}
                        size="large">
                        
                        <b>Set Count</b>
                    </Button>
                </div>
                <div className="pt-2 border-top">
                    <div className="w-100 text-right">
                        <Button
                            variant="contained"
                            className="bg-success text-white"
                            onClick={this.stopDisplayLiveData}
                            size="large">
                            
                            <b>OK</b>
                        </Button>
                    </div>
                </div>
                
                    <div className="pb-3 pt-3 border-top border-bottom text-center">
                        <div className="pt-2">
                            <TextField
                                label="Piece Weight"
                                variant="outlined"
                                size="small"
                                value={this.state.length}
                                className="w-100"
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: <InputAdornment position="end">{this.state.distance_unit}</InputAdornment>,
                                }}
                            />
                        </div>
                     
                   
                      
                    </div>
                
                <Backdrop className={this.props.classes.backdrop} open={this.state.open_progress_bar}>
                    <CircularProgress size={80} color="inherit" />
                </Backdrop>
            </div>
        )
    }
}

export default withStyles(useStyles)(Calibration);

