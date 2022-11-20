import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Card, Modal, Divider, Popconfirm } from 'antd';
import { Typography, Avatar } from 'antd';
// import Auth from "../utils/Auth";
import '../style.css'
import axios from 'axios'
import AppLayout from '../../AppLayout';
const { Title, Text } = Typography;
const style = {
  background: '#0092ff',
  padding: '8px 0',
};
const SalesPerson = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salesPersonData, setSalesPersonData] = useState([]);
  const [userData, setUserData] = useState(null);

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
    setUserData(JSON.parse(data))
    getSalesPersonDetails(JSON.parse(data));
  }, [])

  const getSalesPersonDetails = async (res, startdate, enddate) => {
    try {
      const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/allusers`;
      axios.defaults.headers.common = { 'Authorization': `Bearer ${res?.accessToken}` }
      await axios.get(url).then((res) => {
        let data = res.data;
        console.log(data)
        setSalesPersonData(data)
      })
    }
    catch (err) {
      //console.log(err)
    }
  }


  return (
    <AppLayout {...props}>
      <br /><br />
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify='start' style={{}}>
        
          {salesPersonData.map(item => {
            return (
              <Col className="gutter-row" style={{marginRight: '-20px'}} span={5} offset={1}>
            <Card style={{ borderRadius: 15, marginBottom: 20, borderWidth: 0.5, borderColor: '#001529' }}>
              <Title level={4}>{item.displayName}</Title>
              <Text><b>Outstanding </b> <Text> : TZS 25000</Text></Text><br />
              <Text><b>Cash </b> : TZS 25000</Text><br />
              <Text><b>Credit </b> : TZS 25000</Text>
              <Divider />
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button type='link' className="button-css" onClick={() => { props.history.push("/history/sales/"+item.id); localStorage.setItem('openKey', 'history'); }}>History</Button>
                <Button type='link' className="button-css" onClick={showModal}>Edit</Button>
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
                </Popconfirm>
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