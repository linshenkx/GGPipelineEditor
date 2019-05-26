import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import App from './App';
import TaskDetails from './taskDetails';
const BasicRoute = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route exact path="/taskDetails" component={TaskDetails}/>
        </Switch>
    </HashRouter>
);


export default BasicRoute;