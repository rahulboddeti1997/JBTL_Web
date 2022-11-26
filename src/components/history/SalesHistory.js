import React, { useState, useEffect, useRef } from 'react'
import CsvDownloader from 'react-csv-downloader';
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { Typography, Table, Button, Modal, DatePicker } from 'antd';
import AppLayout from '../../AppLayout';
import axios from 'axios';
import moment from 'moment';
import '../style.css'
import {CustButton} from '../button'
import {EyeFilled} from '@ant-design/icons';
import Draggable from 'react-draggable';

const { Title, Text } = Typography;

const { RangePicker } = DatePicker;
var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId:'AKIAXLNS2IHWSSLPUFW7', secretAccessKey:'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', region:'us-east-1'});
const SalesHistory = (props) => {
  const [salesData,setSalesData] = useState(null);
  const [customerData,setCustomerData] = useState(null);
  const [startDate,setstartDate] = useState(moment().add(-1,'days').format('YYYY-MM-DD'));
  const [endDate,setendDate ]
  = useState(moment().format('YYYY-MM-DD'));
  const [isLoading,setIsLoading] = useState(true);
  const [productData,setProductData] = useState([]);
  const [modalUrl, setModalUrl] = useState(null);
  const [userData,setUserData] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  useEffect (() =>{
    getUserData();
},[])

const getUserData = () => {
  const data = localStorage.getItem('user');
  setUserData(JSON.parse(data));
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
        let prod = await getProducts(item.transId,res.accessToken).then(function(res) {return (res.data.body)});
        item['products'] = prod
        if(item['products'].length !== 0){
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

  const getSignedUrl = (link) => {
    let key_arr = link.split('/')
    let key = key_arr[key_arr.length-2]+'/'+key_arr[key_arr.length-1]
    console.log(link)
    var params = {Bucket: 'jbtlcustomerfiles', Key: key};
   s3.getSignedUrlPromise('getObject', params).then(function(url) {
    console.log(url)
      setModalUrl(url.toString())
      setOpen(true)
    }, function(err) { 
      //console.log(err) 
    });
  }

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

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
          title: 'Sale Amount',
          dataIndex: 'todaySaleCollectionAmount',
          key: 'todaySaleCollectionAmount',
        },
        {
          title: 'Sale Mode',
          dataIndex: 'todaySaleCollectionAmountMode',
          key: 'todaySaleCollectionAmountMode',
        },
        {
          title: 'Receipt Number',
          dataIndex: 'receiptNumber',
          key: 'receiptNumber',
        },
        {title:'Receipt',
        render: (row) => row.billpic && <EyeFilled onClick={() => getSignedUrl(row.billpic)}/>
      }
      ];

      const status_columns = [
        {
          title: 'Product',
          dataIndex: 'product',
          key: 'product',
        },
        {
          title: 'Quantity',
          dataIndex: 'quantity',
          key: 'quantity',
        },
        {
          title: 'Selling Price',
          dataIndex: 'sellingPrice',
          key: 'sellingPrice',
        },
        {
          title: 'Total Sale Value',
          dataIndex: 'totalAmount',
          key: 'totalAmount',
        },
      ]
      const handleOk = () => {
        setOpen(false);
      };
    
      const handleCancel = () => {
        setOpen(false);
      };
    return (
        <div style={{width:'100%',padding:25,backgroundColor:'white',border:'2px solid #870000',borderRadius:10}}>
            <div style={{display:'flex',flexDirection:'row'}}>
    
            <RangePicker  style={{marginRight:15,border: '1px solid #870000',borderRadius: 16}} defaultValue={[moment().add(-1,'days'),moment() ]} onChange={e => {setstartDate(e[0].format('YYYY-MM-DD'));setendDate(e[1].format('YYYY-MM-DD'))}}/>

            <CustButton  text='Submit'  size />
                <CsvDownloader
                    style={{marginLeft:'auto',}}
                    datas={salesData}
                    filename={"sample.csv"}
                >
          <CustButton text='Download Report' />
                </CsvDownloader>
            </div>
            <br />
            <Modal
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move',
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            onFocus={() => {}}
            onBlur={() => {}}
          >
            View Receipt
          </div>
        }
        open={open} onOk={handleOk} onCancel={handleCancel}
        footer={[ 
        <a key="download" href={modalUrl}>
        Download
        </a>,
          <Button key="back" type="primary" style={{marginLeft:20}} onClick={handleCancel}>
          Ok
        </Button>
        , ]}
        modalRender={(modal) => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            onStart={(event, uiData) => onStart(event, uiData)}
          >
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
            <img
              src={modalUrl}
              style={{ width: 450 }}
            />
      </Modal>
           
        <Table 
        loading={isLoading}
        columns={columns} 
        dataSource={salesData}
        rowKey='id'
        expandable={{ expandedRowRender: record => 
          <Table 
            rowKey='id'
            size='small'
            scroll={{ x: 0, y: 350 }}
            columns={status_columns}
            dataSource={record.products}
            pagination={false}
            />
        }}
         />
        </div>

    )
}

export default SalesHistory;