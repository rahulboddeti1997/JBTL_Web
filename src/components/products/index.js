import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Card, Modal, Divider, Popconfirm} from 'antd';
import {  DatePicker, Drawer, Input, Select, Space } from 'antd';
import { Typography, Avatar } from 'antd';
// import Auth from "../utils/Auth";
import AppLayout from '../../AppLayout';
import axios from 'axios'
import { CustButton } from '../button';
const { Title, Text } = Typography;
const { Option } = Select;

const Products = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData,setProductData] = useState([]);


    const showModal = () => {
      setIsModalOpen(true);
    };
  
    const handleOk = () => {
      setIsModalOpen(false);
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
    };
  
    const [open, setOpen] = useState(false);
    const showDrawer = () => {
      setOpen(true);
    };
    const onClose = () => {
      setOpen(false);
    };

    const getProductsDetails = async (res) => {
      try{ 
        const url = `http://ec2-54-152-245-106.compute-1.amazonaws.com:8080/api/products`;
      axios.defaults.headers.common = {'Authorization': `Bearer ${res?.accessToken}`}
      await axios.get(url).then((res)=>{
        let data = res.data.body;
        console.log(data)
        setProductData(data)
      })
    }
      catch(err){
        //console.log(err)
      }
    }

    useEffect(() => {
      const data = localStorage.getItem('user')
      getProductsDetails(JSON.parse(data))
    },[])


    return (
        <AppLayout {...props}>
          <div style={{display:'flex',justifyContent:'center'}}>
      <CustButton text='Add Product' style={{cursor:'pointer',alignSelf:'center'}} func={showDrawer} />
      </div>
            <br />

            <br />

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify='start' >
        
      <Col className="gutter-row" span={5}>

      <Card style={{borderRadius:15,marginBottom:20,borderWidth:0.5,borderColor:'#001529'}}>
              <Title level={4}>Product Name</Title>
              <Text><b>Price </b> <Text> : TZS 25000</Text></Text><br />
              <Divider />
              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-end'}}>
        <Button type='link' className="button-css" onClick={showDrawer}>Edit</Button>
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
    {/* <Modal title="Update Product" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>

</Modal> */}
<Drawer
        title="Add Product"
        width={400}
        onClose={onClose}
        
        open={open}
        bodyStyle={{
          paddingBottom: 80,
        }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onClose} type="primary">
              Submit
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" hideRequiredMark>
          <Row >
            <Col span={24}>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: 'Please enter product name',
                  },
                ]}
              >
                <Input placeholder="Please enter product name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
            <Form.Item
                name="price"
                label="Price"
                rules={[
                  {
                    required: true,
                    message: 'Please enter price',
                  },
                ]}
              >
                <Input placeholder="Please enter price" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
            <Form.Item
                name="quantity"
                label="Quantity"
                rules={[
                  {
                    required: true,
                    message: 'Please enter quantity',
                  },
                ]}
              >
                <Input placeholder="Please enter quantity" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
            <Form.Item
                name="remarks"
                label="Remarks"
                rules={[
                  {
                    required: true,
                    message: 'Please enter remarks',
                  },
                ]}
              >
                <Input placeholder="Please enter remarks" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
        </AppLayout>
    )
}

export default Products;