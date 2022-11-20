import React, { useState, useEffect, useRef } from 'react'
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import CsvDownloader from 'react-csv-downloader';
import moment from 'moment';
import axios from 'axios'
import { Typography, Table, Modal, Tag, DatePicker, Button } from 'antd';
import {CustButton} from '../button'
// import Auth from "../utils/Auth";
import AppLayout from '../../AppLayout';
import {EyeFilled} from '@ant-design/icons';
import Draggable from 'react-draggable';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId:'AKIAXLNS2IHWSSLPUFW7', secretAccessKey:'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', region:'us-east-1'});

const ExpenseHistory = (props) => {
  const [expenseData,setExpenseData] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const [modalUrl, setModalUrl] = useState(null);

  const [startDate,setstartDate] = useState('');
  const [endDate,setendDate ]
  = useState('');
  const [userData,setUserData] = useState(null);

  useEffect (() =>{
    const data = localStorage.getItem('user')
    setUserData(JSON.parse(data))
    getExpenseDetails(JSON.parse(data));
},[])

const getSignedUrl = (link) => {
  let key_arr = link.split('/')
  let key = key_arr[key_arr.length-2]+'/'+key_arr[key_arr.length-1]
  var params = {Bucket: 'jbtlcustomerfiles', Key: key};
 s3.getSignedUrlPromise('getObject', params).then(function(url) {
    setModalUrl(url.toString())
    setOpen(true)
  }, function(err) { 
    //console.log(err) 
  });
}


const getExpenseDetails = async (res,startdate,enddate) => {
    // const userId = route.params.id ? route.params.id:res?.user.id;
    const userId = props.id
  let startDate = ''
  let endDate = ''
  if(startdate===undefined && enddate===undefined){
    startDate =new Date().getFullYear()+'-'+new Date().getMonth()+'-'+new Date().getDate()
    endDate=new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+(new Date().getDate()+1)
         }
    else{
      startDate = new Date(startdate).getFullYear()+'-'+(new Date(startdate).getMonth()+1)+'-'+new Date(startdate).getDate()
      endDate = new Date(enddate).getFullYear()+'-'+(new Date(enddate).getMonth()+1)+'-'+(new Date(enddate).getDate()+1)
    }
  try{ 
    const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/user/${userId}/getexpenseentry/${startDate}/${endDate}`;
    axios.defaults.headers.common = {'Authorization': `Bearer ${res?.accessToken}`}
  await axios.get(url).then((res)=>{
    let data = res.data.body;
    setIsLoading(false)
    setExpenseData(data)
  })
}
  catch(err){
    //console.log(err)
  }
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
  console.log(bounds)
};

    const columns = [
      {
        title: 'Created Date',
        dataIndex: 'createdDate',
        key: 'createdDate',
        render : (row) =>  moment(row.createdDate).format('DD-MM-YYYY')
      },
      {
        title: 'Bill No',
        dataIndex: 'billNo',
        key: 'billNo',
      },
        {
          title: 'Department',
          dataIndex: 'department',
          key: 'department',
        },
        {
          title: 'Expense Type',
          dataIndex: 'expenseType',
          key: 'expenseType',
        },   
    
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount',
        },
        {title:'Receipt',
        render: (row) => row.billpic && <EyeFilled onClick={() => getSignedUrl(row.billpic)}/>
      },
        {
          title: 'Remarks',
          dataIndex: 'remarks',
          key: 'remarks',
        },
      ];

      const handleOk = () => {
        setOpen(false);
      };
    
      const handleCancel = () => {
        setOpen(false);
      };

    return (
        <div style={{width:'95%'}}>
            <div style={{display:'flex',flexDirection:'row'}}>
    
            <RangePicker  style={{width:'32%'}}/>
            <CustButton text='Submit' />
                <CsvDownloader
                    style={{marginLeft:'auto',}}
                    datas={expenseData}
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
              alt='Image Not found'
              src={modalUrl}
              style={{ width: 450 }}
            />
      </Modal>
        <Table 
        loading={isLoading}
        columns={columns} 
        dataSource={expenseData}
        rowKey='id'
         />
        </div>

    )
}

export default ExpenseHistory;