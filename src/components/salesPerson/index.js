import React, { Component } from 'react'
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { Typography, Avatar } from 'antd';
// import Auth from "../utils/Auth";
import AppLayout from '../../AppLayout';
const { Title, Text } = Typography;
const SalesPerson = (props) => {


    return (
        <AppLayout {...props}>
      <div>Sales Persons</div>
        </AppLayout>
    )
}

export default SalesPerson;