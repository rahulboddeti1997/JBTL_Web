import React, { useState, useEffect, useRef } from 'react'
import CsvDownloader from 'react-csv-downloader';
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { Typography, Table, Popconfirm, message, DatePicker, notification } from 'antd';
import AppLayout from '../../AppLayout';
import axios from 'axios';
import moment from 'moment';
import '../style.css'
import { useHistory } from "react-router-dom";
import { CustButton } from '../button'
import { EyeFilled, DeleteOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import { getColumnSearchProps } from "../TableProps";


const { Title, Text } = Typography;

const Customers = (props) => {
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const searchInput = useRef(null);

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
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${userId}/customers`
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

  const deleteTrans = async (row) => {
    const userId = props.id
    const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/customer/${row.id}`
    axios.defaults.headers.common = { 'Authorization': `Bearer ${userData?.accessToken}` }
    try {
      await axios.delete(url).then((res) => {
        notification.success({
          message: "Success",
          description: "Customer Deleted Successfully.",
          style: { width: 600 },
        });
        getUserData();
      })
    }
    catch (err) {
      notification.error({
        message: "Error",
        description: "Error occured while deleting the Transaction.",
        style: { width: 600 },
      });
      console.log(err)
    }
  }
  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
      ...getColumnSearchProps('customerName', 'customerName', searchInput),

    },
    {
      title: 'Old Balance',
      dataIndex: 'oldBalance',
      key: 'oldBalance',
      ...getColumnSearchProps('oldBalance', 'oldBalance', searchInput),

    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      ...getColumnSearchProps('companyName', 'companyName', searchInput),

    },
    {
      title: 'Place Name',
      dataIndex: 'placeName',
      key: 'placeName',
      ...getColumnSearchProps('placeName', 'placeName', searchInput),

    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      ...getColumnSearchProps('region', 'region', searchInput),

    },
    {
      title: 'Delete',
      render: (row) =>
        <Popconfirm
          title="Are you sure to delete this transaction?"
          onConfirm={() => deleteTrans(row)}
          okText="Yes"
          cancelText="No"
        >
          <DeleteOutlined />
        </Popconfirm>
    }
  ];

  return (
    <div style={{ width: '100%', padding: 25, backgroundColor: 'white', border: '2px solid #870000', borderRadius: 10 }}>
      <CsvDownloader
        style={{ marginLeft: 'auto', }}
        datas={stockData}
        filename={"customers.csv"}
      >
        <CustButton text='Download Customers' />
      </CsvDownloader>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={stockData}
        rowKey='id'
      />
    </div>
  )
}

export default Customers;