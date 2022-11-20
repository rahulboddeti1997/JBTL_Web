import React, { useState } from 'react'
import { Form, Button, Row, Col, Card, Modal, Divider, Popconfirm} from 'antd';
import { Typography, Avatar } from 'antd';
// import Auth from "../utils/Auth";
import AppLayout from '../../AppLayout';
const { Title, Text } = Typography;
const Products = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
      setIsModalOpen(true);
    };
  
    const handleOk = () => {
      setIsModalOpen(false);
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
    };
  

    return (
        <AppLayout {...props}>
            <br /><br />
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify='start' style={{marginLeft:'1%'}}>
      <Col className="gutter-row" span={5}>
      <Card style={{borderRadius:15,marginBottom:20,borderWidth:0.5,borderColor:'#001529'}}>
              <Title level={4}>Product Name</Title>
              <Text><b>Price </b> <Text> : TZS 25000</Text></Text><br />
              <Divider />
              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-end'}}>
        <Button type='link' className="button-css" onClick={showModal}>Edit</Button>
        <Popconfirm
            title="Are you sure to delete?"
            okText="Yes"
            cancelText="No"
        >
        <Button type='link' className="button-css" >Delete</Button>
        </Popconfirm>
</div>
          </Card>
      </Col>
    
    </Row>
    <Modal title="Update Product" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>

</Modal>
        </AppLayout>
    )
}

export default Products;