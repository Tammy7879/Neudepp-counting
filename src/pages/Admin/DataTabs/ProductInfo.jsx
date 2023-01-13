import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Home.css';
import { TextField, Button, CircularProgress, Tooltip, Fab, MenuItem, Backdrop, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, InputLabel } from '@material-ui/core';
import { Add } from '@material-ui/icons'
import { isEmpty, percentToPixel } from '../../../custom_libraries/validation';
import { post } from '../../../custom_libraries/serverRequests';
import urls from '../../../custom_libraries/urls';
import { withStyles } from '@material-ui/core/styles';
import { DataGridCustomToolbar, searchResult } from "../../../custom_libraries/common_functions";
import { DataGrid } from "@material-ui/data-grid";
import { CustomNoRowsOverlay } from "../../../custom_libraries/customComponents";
import { useStyles } from "../../../custom_libraries/customStyles";

const CONFIRMATION_DELETE = 'delete'
const CONFIRMATION_UPDATE = 'update'
const CONFIRMATION_INSERT = 'insert'

class ProductInfo extends Component {
    constructor(props) {
        super(props);
        this.page = React.createRef()
    }

    state = {
        columns: [],
        all_records: [],
        filtered_records: [],
        search_value: '',
        product_id: '',
        product_name: '',
        product_code: '',
        company_name: '',
        net_weight: '',
        unit_weight:'',
        gross_weight:'',
        quantity:'',
        date:'',
        records_per_page: 5,
        hidden_add_new: false,
        dialog_record_manipulation: false,
        dialog_confirmation_msg: '',
        dialog_confirmation_action: '',
        dialog_confirmation: false,
        open_progress_bar: false
    }


    componentDidMount() {
        this.setColumns()
        this.getAllProducts()
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = () => {
            return;
        };
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
                field: 'product_name',
                headerName: 'PRODUCT NAME',
                minWidth: 200,
                width: percentToPixel(30, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'product_code',
                headerName: 'PRODUCT CODE',
                minWidth: 200,
                width: percentToPixel(30, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'unit_weight',
                headerName: 'UNIT WEIGHT',
                minWidth: 200,
                width: percentToPixel(30, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'quantity',
                headerName: 'QUANTITY',
                minWidth: 200,
                width: percentToPixel(30, this.page.current.offsetWidth),
                disableColumnMenu: true,
                cellClassName: 'pointer',
                headerClassName: 'bg-secondary text-white'
            },
            {
                field: 'company_name',
                headerName: 'COMPANY NAME',
                minWidth: 200,
                width: percentToPixel(30, this.page.current.offsetWidth),
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

    getAllProducts = async () => {
        this.startLoading()
        let response = await post(urls.ALL_PRODUCT_INFO)
        if (response !== false) {
            if (response['success']) {
                let all_records = response['data']
                console.log(all_records);
                
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
            this.setState({
                product_id: '',
                product_name: '',
                product_code: '',
                unit_weight: '',
                quantity: '',
                company_name: '',
                hidden_add_new: false
            })
        }
        else if (action === CONFIRMATION_UPDATE) {
            this.setState({
                product_id: data['id'],
                product_name: data['product_name'],
                product_code: data['product_code'],
                unit_weight: data['unit_weight'],
                quantity: data['quantity'],
                company_name: data['company_name'],
                hidden_add_new: true
            })
        }
        this.setState({ dialog_record_manipulation: true })
    }

    confirmationDialog = (action) => {
        if (action === CONFIRMATION_UPDATE) {
            if (this.isEmptyFields()) {
                alert("Fill All Fields !!!")
                return
            }
            this.setState({ dialog_confirmation_msg: 'Do you want to "UPDATE" this Product ?' });
            this.setState({ dialog_confirmation: true });
        }
        else if (action === CONFIRMATION_DELETE) {
            this.setState({ dialog_confirmation_msg: 'Do you want to "DELETE" this Product ?' });
            this.setState({ dialog_confirmation: true });
        }
        this.setState({ dialog_confirmation_action: action });
    }

    confirmationDialogAction = () => {
        if (this.state.dialog_confirmation_action === CONFIRMATION_UPDATE) {
            this.updateProductInfo()
        }
        else if (this.state.dialog_confirmation_action === CONFIRMATION_DELETE) {
            this.deleteProductInfo()
        }
    }

    jsonData = (is_id = false) => {
        let data = {
            'product_name': this.state.product_name.trim(),
            'product_code': this.state.product_code.trim(),
            'unit_weight': this.state.unit_weight,
            'quantity':this.state.quantity,
            'company_name': this.state.company_name,
        } 
        if(this.state.quantity=='' || this.state.quantity==null)
        {
            delete data['quantity'];
        }
        console.log(data)
        if(this.state.company_name=='' || this.state.company_name==null){
            delete data['company_name'];
        }
        console.log(data)
        if (is_id) {
            data['id'] = this.state.product_id
        }
        return JSON.stringify(data)
    }

    isEmptyFields = () => {
        let data = [this.state.product_name, this.state.product_code, this.state.unit_weight]
        return isEmpty(data)
    }

    insertProductInfo = async () => {
        if (this.isEmptyFields()) {
            alert("Fill All Fields !!!")
            return
        }
        this.startLoading()
        let post_data = this.jsonData()
        console.log("post_data",post_data)
        let response = await post(urls.INSERT_PRODUCT_INFO, post_data)
        if (response !== false) {
            // console.log(response)
            if (response['success']) {
                this.closeDialogRecordManipulation()
                this.getAllProducts()
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

    updateProductInfo = async () => {
        this.startLoading()
        let post_data = this.jsonData(true)
        let response = await post(urls.UPDATE_PRODUCT_INFO, post_data)
        if (response !== false) {
            // console.log(response)
            if (response['success']) {
                this.closeDialogRecordManipulation()
                this.getAllProducts()
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

    deleteProductInfo = async () => {
        this.startLoading()
        let post_data = JSON.stringify({
            'id': this.state.product_id,
        })
        let response = await post(urls.DELETE_PRODUCT_INFO, post_data)
        if (response !== false) {
            // console.log(response)
            if (response['success']) {
                this.closeDialogRecordManipulation()
                this.getAllProducts()
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
            <div ref={this.page} className='scroll_hidden'>
                <div className='pt-2'>
                    <div style={{ height: 'calc(100vh - 9.3rem)', width: '100%' }}>
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
                <div>
                    <Dialog
                        open={this.state.dialog_record_manipulation}
                        disableEscapeKeyDown
                        fullWidth
                        maxWidth="md">
                        <div className='text-center'>
                            <DialogTitle> PRODUCT INFO </DialogTitle>
                        </div>
                        <DialogContent className=''>
                            <div className='row'>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Product Name"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.product_name}
                                        onChange={(evt) => this.setState({ product_name: evt.target.value })}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Product Code"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.product_code}
                                        onChange={(evt) => this.setState({ product_code: evt.target.value })}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Unit Weight"
                                        size="small"
                                        type="number"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.unit_weight}
                                        onChange={(evt) => this.setState({ unit_weight: evt.target.value })}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <TextField
                                        label="Qantity"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.quantity}
                                        onChange={(evt) => this.setState({ quantity: evt.target.value })}
                                    />
                                </div>    
                                <div className='col-md-4'>
                                    <TextField
                                        label="Company Name"
                                        size="small"
                                        variant="outlined"
                                        className="w-100 mt-3"
                                        value={this.state.company_name}
                                        onChange={(evt) => this.setState({ company_name: evt.target.value })}
                                    />
                                </div>                         
                            </div>
                        </DialogContent>
                        <DialogActions className='pt-3'>
                            <Button onClick={() => this.confirmationDialog(CONFIRMATION_DELETE)} color="secondary" variant="outlined" style={{ fontWeight: 'bolder' }} hidden={!this.state.hidden_add_new}>
                                Delete Product
                            </Button>
                            <Button onClick={() => this.confirmationDialog(CONFIRMATION_UPDATE)} color="primary" variant="outlined" style={{ fontWeight: 'bolder' }} hidden={!this.state.hidden_add_new}>
                                Update Product
                            </Button>
                            <Button onClick={this.insertProductInfo} color="primary" variant="outlined" style={{ fontWeight: 'bolder' }} hidden={this.state.hidden_add_new}>
                                Add Product
                            </Button>
                            <Button onClick={this.closeDialogRecordManipulation} color="default" variant="outlined" style={{ fontWeight: 'bolder' }}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={this.state.dialog_confirmation}
                        onClose={() => this.setState({ dialog_confirmation: false })} >
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
            </div>
        );
    }
}

export default withStyles(useStyles)(ProductInfo);

