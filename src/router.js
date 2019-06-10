import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import App from './App';
import TaskDetails from './taskDetails';
import ShowDetails from './showDetails';
const BasicRoute = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route exact path="/taskDetails" component={TaskDetails}/>
            <Route exact path="/showDetails" component={ShowDetails}/>
        </Switch>
    </HashRouter>
);


export default BasicRoute;