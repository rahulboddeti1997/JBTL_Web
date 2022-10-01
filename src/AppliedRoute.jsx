import React from "react";
import { Route, Redirect } from "react-router-dom";

export default ({ isPrivate = true, component: C, props: cProps, ...rest }) =>
  !isPrivate || cProps.isAuthenticated ? (
    <Route {...rest} render={props => <C {...props} {...cProps} />} />
  ) : (
    <Redirect to="/login" />
  );
