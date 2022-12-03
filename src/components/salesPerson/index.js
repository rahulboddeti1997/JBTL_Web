import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Card, Modal, Divider, Popconfirm, Tooltip } from 'antd';
import { Typography, Avatar } from 'antd';
import '../style.css'
import axios from 'axios'
import { useHistory } from "react-router-dom";
import AppLayout from '../../AppLayout';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const style = {
  background: '#0092ff',
  padding: '8px 0',
};
const SalesPerson = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salesPersonData, setSalesPersonData] = useState([]);
  const [userData, setUserData] = useState(null);
  let history = useHistory();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const data = localStorage.getItem('user')
    if(data){
      setUserData(JSON.parse(data))
      getSalesPersonDetails(JSON.parse(data));
    }else{
      history.push('/login')
    }

  }, [])

  const getSalesPersonDetails = async (res, startdate, enddate) => {
    try {
      const token = res.accessToken
      const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/allusers`;
      axios.defaults.headers.common = { 'Authorization': `Bearer ${res?.accessToken}` }
      await axios.get(url).then((res) => {
        let data = res.data;
        // console.log(data)
        // let filtered = data.map(item => {
        //    getReportDetails(token,item.id).then(re => {
        //   item['report'] =  re.data.body
        //   }).catch(err => {
        //   item['report'] =  false
        //     // console.log(err)
        //   })
        //   return item;
        // })
        // console.log(data.splice(1))
        setSalesPersonData(data.splice(1))
      })
    }
    catch (err) {
      //console.log(err)
    }
  }

//   const getReportDetails = async (token,id) => {
//     const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/report/${id}/getReport`;
//     axios.defaults.headers.common = {'Authorization': `Bearer ${token}`}
//     return await axios.get(url);
// }


  return (
    <AppLayout {...props}>
      <br /><br />
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify='start' style={{}}>
        
          {salesPersonData.map(item => {
            return (
              <Col className="gutter-row" style={{marginRight: '-20px'}} span={5} offset={1}>
            <Card title={item.displayName} className='card-' style={{ borderRadius: 15, marginBottom: 20, borderWidth: 0.5, borderColor: '#001529' }}>
              <Text><b>Outstanding </b> <Text> : TZS 25000</Text></Text><br />
              <Text><b>Cash </b> : TZS 25000</Text><br />
              <Text><b>Credit </b> : TZS 25000</Text>
              <Divider />
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end' }}>
              <Tooltip title='History'> <ArrowRightOutlined style={{fontSize:18}} onClick={() => { props.history.push("/history/sales/"+item.id); localStorage.setItem('openKey', 'history'); }}/></Tooltip>
                {/* <Button type='link' className="button-css" onClick={showModal}>Edit</Button>
                <Popconfirm
                  title="Are you sure to disable?"
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type='link' className="button-css" >Disable</Button>
                </Popconfirm>
                <Popconfirm
                  title="Are you sure to delete?"
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type='link' className="button-css" >Delete</Button>
                </Popconfirm> */}
              </div>
            </Card>
            </Col>)
          })}
      </Row>
      <Modal title="Edit Sales Person" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>

      </Modal>

    </AppLayout>
  )
}

export default SalesPerson;