import React, { useState, useEffect } from 'react'

import { Layout, Button, Typography, Menu, Drawer } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  DatabaseOutlined,
  InsertRowBelowOutlined,
  BarsOutlined,
  HomeOutlined
} from '@ant-design/icons';
// import Auth from "../utils/Auth";
import { Mobile, Default } from './Responsive';
import '../src/components/style.css'
import './App.css';
import { useHistory } from "react-router-dom";
const { Header } = Layout;
const { Text } = Typography;
const getOpenKeys = () => {
  const keys = localStorage.getItem('openKey');
  if (keys) {
    return (keys);
  }
  return 'salesperson';
}

const AppHeader = (props) => {
  let history = useHistory();

  const [visible, setVisible] = useState(false);
  const [openKey, setOpenKey] = useState(getOpenKeys());
  const [userData, setUserData] = useState(null);

  const handleClick = (item) => {
    if (item.key !== 'logout') {
      localStorage.setItem('openKey', item.key)
      setOpenKey(item.key)
      history.push('/' + item.key);
    }
    else {
      localStorage.clear()
      history.push('/login')
    }

  }

  useEffect(() => {
    getUserData();
  }, [])

  const getUserData = () => {
    const data = localStorage.getItem('user');
    if (data) {
      setUserData(JSON.parse(data).user.displayName);
      console.log(JSON.parse(data).user.displayName)
    } else {
      history.push('/login')
    }

  }
  return (
    <Header className="site-layout-background" style={{
      padding: 0,
      height: '48px',
      lineHeight: '40px',
      backgroundColor: '#00292fe8',
    }}
    >
      <Default>
        <Menu
          mode="horizontal"
          theme='dark'
          defaultSelectedKeys={openKey}
          onClick={handleClick}
        >
          <div style={{ float: 'left' }}>
            {/* <img src={require('./assets/jblogo.jpg')} width="50" height="50" ></img> */}
            <Text style={{
              fontSize: '1.7rem',
              fontWeight: 800,
              fontFamily: "'Comfortaa'",
              letterSpacing: '4px',
              color: '#fff',
              marginLeft: 30,
              marginRight: 30
            }} > JBTL</Text>

          </div>
          <Menu.Item key="dashboard" icon={<HomeOutlined />}>
            Dashboard
          </Menu.Item>
          {/* <Menu.Item key="history" icon={<InfoCircleOutlined />}>
                  History
                </Menu.Item> */}

          <Menu.Item key="salesperson" icon={<UserOutlined />}>
            Sales Persons
          </Menu.Item>
          <Menu.Item key="products" icon={<ShopOutlined />}>
            Products
          </Menu.Item>
          <Menu.Item key="stockAdjust" icon={<InsertRowBelowOutlined />}>
            Stock Adjust
          </Menu.Item>
          <Menu.Item key="adminhistory/sptoho" icon={<DatabaseOutlined />}>
            History
          </Menu.Item>
          <Menu.Item className='logout' style={{ marginLeft: 'auto' }}>
            <Text style={{ fontSize: 20 }}><b> {userData}</b> </Text>
          </Menu.Item>
          <Menu.Item key="logout" className='logout' style={{ marginLeft: 'auto' }}>
            <Text strong style={{ marginRight: 15 }}> </Text><Button type="link" icon={<LogoutOutlined />}>Logout</Button>
          </Menu.Item>
        </Menu>
      </Default>

      <Mobile>
        <Text style={{
          fontSize: 25,
          fontWeight: 600,
          lineHeight: '32px',
          color: '#fff',
          marginTop: 5
        }} > JBTL</Text>

        <BarsOutlined style={{ fontSize: '32px', color: '#FFF', float: 'left', marginRight: 16, marginTop: 5, marginLeft: 5 }} onClick={() => setVisible(true)} />
        <Drawer
          placement="left"
          closable={false}
          onClose={() => this.setVisible(false)}
          visible={visible}
          className="nav-drawer"
        >
          <Menu mode="inline" style={{ paddingTop: 50, marginBottom: 'auto' }} onClick={handleClick} theme='dark' defaultSelectedKeys={['salesperson']}>

            {/* <Menu.Item key="salesperson" icon={<UserOutlined />}>
                  Sales Persons
                </Menu.Item>
                <Menu.Item key="products" icon={<ShopOutlined />}>
                  Products
                </Menu.Item>
              <div style={{    paddingTop: '52vh'}}>
                <Text strong style={{marginRight:15}}> </Text><Button  type="link" icon={<LogoutOutlined/>}>Logout</Button>
              </div> */}
            <Menu.Item key="salesperson" icon={<UserOutlined />}>
              Sales Persons
            </Menu.Item>
            <Menu.Item key="products" icon={<ShopOutlined />}>
              Products
            </Menu.Item>
            <Menu.Item key="stockAdjust" icon={<InsertRowBelowOutlined />}>
              Stock Adjust
            </Menu.Item>
            <Menu.Item key="adminhistory/sptoho" icon={<DatabaseOutlined />}>
              History
            </Menu.Item>
            <Menu.Item key="logout" className='logout' style={{ marginLeft: 'auto' }}>
              <Text strong style={{ marginRight: 15 }}> </Text><Button type="link" icon={<LogoutOutlined />}>Logout</Button>
            </Menu.Item>
          </Menu>

        </Drawer>
      </Mobile>


    </Header>
  )
}

export default AppHeader