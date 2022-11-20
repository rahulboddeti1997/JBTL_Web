import React, { useState, useEffect } from 'react'
import CsvDownloader from 'react-csv-downloader';
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { Typography, Table, Space, Tag, DatePicker } from 'antd';
import AppLayout from '../../AppLayout';
import axios from 'axios';
import moment from 'moment';

import '../style.css'
import {CustButton} from '../button'

const { Title, Text } = Typography;

const { RangePicker } = DatePicker;

const CollectionHistory = (props) => {
  const [salesData,setSalesData] = useState(null);
  const [customerData,setCustomerData] = useState(null);
  const [startDate,setstartDate] = useState('');
  const [endDate,setendDate ]
  = useState('');
  const [isLoading,setIsLoading] = useState(true);

  const [userData,setUserData] = useState(null);

  useEffect (() =>{
    const data = localStorage.getItem('user')
    setUserData(JSON.parse(data))
      getCustomers(JSON.parse(data));
},[])


  const getSalesDetails = async (res,obj) => {
    // setIsLoaded(false)
    const userId = props.id
    // if(startDate==='' && endDate===''){
     let startdate =new Date().getFullYear()+'-'+new Date().getMonth()+'-'+new Date().getDate()
     let  enddate=new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+(new Date().getDate()+1)
    //        }
    //   else{
    //     startDate = new Date(startDate).getFullYear()+'-'+(new Date(startDate).getMonth()+1)+'-'+new Date(startDate).getDate()
    //     endDate = new Date(startDate).getFullYear()+'-'+(new Date(startDate).getMonth()+1)+'-'+(new Date(startDate).getDate()+1)
    //   }
    try{ 
      const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/user/${userId}/saleentry/${startdate}/${enddate}`;
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

  const getProducts = async (trans_id,token) => {
  let data = ''
    try{ 
      const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/user/productsaleentry/${trans_id}`;
    axios.defaults.headers.common = {'Authorization': `Bearer ${token}`}
    return await axios.get(url)
  }
    catch(err){
      console.log(err)
    }
    return(data)

  }

  const getCustomers = async (user) => {
    setUserData(user)
    // const userId = route.params?.id ? route.params.id:user?.user.id;
    const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/user/3/customers`
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
        <div style={{width:'95%'}}>
            <div style={{display:'flex',flexDirection:'row'}}>
    
            <RangePicker  style={{width:'32%',marginRight:15}}/>
            <CustButton  text='Submit' />
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