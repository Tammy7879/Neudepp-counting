import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect, } from 'react-router-dom'

import './App.css'
import globalVariables from './custom_libraries/globalVariables';
import SignIn from './pages/SignIn'
import OperatorHome from './pages/Operator/OperatorHome'
import SamplingUI from './pages/Operator/SamplingUI'
import AdminHome from './pages/Admin/AdminHome'
import Data from './pages/Admin/Data'
import Settings from './pages/Admin/Settings'
import UserManipulation from './pages/Admin/UserManipulation'
import ReportManagement from './pages/Admin/ReportManagement';

const batches_data_schema = {
    'batch_id': '',
    'ingred_count': 0,
    'ingredient_weights': '',
    'start_time': '',
}

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    componentWillMount() {
        let schema_batches_data = JSON.stringify(batches_data_schema)
        let batches_data = localStorage.getItem(globalVariables.BATCHES_DATA)
        if (batches_data === null) {
            localStorage.setItem(globalVariables.BATCHES_DATA, schema_batches_data)
        }
        let wifi_data = localStorage.getItem(globalVariables.WIFI_DATA)
        if (wifi_data === null) {
            localStorage.setItem(globalVariables.WIFI_DATA, JSON.stringify({}))
        }
    }

    render() {
        return (
            <Router>
                <Switch>
                    {/* <Route exact path="/login" component={Login} />
                    <Route exact path="/signup" component={SignUp} /> */}
                    {/* <Route exact path="/" render={() => <Redirect to={'/home'} />} /> */}
                    <Route exact path="/sign_in" component={SignIn} />
                    <Route exact path="/operator-home" component={OperatorHome} />
                    <Route exact path="/admin-home" component={AdminHome} />
                    <Route exact path="/admin-data" component={Data} />
                    <Route exact path="/admin-reports" component={ReportManagement} />
                    <Route exact path="/admin-users" component={UserManipulation} />
                    <Route exact path="/admin-settings" component={Settings} />
                    <Route exact path="/" component={SignIn} />
                    <Route exact path="/sampling" component={SamplingUI} />
                    <Redirect to="/" />
                </Switch>
            </Router>
        )
    }
}

export default App
