import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class Home extends Component {

  
  render() {
    return this.props.isAuthenticated ? (
      <Redirect to="/salesperson" />
    ) : (
      <Redirect to="/login" />
    );
   
  }
}

export default Home;
