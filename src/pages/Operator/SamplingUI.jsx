import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Home.css';
import PropTypes from 'prop-types';
import { Typography, Button, CircularProgress, AppBar, Toolbar, Backdrop, Box, Tabs, Tab } from '@material-ui/core';
import { PowerSettingsNew, Home } from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import CustomToolbar from "../../custom_libraries/CustomToolbar";
import Calibration from "./tool/Calibration";
import { signOut } from "../../custom_libraries/auth";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`nav-tabpanel-${index}`}
            aria-labelledby={`nav-tab-${index}`}
            {...other}>
            {value === index && (
                <Box p={3} className='p-0'>
                    <Typography component={'span'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const useStyles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    tabs: {
        flexGrow: 1,
        alignSelf: 'flex-end'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
});

class SamplingUI extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        tab_value: 0,
        open_progress_bar: false
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = () => {
            return;
        };
    }

    handleTabs = (evt, tab_value) => {
        this.setState({ tab_value: tab_value })
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
                          
                                <Button
                                    variant="contained"
                                    size="medium"
                                    
                                    className="w-100"
                                    style={{backgroundColor:"#4169E1",color:"#FFFFFF",marginTop:320}}
                                    onClick={() => signOut(this.props.history)}>
                                    <b>Logout</b>
                                    <PowerSettingsNew className="ml-2" />
                                </Button>

                            </div>
                        </div>
                        <div className='col-md-10'>
                            <div className='row bg-secondary pt-2 pl-2 pr-2'>
                                <AppBar position="sticky" color='default'>
                                    <Toolbar className='bg-white p-0'>
                                        <Tabs
                                            className={this.props.classes.tabs}
                                            style={{ alignSelf: 'flex-end' }}
                                            indicatorColor="primary"
                                            textColor="primary"
                                            variant="scrollable"
                                            scrollButtons="on"
                                            value={this.state.tab_value}
                                            onChange={this.handleTabs} >
                                            
                                            <Tab component="div" label={<span style={{ fontWeight: 'bold' }}>Sampling</span>} />
                
                                        </Tabs>
                                    </Toolbar>
                                </AppBar>
                            </div>
                            <div>
                                
                                <TabPanel value={this.state.tab_value} index={0}>
                                    <Calibration />
                                </TabPanel>
        
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

export default withStyles(useStyles)(SamplingUI);
