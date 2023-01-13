import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Home.css';
import { Typography, Button, CircularProgress, MenuItem, Backdrop, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, InputLabel, Menu, MenuList, Snackbar, FormControlLabel, Switch } from '@material-ui/core';
import { LabelOff, PowerSettingsNew } from '@material-ui/icons'
import { getFreshToken, post } from '../../custom_libraries/serverRequests';
import urls from '../../custom_libraries/urls';
import globalVariables from '../../custom_libraries/globalVariables';
import { withStyles } from '@material-ui/core/styles';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CustomToolbar from "../../custom_libraries/CustomToolbar";
import { useStyles } from "../../custom_libraries/customStyles";
import { Alert } from "@material-ui/lab";
import { currentDateTime } from "../../custom_libraries/validation";
import { signOut } from "../../custom_libraries/auth";
import io from 'socket.io-client';
import { red } from "@material-ui/core/colors";


const COLOR_ORANGE = '#FFD84F'
const COLOR_GREEN = '#99DA7B'
const COLOR_RED = '#FD4B4B'

const BG_COLOR_ORANGE = '#FFF5D1'
const BG_COLOR_GREEN = '#DAFFD4'
const BG_COLOR_RED = '#FFCCCC'

const WEIGHT_STATUS = 'TARGET WEIGHT'
const WEIGHT_STATUS_LESS = 'LESS THAN TARGET WEIGHT'
const WEIGHT_STATUS_REACHED = 'TARGET WEIGHT REACHED'
const WEIGHT_STATUS_OVER = 'OVER TARGET WEIGHT'

const BATCHES_DATA = globalVariables.BATCHES_DATA

const connectionOptions = {
    "force new connection": true,
    "reconnectionAttempts": "Infinity",
    "reconnection": false,
    "timeout": 10000,
    "transports": ["polling"]
};

const initialState = {
    socket: null,
    progress_color: COLOR_ORANGE,
    bg_alert_color: '',
    i : 0,
    w: '0.000',
    w1: '0.000',
    w2: '0.000',
    w3: '0.000',

    
    weight_status: WEIGHT_STATUS,
    weight_percent: 0,
    anchor_scale: null,
    scale_list: [1, 2, 3, 4],
    scale: '',
    tare: '',

    batches_list: [],
    selected_batch: '',
    batch_id: '',
    batch: '',
    formula_name: '',
    formula_code: '',
    ingredient_list: [],
    ingred_count: '',
    ingredient_name: '',
    ingredient_code: '',
    target_weight: '',
    weight_unit: '',
    client_name: '',
    batch_count: '',
    total_batches: '',
    ingredient_weights: {},

    snackbar_msg: '',
    open_snackbar: false,
    is_auto_save: false,
    dialog_batch: false,
    open_progress_bar: false,
    alert_type: 'warning',
}

var j = 0;

class OperatorHome extends Component {
    constructor(props) {
        super(props);
    }

    batches_data = JSON.parse(localStorage.getItem(BATCHES_DATA) || '{}')

    state = { ...initialState }

    componentDidMount() {
        this.validateSignedIn()
    }

    componentWillUnmount() {
       // this.disconnectSocket()
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
        if (user_type === globalVariables.USER_TYPE_ADMIN) {
            this.props.history.replace("/admin-home");
            return
        }
        this.setData()
    }

    setData = async () => {
        console.log("this.batches_Data",this.batches_data)
        await this.setState({
            selected_batch: this.batches_data['batch_id'] || '',
            ingred_count: this.batches_data['ingred_count'] || 0,
            ingredient_weights: this.batches_data['ingredient_weights'] || '',
        })
        if (this.state.selected_batch === '') {
            await this.getAssignedClients()
        }
        if (this.state.selected_batch !== '') {
            await this.getAllBatches()
            this.setState({ dialog_batch: false })
            await this.selectBatch()
        }
        console.log("setData",this.state.ingred_count)
    }

    getAssignedClients = async () => {
        this.startLoading()
        let response = await post(urls.ASSIGNED_CLIENT)
        if (response !== false) {
            if (response['success']) {
                let data = response['data']
                this.setState({ selected_batch: data['batch'] })
            }
        }
        this.stopLoading()
    }

    handleBatch = () => {
        if (this.state.ingred_count > 0) {
            this.openSnackbar('First complete the current batch.', 'success')
            return
        }
        this.getAllBatches()
    }

    getAllBatches = async () => {
        this.startLoading()
        let response = await post(urls.ALL_BATCHES)
        if (response !== false) {
            if (response['success']) {
                let batches_list = response['data']
                this.setState({
                    batches_list: batches_list,
                    dialog_batch: true
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

    selectBatch = async () => {
        let selected_batch = this.state.selected_batch
        if (selected_batch === '') {
            alert('Please select batch !!!')
            return
        }
        this.startLoading()
        let post_data = JSON.stringify({
            'batch_id': selected_batch
        })
        let response = await post(urls.BATCH_DETAILS, post_data)
        //console.log(response)
        if (response !== false) {
            //console.log(response)
            if (response['success']) {
                let data = response['data']
                console.log("data")
                console.log(data)

                
                let ingred_count = this.state.ingred_count
                console.log("ingred_count",ingred_count)

               // if(ingred_count==undefined)
                //{
                  //  this.openSnackbar('select valid batch.')
                    //return
                //}
                
                this.setState({
                    batch_id: data['id'],
                    batch: data['batch_code'] + ' - ' + data['batch_name'],
                    formula_name: data['formula_name'],
                    formula_code: data['formula_code'],
                    ingredient_list: data['ingredients'],
                    client_name: data['client_name'],
                    total_batches: data['total_batches'],
                    ingredient_name: data['ingredients'][ingred_count]['ingredient_name'],
                    ingredient_code: data['ingredients'][ingred_count]['ingredient_code'],
                    target_weight: data['ingredients'][ingred_count]['target_limit'].toFixed(3),
                    weight_unit: data['ingredients'][ingred_count]['weight_unit'],
                    tare: data['ingredients'][ingred_count]['tare'],
                    dialog_batch: false
                })
                
                this.batches_data['start_time'] = currentDateTime()
                this.connectSocket()
                console.log("calling................... getBatchCount 1 ")
                this.getBatchCount()
                console.log("returned................... getBatchCount 2 ")
                this.reciveWeights()
                console.log("recieve weight done!")
                this.updateScale(data['ingredients'][ingred_count]['scale'])
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

    saveData = async () => {
        let ingredients = this.state.ingredient_list
        console.log("in save data")
        console.log("this.state.ingred_count",this.state.ingred_count )
        let ingred_count = this.state.ingred_count + 1
        if (ingredients.length === 0) {
            this.openSnackbar('First select the batch.')
            return
        }
        console.log("ingred_count",ingred_count )
        if (parseFloat(this.state.target_weight) !== parseFloat(this.state.weight)) {
            this.openSnackbar("Ingredient weight don't match with target weight.")
            return
        }
        let ingredient_weights = { ...this.state.ingredient_weights }
        ingredient_weights[ingredients[ingred_count - 1]['id']] = parseFloat(this.state.weight)
        if (ingredients.length === ingred_count) {
            await this.insertBatchData(ingredient_weights)
            return
        }
        this.setState({
            ingredient_name: ingredients[ingred_count]['ingredient_name'],
            ingredient_code: ingredients[ingred_count]['ingredient_code'],
            target_weight: ingredients[ingred_count]['target_limit'].toFixed(3),
            weight_unit: ingredients[ingred_count]['weight_unit'],
            tare: ingredients[ingred_count]['tare'],
            ingredient_weights: ingredient_weights,
            ingred_count: ingred_count,
            progress_color: COLOR_ORANGE,
            bg_alert_color: '',
            weight: '0.000',
            weight_status: WEIGHT_STATUS,
            weight_percent: 0,
            
        })
        this.batches_data['batch_id'] = this.state.batch_id
        this.batches_data['ingred_count'] = this.state.ingred_count
        this.batches_data['ingredient_weights'] = this.state.ingredient_weights
        localStorage.setItem(BATCHES_DATA, JSON.stringify(this.batches_data))
        this.updateScale(ingredients[ingred_count]['scale'])
    }

    jsonData = (ingredient_weights) => {
        let data = {
            'batch': this.state.batch_id,
            'ingredient_weights': ingredient_weights,
            'start_time': this.batches_data['start_time'],
            'end_time': currentDateTime(),
        }
        return JSON.stringify(data)
    }

    insertBatchData = async (ingredient_weights) => {
        this.startLoading()
        let post_data = this.jsonData(ingredient_weights)
        let response = await post(urls.INSERT_BATCH_DATA, post_data)
        if (response !== false) {
            // console.log(response)
            if (response['success']) {
                localStorage.removeItem(BATCHES_DATA)
                this.handleReset()
                this.openSnackbar('Current batch is completed. Select new batch.', 'success')
               // console.log("in_count",ingred_count)
                this.setState({ ingred_count: 0 })
//                this.disconnectSocket() //commenting to remove error
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

    reciveWeights = () => {
        
        this.state.socket.on('weight1', (weight1) => {
            this.setColors(parseFloat(weight1))
            //console.log(weight1)
            this.w1=weight1
        });

        //console.log(this.weight);
        this.state.socket.on('weight2', (weight2) => {
            this.setColors(parseFloat(weight2))
            //console.log(weight2)
            this.w2=weight2
        });
        //console.log(weight2);
        this.state.socket.on('weight3', (weight3) => {
            this.setColors(parseFloat(weight3))
            this.w3=weight3
        });
        //console.log(weight3);
        
        this.batchCountChange()
    }

    batchCountChange = () => {
        this.state.socket.on('batch_count_change', (is_change) => {
            if (is_change) {
                console.log("calling................... getBatchCount from batch count change")
                this.getBatchCount()
                console.log("batchCountChange  done")
            }
        });
    }

    getBatchCount = () => {
        let socket = io.connect(urls.BASE_URL, connectionOptions)
        this.setState({ socket: socket })
        this.state.socket.emit("batch_count", this.state.batch_id, (response) => {
            let batch_count = response
            if (parseInt(batch_count) > parseInt(this.state.total_batches)) {
                this.handleReset()
                this.setState({ ingred_count: 0 })
                this.openSnackbar('Assigned batch is closed. Select another batch.')
                console.log("batch count ",batch_count)
                return
            }
            this.setState({ batch_count: batch_count })
        });
    }

    connectSocket = () => {
        let socket = io.connect(urls.BASE_URL, connectionOptions)
        this.setState({ socket: socket })
    }

    //for solving logout issue in operator home screen
    /*disconnectSocket = () => {
        this.state.socket.disconnect();
    }*/

    setColors = (weight) => {
        let target_weight = parseFloat(this.state.target_weight)
        // let weight = parseFloat(this.state.weight)
        let weight_percent = parseInt((weight / target_weight) * 100)
        let progress_color, bg_alert_color, weight_status
        if (weight_percent > 90 && weight_percent <= 100) {
            progress_color = COLOR_GREEN
            bg_alert_color = BG_COLOR_GREEN
            weight_status = WEIGHT_STATUS_REACHED
        }
        else if (weight_percent > 100) {
            progress_color = COLOR_RED
            bg_alert_color = BG_COLOR_RED
            weight_status = WEIGHT_STATUS_OVER
        }
        else {
            progress_color = COLOR_ORANGE
            bg_alert_color = BG_COLOR_ORANGE
            weight_status = WEIGHT_STATUS_LESS
        }
        this.setState({
            progress_color: progress_color,
            bg_alert_color: bg_alert_color,
            weight: weight.toFixed(3),
            weight_percent: weight_percent,
            weight_status: weight_status
        })
        let is_auto_save = this.state.is_auto_save
        if (target_weight === parseFloat(weight.toFixed(3)) && is_auto_save === true) {
            this.saveData()
        }
    }

    weightIncrease = () => {
        let target_weight = parseFloat(this.state.target_weight)
        let weight = parseFloat(this.state.weight) + 20
        let weight_percent = parseInt((weight / target_weight) * 100)
        // let weight = parseFloat(this.state.weight) + 0.1
        // let weight_percent = this.state.weight_percent + 5
        let progress_color, bg_alert_color, weight_status
        if (weight_percent > 90 && weight_percent <= 100) {
            progress_color = COLOR_GREEN
            bg_alert_color = BG_COLOR_GREEN
            weight_status = WEIGHT_STATUS_REACHED
        }
        else if (weight_percent > 100) {
            progress_color = COLOR_RED
            bg_alert_color = BG_COLOR_RED
            weight_status = WEIGHT_STATUS_OVER
        }
        else {
            progress_color = COLOR_ORANGE
            bg_alert_color = BG_COLOR_ORANGE
            weight_status = WEIGHT_STATUS_LESS
        }
        this.setState({
            progress_color: progress_color,
            bg_alert_color: bg_alert_color,
            weight: weight.toFixed(3),
            weight_percent: weight_percent,
            weight_status: weight_status
        })
    }

    setScale = async (i) => {
        j = i;
        let ingredients = this.state.ingredient_list
        if (ingredients.length === 0) {
            this.openSnackbar('First select the batch.')
            return
        }

        //weight_percent: parseInt((weight / target_weight) * 100)
        await this.updateScale(this.state.scale_list[i])
        
    }

    updateScale = async (scale) => {
        this.startLoading()
        let post_data = JSON.stringify({
            'scale': scale
        })
        let response = await post(urls.UPDATE_SCALE, post_data)
        if (response !== false) {
            //console.log(response)
            if (response['success']) {
                this.setState({
                    scale: response['scale'],
                    anchor_scale: null
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

    setTare = async () => {
        let ingredients = this.state.ingredient_list
        if (ingredients.length === 0) {
            this.openSnackbar('First select the batch.')
            return
        }
        this.startLoading()
        let response = await post(urls.SET_TARE)
        if (response !== false) {
            // console.log(response)
            if (response['success']) {
                this.setState({ tare: response['tare'] })
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

    setZero = async () => {
        let ingredients = this.state.ingredient_list
        if (ingredients.length === 0) {
            this.openSnackbar('First select the batch.')
            return
        }
        this.startLoading()
        let response = await post(urls.SET_ZERO)
        if (response !== false) {
            // console.log(response)
            if (response['success']) {
                this.openSnackbar(response['message'], 'success')
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

    colorTheme = () => {
        return createMuiTheme({
            palette: {
                primary: {
                    main: this.state.progress_color,
                },
            }
        })
    }

    handleReset = () => {
        this.setState(initialState)
    }

    openSnackbar = (msg, alert_type = 'warning' || 'success' || 'error' || 'info') => {
        this.setState({
            open_snackbar: true,
            snackbar_msg: msg,
            alert_type: alert_type,
        })
    }

    printElement = (elem) => {
        return
        var mywindow = window.open('', 'PRINT', 'height=400,width=600');

        mywindow.document.write('<html><head><title>' + 'mmmmm' + '</title>');
        mywindow.document.write('</head><body >');
        mywindow.document.write('<h1>' + 'hhhhhhhhhhhhh' + '</h1>');
        // mywindow.document.write(document.getElementById(elem).innerHTML);
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/
        mywindow.print();
        mywindow.close();
        return true;
    }

    startLoading = () => {
        this.setState({ open_progress_bar: true })
    }

    stopLoading = () => {
        this.setState({ open_progress_bar: false })
    }


    f = (i) => {
    if(i == 0)
    { 
        this.x = i;
        this.w=this.w1;
        this.setScale(i);

    }

    if(i == 1)
    {
        this.x = i;
        this.w=this.w2;
        this.setScale(i);
    }

     if(i == 2)
    {
        this.x= i;
        this.w=this.w3;
        this.setScale(i);
    }
    }

   
    render() {

        if(this.x == 0)
        {
            
            this.w = this.w1;
            this.state.weight_percent= parseInt((this.w / this.state.target_weight) * 100)
          //  console.log("*********************************************************************************************************")
            //console.log(this.w)
            //console.log(this.state.target_weight)
            //console.log(this.weight_percent)
            //console.log("*********************************************************************************************************")
        }

        if(this.x == 1)
        {
            this.w = this.w2;
            this.state.weight_percent= parseInt((this.w / this.state.target_weight) * 100)
            //console.log(this.state.target_weight)
            //console.log(this.weight_percent)
        }
        if(this.x == 2)
        {
            this.w = this.w3;
            this.state.weight_percent= parseInt((this.w / this.state.target_weight) * 100)
            //console.log(this.state.target_weight)
            //console.log(this.weight_percent)
        }
        

       
        return (
            <div className='vh-100 scroll_hidden'>
                <CustomToolbar />
                <div className="container-fluid">
                    <div className='row scroll_shown' style={{ height: 'calc(100vh - 4rem)' }}>
                        <div className='col-md-2 border-right bg-light d-flex justify-content-center '>
                             <div>
                                <div className='text-center'>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.is_auto_save}
                                                onChange={(evt) => this.setState({ is_auto_save: !this.state.is_auto_save })}
                                                name="checkedB"
                                                color="primary"
                                            />
                                        }
                                        label="Auto Save"
                                        className='txt_bold'
                                    />
                                
                        </div>
                            <Button
                                    variant="contained"
                                    size="large"
                                    className="w-100 mt-4 pt-4 pb-4"
                                    style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}
                                    onClick={this.printElement}>
                                    <b>Print</b>
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="w-100 mt-4 pt-4 pb-4"
                                    style={{backgroundColor:"#4169E1", color:"#FFFFFF"}}
                                    disabled={this.state.is_auto_save}
                                    onClick={this.saveData}>
                                    <b>Save</b>
                                </Button> 
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="w-100 mt-4 pt-4 pb-4"
                                    style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}
                                    onClick={this.setTare}>
                                    <b>Tare</b>
                                </Button>                       
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="w-100 mt-4 pt-4 pb-4"
                                    style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}
                                    onClick={this.setZero}>
                                    <b>Zero</b>
                                </Button>
                                <br></br>
                                <br></br>
                                <br></br>
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="w-100 mt-4 mb-3"
                                    style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}
                                    onClick={() => signOut(this.props.history)}>
                                    <PowerSettingsNew className="mr-2" />
                                    <b>Logout</b>
                                </Button>
                            </div>
                        </div>
                        
                        
                        <div className='col-md-10 d-flex justify-content-center'>
                            <div className='w-100'>
                                <div className='row pt-4 pl-3 pr-3'>
                                    <div className='col-md-6 border rounded pointer'  style={{backgroundColor:"#96DED1"}}> 
                                    <div className='text-center pt-3 pb-3' >
                                            <b> PART NAME </b>
                                            <br />
                                            <b>{this.state.batch.toUpperCase() || '000.000'}</b>
                                        </div>
                                    </div>
                                    <div className='col-md-6 border rounded' style={{backgroundColor:"#96DED1"}}>
                                        <div className='text-center pt-3 pb-3' >
                                            <b> PART CODE </b>
                                            <br />
                                            <b>{this.state.formula_name || '000.000'}</b>
                                        </div>
                                    </div>
                                </div>
                               
                                <div className='row pt-3 pl-3 pr-3'>
                                    <div className='col-md-2 border rounded pointer' style={{backgroundColor: "#96DED1"}}> 
                                        <div className='text-center pt-3 pb-3' >
                                           <lable className='txt_larger'><br></br> <b>Tare Weight </b>
                                           <br />
                                                    {
                                                        this.state.target_weight === ''
                                                            ?
                                                            <p style={{ fontSize: '3rem' }}>000.000</p>
                                                            :
                                                            <p style={{ fontSize: '3rem' }}>{this.state.target_weight + ' ' + this.state.weight_unit}</p>
                                                    }
                                           </lable>
                                        </div>
                                    </div>
                                    <div className='col-md-6 border  border rounded' style={{backgroundColor: "this.state.weight_percent" >100 ? "red": "#96DED1" }}> 
                                        <div className='text-center pt-3 pb-3' >
                                            <label style={{ fontSize: '6rem' }}> 
                                            
                                                    {
                                                        this.state.target_weight === ''
                                                            ?
                                                            <>000.000</>
                                                            :
                                                            <>{this.state.target_weight + ' ' + this.state.weight_unit}</>
                                                    }
                                            
                                            <b style={{ fontSize: '5rem' }}><sub>{this.state.weight_unit || 'PCS'}</sub></b></label>
                                        </div> 
                                    </div>


                                    <div className='col-md-4 border  rounded' style={{backgroundColor:"#96DED1"}}>
                                        <div className='text-center pt-3 pb-3' >
                                        <label style={{ fontSize: '1.2rem' }}>  <b> UNIT  <br></br> WEIGHT </b>
                                        <br />
                                                    {
                                                        this.state.target_weight === ''
                                                            ?
                                                            <p style={{ fontSize: '3rem' }}>000.000</p>
                                                            :
                                                            <p style={{ fontSize: '3rem' }}>{this.state.target_weight + ' ' + this.state.weight_unit}</p>
                                                    }
                                                
                                                  
                                                    </label>
                                        </div>
                                    </div>
                                </div>
                                <div className='row pt-3 pl-3 pr-3'>
                                    <div className='col-md-4 border rounded pointer' style={{backgroundColor:"#96DED1"}} onClick={this.handleBatch}> 
                                        <div className='text-center pt-3 pb-3' >
                                        <b> LOW </b>
                                            <br />
                                            <b>{this.state.ingredient_name || '000.000'}</b>
                                        </div>
                                    </div>
                                    <div className='col-md-4 border rounded' style={{backgroundColor:"#96DED1"}}>
                                        <div className='text-center pt-3 pb-3' >
                                        <b> OK </b>
                                            <br />
                                            <b>{this.state.ingredient_code || '000.000'}</b>
                                        </div>
                                    </div>
                                    <div className='col-md-4 border rounded' style={{backgroundColor:"#96DED1"}}>
                                        <div className='text-center pt-3 pb-3' >
                                        <b> HIGH </b>
                                            <br />
                                            <b>{this.state.ingredient_code || '000.000'}</b>
                                        </div>
                                    </div>
                                  
                                </div>

                                <div className='row pt-3 pl-3 pr-3'>
                                    <div className='col-md-6 border rounded pointer' style={{backgroundColor:"#96DED1"}}  onClick={() => this.f(0)} > 
                                        <div className='text-center pt-3 pb-3' >
                                            <b> NET WEIGHT </b>
                                            <br></br>
                                            <b>{this.w1} <sub>{this.state.weight_unit || 'unit'}</sub></b>
                                        </div>
                                    </div>
                                    <div className='col-md-6 border rounded' style={{backgroundColor:"#96DED1"}} onClick={() => this.f(1)}>
                                        <div className='text-center pt-3 pb-3' >
                                            <b> GROSS WEIGHT </b>
                                            <br></br>
                                            <b>{this.w2} <sub>{this.state.weight_unit || 'unit'}</sub></b>
                                        </div>
                                    </div>
                                </div>
                                <div className='row pt-3 pl-3 pr-3'>
                                    <div className='col-md-12 border rounded pointer' style={{backgroundColor:"#4169E1",color:"#FFFFFF"}}  onClick={() => this.props.history.replace('/Sampling')}> 
                                        <div className='text-center pt-3 pb-3' >
                                        <b> Sampling </b>
                                            <br />
                                            <b> </b>
                                        </div>
                                    </div>  
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Dialog
                    open={this.state.dialog_batch}
                    disableEscapeKeyDown
                    fullWidth
                    maxWidth="sm"
                    className='w-100'>
                    <div className='text-center'>
                        <DialogTitle>BATCHES</DialogTitle>
                    </div>
                    <DialogContent className='p-4'>
                        <FormControl size="small" variant="outlined" className="w-100 mt-2">
                            <InputLabel>Select Batch</InputLabel>
                            <Select value={this.state.selected_batch} onChange={(evt) => this.setState({ selected_batch: evt.target.value })} label="Select Batch">
                                {Object.keys(this.state.batches_list).map((k, i) => (
                                    <MenuItem key={k} value={this.state.batches_list[i]['id']}>
                                        {this.state.batches_list[i]['batch_code'] + ' - ' + this.state.batches_list[i]['batch_name']}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ dialog_batch: false })} color="secondary" variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={this.selectBatch} color="primary" variant="contained">
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>
                <Menu
                    getContentAnchorEl={null}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                    anchorEl={this.state.anchor_scale}
                    keepMounted
                    open={Boolean(this.state.anchor_scale)}
                    onClose={() => this.setState({ anchor_scale: null })} >
                    <MenuList className='p-0'>
                        {Object.keys(this.state.scale_list).map((k, i) => (
                            <MenuItem key={k} onClick={() => this.setScale(i)}>
                          <b>      Scale - {this.state.scale_list[i]} </b>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
                <Snackbar
                    open={this.state.open_snackbar}
                    autoHideDuration={8000}
                    onClose={() => this.setState({ open_snackbar: false })}>
                    <Alert
                        onClose={() => this.setState({ open_snackbar: false })}
                        variant='filled'
                        elevation={6}
                        severity={this.state.alert_type}>
                        {this.state.snackbar_msg}
                    </Alert>
                </Snackbar>

                <Backdrop className={this.props.classes.backdrop} open={this.state.open_progress_bar}>
                    <CircularProgress size={80} color="inherit" />
                </Backdrop>
            </div>
        );
    }
}

export default withStyles(useStyles)(OperatorHome);