import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Login from './components/Login';
import AppliedRoute from "./AppliedRoute";
import Home from "./components/Home";
import Dashboard from "./components/dashboard";
import SPHistory from "./components/SP_History";
import SalesPerson from "./components/salesPerson";
import Products from "./components/products";
import StockAdjust from './components/stockAdjust';
import History from './components/History';
import DownloadReport from './components/downloadReport'
export default ({ childProps }) => (
    <BrowserRouter>
        <Switch>
            <AppliedRoute path="/" exact component={Home} props={childProps} />
            <AppliedRoute path="/login" exact isPrivate={false} component={Login} props={childProps} />
            <AppliedRoute path="/salesperson" exact isPrivate={false} component={SalesPerson} props={childProps} />
            <AppliedRoute path="/history/:tab(dashboard|sales|expense|collection|cashdeposit|customers)/:id" exact isPrivate={false} component={SPHistory} props={childProps} />
            <AppliedRoute path="/dashboard" exact isPrivate={false} component={Dashboard} props={childProps} />
            <AppliedRoute path="/products" exact isPrivate={false} component={Products} props={childProps} />
            <AppliedRoute path="/adminhistory/:tab(sptoho|addproduct)" exact isPrivate={false} component={History} props={childProps} />
            <AppliedRoute path="/stockAdjust" exact isPrivate={false} component={StockAdjust} props={childProps} />
            <AppliedRoute path="/downloadReport" exact isPrivate={false} component={DownloadReport} props={childProps} />
            {/* <Route component={NotFound}  /> */}
        </Switch>
    </BrowserRouter>
);
