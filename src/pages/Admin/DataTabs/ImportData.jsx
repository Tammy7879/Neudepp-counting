import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Home.css';
import { TextField, Button, FormLabel, FormControlLabel, RadioGroup, Radio, CircularProgress, Tooltip, Fab, MenuItem, Backdrop, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, InputLabel } from '@material-ui/core';
import { Add } from '@material-ui/icons'
import { ImportExport} from '@material-ui/icons'
import { isEmpty, percentToPixel } from '../../../custom_libraries/validation';
import { post } from '../../../custom_libraries/serverRequests';
import urls from '../../../custom_libraries/urls';
import { withStyles } from '@material-ui/core/styles';
import { DataGridCustomToolbar, searchResult } from "../../../custom_libraries/common_functions";
import { DataGrid } from "@material-ui/data-grid";
import { CustomNoRowsOverlay } from "../../../custom_libraries/customComponents";
import { useStyles } from "../../../custom_libraries/customStyles";

class ImportData extends Component {
    constructor(props) {
        super(props);
        this.page = React.createRef()
    }
    state  ={
        export_type: 'xlsx',
        selectedFile: null,
    }

handleImportType = (evt) => {
    this.setState({ export_type: evt.target.value });
}

onFileChange = event => {
     
    // Update the state
    this.setState({ selectedFile: event.target.files[0] });
   
  }
  onFileUpload = () => {
    this.startLoading();
    // Create an object of formData
    const formData = new FormData();
   
    // Update the formData object
    formData.append(
      "myFile",
      this.state.selectedFile,
      this.state.selectedFile.name
    );
   
    // Details of the uploaded file
    console.log(this.state.selectedFile);
   
    // Request made to the backend api
    // Send formData object
    //axios.post("api/uploadfile", formData);
    let response = post(urls.IMPORT_DATA, FormData)
    if (response !== false) {
        // console.log(response)
        if (response['success']) {
            alert(response['message'])
        }
        else {
            alert(response['message'])
        }
    }
    else {
        alert('Something went wrong. Please try again !!!')
    }
    this.stopLoading();
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
           <div className="col-md-12 ">
               <div className='text-center pt-3 pb-3'>
                   <b> IMPORT DATA </b>
               </div>
                       <TextField
                           label="Upload file"
                           size="small"
                           variant="outlined"
                           type="file"
                           className="w-100 mt-3 pointer"
                           
                           onChange={this.onFileChange}              
                           InputLabelProps={{
                               shrink: true,
                           }}
                       />
                     <FormControl component="fieldset" className='w-100 mt-4'>
                            <FormLabel>Import Type</FormLabel>
                            <RadioGroup value={this.state.Import_type} onChange={this.handleImportType} className='ml-3'>
                                <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" />
                                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                                <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                            </RadioGroup>
                        </FormControl>
                       <div className="text-right">
                           <Button
                               variant="contained"
                               size="large"
                               color='primary'
                               className="mt-4"
                               onClick={this.onFileUpload}>
                               <ImportExport className="mr-2" />
                               <b>IMPORT DATA</b>
                           </Button>
                       </div>
                   </div>
        </div>
        );
    }
}

export default withStyles(useStyles)(ImportData);