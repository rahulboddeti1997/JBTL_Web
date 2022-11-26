import React, { useState, useEffect } from 'react'
import CsvDownloader from 'react-csv-downloader';
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { Typography, Table, Space, Tag, DatePicker } from 'antd';
import AppLayout from '../../AppLayout';
import axios from 'axios';
import moment from 'moment';
import dayjs from 'dayjs';

import '../style.css'
import {CustButton} from '../button'

const { Title, Text } = Typography;

const { RangePicker } = DatePicker;

const CollectionHistory = (props) => {
  const [salesData,setSalesData] = useState(null);
  const [customerData,setCustomerData] = useState(null);
  const [startDate,setstartDate] = useState(moment().add(-1,'days').format('YYYY-MM-DD'));
  const [endDate,setendDate ]
  = useState(moment().format('YYYY-MM-DD'));
  const [isLoading,setIsLoading] = useState(true);

  const [userData,setUserData] = useState(null);

  useEffect (() =>{
    getUserData()
},[])

const getUserData = () => {
  const data = localStorage.getItem('user')
  setUserData(JSON.parse(data))
    getCustomers(JSON.parse(data));
}

  const getSalesDetails = async (res,obj) => {
    // setIsLoaded(false)
    const userId = props.id
    try{ 
      const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/user/${userId}/saleentry/${startDate}/${moment(endDate).add(1,'days').format('YYYY-MM-DD')}`;
    axios.defaults.headers.common = {'Authorization': `Bearer ${res?.accessToken}`}
    await axios.get(url).then(async (response)=>{
      let data = response.data.body;
      let filtered_data = []
      for(let item of data){
        item['customerName'] = obj[item['customerId'].toString()]
        if(item['saleType'] === 'collection'){
          filtered_data.push(item)
        }
      }
      setIsLoading(false)
      setSalesData(filtered_data)
    })
  }
    catch(err){
      console.log(err)
     
    }
  }



  const getCustomers = async (user) => {
    setUserData(user)
    // const userId = route.params?.id ? route.params.id:user?.user.id;
    const userId = props.id
    const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/user/${userId}/customers`
    axios.defaults.headers.common = {'Authorization': `Bearer ${user?.accessToken}`}
    try{
      await axios.get(url).then((res)=>{
        let obj = {};
         res.data.map(item => {
          let id =parseInt(item.id)
          obj[id] = item.customerName
        })
        setCustomerData(obj)
        getSalesDetails(user,obj);
      })
    }
    catch(err){
      console.log(err)
    }
  }
    const columns = [
      {
        title: 'Created Date',
        dataIndex: 'createdDate',
        key: 'createdDate',
        render : (row) =>  moment(row.createdDate).format('DD-MM-YYYY')
      },
        {
          title: 'Transaction ID',
          dataIndex: 'transId',
          key: 'transId',
        },
        {
          title: 'Customer',
          dataIndex: 'customerName',
          key: 'customerName',
        },   
        {
          title: 'Collection Amount',
          dataIndex: 'creditCollectionAmount',
          key: 'creditCollectionAmount',
        },
        {
          title: 'Collection Mode',
          dataIndex: 'creditCollectionMode',
          key: 'creditCollectionMode',
        },
        {
          title: 'Receipt Number',
          dataIndex: 'receiptNumber',
          key: 'receiptNumber',
        },
      ];
    return (
        <div style={{width:'100%',padding:25,backgroundColor:'white',border:'2px solid #870000',borderRadius:10}}>
            <div style={{display:'flex',flexDirection:'row'}}>
    
            <RangePicker  style={{marginRight:15,border: '1px solid #870000',borderRadius: 16}} defaultValue={[moment().add(-1,'days'),moment() ]} onChange={e => {setstartDate(e[0].format('YYYY-MM-DD'));setendDate(e[1].format('YYYY-MM-DD'))}}/>
            <CustButton  text='Submit' func={getUserData} />
                <CsvDownloader
                    style={{marginLeft:'auto',}}
                    datas={salesData}
                    filename={"sample.csv"}
                >
          <CustButton text='Download Report' />
                </CsvDownloader>
            </div>
            <br />

        <Table 
        loading={isLoading}
        columns={columns} 
        dataSource={salesData}
        rowKey='id'
         />
        </div>

    )
}

export default CollectionHistory;