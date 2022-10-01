import React, { Component } from 'react'
import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Typography, Avatar } from 'antd';
import BeatLoader from "react-spinners/BeatLoader";
// import Auth from "../utils/Auth";

const { Title, Text } = Typography;
const Login = (props) => {


const onFinish = () => {
    props.history.push("/dashboard")
}

    return (
        <Row type="flex" justify="center" align="middle" style={{minHeight: '100vh', background:'#00292fe8'}}>
        <Col style={{minWidth:'20%', width:350}}>
          <Card style={{borderRadius:15}}>
            <Col align="middle" style={{paddingBottom: 20}}>
              <img src={require("../assets/jblogo.jpg")} width="100" height="100"/>
              <br/><br/>
              <Title level={4}>Login</Title>
            </Col>
            <Form
              name="normal_login"
              className="login-form"
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
            >
            {/* {this.state.signIn.isFailed ? <Alert style={{marginBottom:15}} message={this.state.signIn.message} type="error" showIcon /> : null} */}
            
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your Email!',
                },
              ]}
            >
              <Input autoComplete='off' prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your Password!',
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
                autoComplete='off'
              />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{float:'centre'}}>
              {'Sign In'}
              </Button>
            </Form.Item>
          </Form>
          </Card>
        </Col>
      </Row>
    )
}

export default Login;