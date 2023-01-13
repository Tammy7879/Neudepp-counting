import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; //npm install --save bootstrap
import exportFromJSON from 'export-from-json'; // npm i --save export-from-json
import '../Home.css';
import { RadioGroup, FormControlLabel, IconButton, Button, Table, TableRow, TableBody, TableCell, Radio, Tooltip, CircularProgress, Backdrop, Fab, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@material-ui/core';
import { PowerSettingsNew, Home, GetApp, ArrowForwardIos } from '@material-ui/icons'

import { post, getFreshToken } from '../../custom_libraries/serverRequests';
import urls from '../../custom_libraries/urls';
import globalVariables from '../../custom_libraries/globalVariables';
import { addDays, dateToString, getCurrentMonth, getCurrentWeek, percentToPixel, removeDays } from '../../custom_libraries/validation';
import { signOut } from '../../custom_libraries/auth';
import { withStyles } from '@material-ui/core/styles';
import { useStyles } from "../../custom_libraries/customStyles";
import CustomToolbar from "../../custom_libraries/CustomToolbar";
import { DataGridCustomToolbar, searchResult } from "../../custom_libraries/common_functions";
import { DataGrid } from "@material-ui/data-grid";
import { CustomNoRowsOverlay } from "../../custom_libraries/customComponents";

const DAILY = 'daily'
const WEEKLY = 'weekly'
const PRODUCT = 'PRODUCT'
const CUSTOM = 'custom'
class ReportManagement extends Component {

    constructor(props) {
        super(props);
        this.page = React.createRef()
    }

    state = {
        columns: [],
        all_records: [],
        filtered_records: [],
        search_value: '',
        record_id: '',
        batch: '',
        formula: '',
        formula_type: '',
        ingredients: '',
        weight_kg: '',
        start_time: '',
        end_time: '',
        batch_count: '',
        total_batches: '',
        client_name: '',
        username: '',
        records_duration: DAILY,
        from_date: '',
        to_date: '',
        is_custom_duration: false,

        records_per_page: 5,
        dialog_view: false,
        open_progress_bar: false
    }

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
        this.setDefaultDuration()
    }

    setDefaultDuration = () => {
        let date = new Date()
        let date_range = getCurrentMonth(date)
        let from_date = date_range['firstday']
        let to_date = date_range['lastday']
        this.getAllProductsData(dateToString(from_date), dateToString(to_date))
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
                field: 'product_code',
                headerName: 'PRODUCT CODE',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'product_name',
                headerName: 'PRODUCT NAME',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white',
            },
            {
                field: 'Date',
                headerName: 'DATE',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'time',
                headerName: 'TIME',
                type: 'number',
                minWidth: 200,
                width: percentToPixel(10, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'net_weight',
                headerName: 'NET WEIGHT',
                type: 'dateTime',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'gross_weight',
                headerName: 'GROSS WEIGHT',
                type: 'date',
                minWidth: 200,
                width: percentToPixel(25, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'quantity',
                headerName: 'QUANTITY',
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

    handleRecordsDuration = (evt) => {
        let records_duration = evt.target.value
        let date = new Date()
        let from_date = ''
        let to_date = removeDays(date, 0)
        if (records_duration === DAILY) {
            from_date = removeDays(date, 0)
        }
        else if (records_duration === WEEKLY) {
            let date_range = getCurrentWeek(date)
            from_date = date_range['firstday']
            to_date = date_range['lastday']
        }
      
        else if (records_duration === CUSTOM) {
            this.setState({
                records_duration: records_duration,
                is_custom_duration: true
            })
            return
        }
        else {
            return
        }
        this.setState({
            records_duration: records_duration,
            is_custom_duration: false
        })
        this.getAllProductsData(dateToString(from_date), dateToString(to_date))
    }

    handleBackward = () => {
        let records_duration = this.state.records_duration
        let date = new Date(this.state.from_date)
        let from_date, to_date
        if (records_duration === DAILY) {
            from_date = removeDays(date, 1)
            to_date = removeDays(date, 1)
        }
        else if (records_duration === WEEKLY) {
            let date_range = getCurrentWeek(removeDays(date, 7))
            from_date = date_range['firstday']
            to_date = date_range['lastday']
        }
        else {
            return
        }
        this.getAllProductsData(dateToString(from_date), dateToString(to_date))
    }

    handleForward = () => {
        let records_duration = this.state.records_duration
        let date = new Date(this.state.from_date)
        let from_date, to_date
        if (records_duration === DAILY) {
            from_date = addDays(date, 1)
            to_date = addDays(date, 1)
        }
        else if (records_duration === WEEKLY) {
            let date_range = getCurrentWeek(addDays(date, 7))
            from_date = date_range['firstday']
            to_date = date_range['lastday']
        }
      
        else {
            return
        }
        this.getAllProductsData(dateToString(from_date), dateToString(to_date))
    }

    handleFromDate = (evt) => {
        let from_date = evt.target.value
        this.getAllProductsData(from_date, this.state.to_date)
    }

    handleToDate = (evt) => {
        let to_date = evt.target.value
        this.getAllProductsData(this.state.from_date, to_date)
    }

    getAllProductsData = async (from_date, to_date) => {
        this.startLoading()
        let post_data = JSON.stringify({
            'from_date': from_date,
            'to_date': to_date
        })
        let response = await post(urls.BATCHES_DATA, post_data)
        if (response !== false) {
            if (response['success']) {
                let all_records = response['data']
                // Set 'sr_no' to Data
                all_records.map((currentelement, index, arrayobj) => { currentelement['sr_no'] = index + 1 });
                this.setState({
                    all_records: all_records,
                    filtered_records: all_records,
                    from_date: from_date,
                    to_date: to_date
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

    openDialogView = (data) => {
        this.setState({
            product_name: data['product_name'],
            product_code: data['product_code'],
            unit_weight: data['unit_weight'],
            low_quantity: data['low_quantity'],
            ok_quantity: data['ok_quantity'],
            high_quantity: data['high_quantity'],
            pre_tare: data['pre_tare'],
        })
        this.setState({ dialog_view: true })
    }

    downloadReport = () => {
        let columns = this.state.columns
        let filtered_records = this.state.filtered_records
        if (filtered_records.length < 1) {
            alert('No records to download.')
            return
        }
        let records = filtered_records.map(rec => {
            let new_cols = {}
            columns.forEach(col => {
                new_cols[col['headerName']] = rec[col['field']]
            });
            return new_cols
        })
        let dt = new Date()
        const data = records
        const fileName = 'BATCHES_REPORT_' + dt.toLocaleString().replace(/[^0-9]+/g, "")
        const exportType = 'csv'
        exportFromJSON({ data, fileName, exportType })
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
                                    style={{backgroundColor:"#4169E1", color:"#FFFFFF"}}
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
                                    style={{backgroundColor:"#4169E1", color:"#FFFFFF"}}
                                    onClick={() => signOut(this.props.history)}>
                                    <b>Logout</b>
                                    <PowerSettingsNew className="ml-2" />
                                </Button>
                            </div>
                        </div>
                        <div className='col-md-10'>
                            <div className='text-right pt-3' style={{backgroundColor:"#96DED1", color:"#FFFFFF"}}>
                                <IconButton
                                    onClick={this.handleBackward}>
                                    <ArrowForwardIos color="action" style={{ transform: 'scaleX(-1)' }} />
                                </IconButton>
                                <TextField
                                    label="From Date"
                                    size="small"
                                    variant="outlined"
                                    type="date"
                                    className="mt-1 mr-2"
                                    disabled={!this.state.is_custom_duration}
                                    value={this.state.from_date}
                                    onChange={this.handleFromDate}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        maxLength: 17,
                                        min: "2021-01-01",
                                        max: new Date().toISOString().split("T")[0],
                                        className: 'open_calender'
                                    }}
                                />
                                <TextField
                                    label="To Date"
                                    size="small"
                                    variant="outlined"
                                    type="date"
                                    className="mt-1"
                                    disabled={!this.state.is_custom_duration}
                                    value={this.state.to_date}
                                    onChange={this.handleToDate}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        maxLength: 17,
                                        min: this.state.from_date,
                                        max: new Date().toISOString().split("T")[0],
                                        className: 'open_calender'
                                    }}
                                />
                                <IconButton
                                    className='mr-2'
                                    onClick={this.handleForward}>
                                    <ArrowForwardIos color="action" />
                                </IconButton>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        row
                                        aria-label="gender"
                                        value={this.state.records_duration}
                                        onChange={this.handleRecordsDuration}>
                                        <FormControlLabel value={DAILY} control={<Radio />} label="Daily" />
                                        <FormControlLabel value={CUSTOM} control={<Radio />} label="Custom" />
                                        <FormControlLabel value={PRODUCT} control={<Radio />} label="Product" />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                            <div ref={this.page}>
                                <div style={{ height: 'calc(100vh - 8.5rem)', width: '100%' }}>
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
                                        onRowDoubleClick={(e) => this.openDialogView(e.row)}
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
                        open={this.state.dialog_view}
                        disableEscapeKeyDown
                        fullWidth
                        maxWidth="md"
                        onClose={() => this.setState({ dialog_view: false })}>
                        <div className='text-center'>
                            <DialogTitle>BATCH DETAILS</DialogTitle>
                        </div>
                        <DialogContent>
                            <Table className='border'>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <b>Batch</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.batch}
                                        </TableCell>
                                        <TableCell>
                                            <b>Formula</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.formula}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <b>Formula Type</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.formula_type}
                                        </TableCell>
                                        <TableCell>
                                            <b>Total Weight</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.weight_kg} kg
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <b>Ingredients</b>
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                            {this.state.ingredients}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <b>Batch Count</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.batch_count}
                                        </TableCell>
                                        <TableCell>
                                            <b>Total Batches</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.total_batches}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <b>Start Time</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.start_time}
                                        </TableCell>
                                        <TableCell>
                                            <b>End Time</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.end_time}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <b>Client Name</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.client_name}
                                        </TableCell>
                                        <TableCell>
                                            <b>Username</b>
                                        </TableCell>
                                        <TableCell>
                                            {this.state.username}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ dialog_view: false })} color="default" variant="outlined" style={{ fontWeight: 'bolder' }}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <Tooltip title="Download Report" placement='top-start' arrow>
                    <Fab
                        size='large'
                        color="primary"
                        onClick={this.downloadReport}
                        className='bottom_right'>
                        <GetApp />
                    </Fab>
                </Tooltip>
                <Backdrop className={this.props.classes.backdrop} open={this.state.open_progress_bar}>
                    <CircularProgress size={80} color="inherit" />
                </Backdrop>
            </div >
        )
    }
}

export default withStyles(useStyles)(ReportManagement);
