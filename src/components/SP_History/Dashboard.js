import React, { useState, useEffect, useRef } from 'react'
import CsvDownloader from 'react-csv-downloader';
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { Typography, Table, Button, Modal, DatePicker, notification } from 'antd';
import AppLayout from '../../AppLayout';
import axios from 'axios';
import moment from 'moment';
import '../style.css'
import { useHistory } from "react-router-dom";
import { CustButton } from '../button'
import { EyeFilled, DeleteOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';

const { Title, Text } = Typography;

const Dashboard = (props) => {
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  let history = useHistory();
  const draggleRef = useRef(null);
  useEffect(() => {
    getUserData();
  }, [])

  const getUserData = () => {
    setIsLoading(true)
    const data = localStorage.getItem('user');
    if (data) {
      setUserData(JSON.parse(data));
      getStock(JSON.parse(data));
    } else {
      history.push('/login')
    }

  }

  const getStock = async (user) => {
    setUserData(user)
    const userId = props.id
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${userId}/userstock`;
      axios.defaults.headers.common = { 'Authorization': `Bearer ${user?.accessToken}` }
      await axios.get(url).then((res) => {
        console.log(res.data)
        setStockData(res.data)
        setIsLoading(false)
      })
    }
    catch (err) {
      console.log(err)
    }
  }
  const columns = [

    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Stock (Quantity)',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, row) => {
        return Number(row.quantity.toFixed(2))
      }
    },
    {
      title: 'Ho Price',
      dataIndex: 'hoPrice',
      key: 'hoPrice',
    },
    {
      title: 'Stock Value',
      dataIndex: 'stockValue',
      key: 'stockValue',
      render: (text, row) => {
        return Number(row.stockValue.toFixed(2))
      }
    },

  ];

  return (
    <div style={{ width: '100%', padding: 25, backgroundColor: 'white', border: '2px solid #870000', borderRadius: 10 }}>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={stockData}
        rowKey='id'
      />


    </div>

  )
}

export default Dashboard;