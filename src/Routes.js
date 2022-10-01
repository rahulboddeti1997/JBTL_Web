import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Login from './components/Login';
import AppliedRoute from "./AppliedRoute";
import Home from "./components/Home";
import Dashboard from "./components/dashboard";
import History from "./components/history";
import SalesPerson from "./components/salesPerson";
import Products from "./components/products";
export default ({ childProps }) => (
    <BrowserRouter>
    <Switch>
        <AppliedRoute path="/" exact component={Home}  props={childProps} />
        <AppliedRoute path="/login" exact isPrivate={false} component={Login} props={childProps} />
        <AppliedRoute path="/dashboard" exact isPrivate={false} component={Dashboard} props={childProps} />
        <AppliedRoute path="/history" exact isPrivate={false} component={History} props={childProps} />
        <AppliedRoute path="/salesperson" exact isPrivate={false} component={SalesPerson} props={childProps} />
        <AppliedRoute path="/products" exact isPrivate={false} component={Products} props={childProps} />


        {/* <Route component={NotFound}  /> */}
    </Switch>
    </BrowserRouter>
);
