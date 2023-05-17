import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Card, Modal, Divider, Popconfirm, Tooltip } from 'antd';
import { DatePicker, Drawer, Input, Select, Space, notification } from 'antd';
import { Typography, Avatar } from 'antd';
import { useHistory } from "react-router-dom";

import AppLayout from '../../AppLayout';
import axios from 'axios'
import { CustButton } from '../button';
import { UndoOutlined, PlusCircleOutlined, EditOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
const { Option } = Select;

const Products = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProd, setEditProd] = useState(false);
  const [addQuant, setAddQuant] = useState(false);
  const [userData, setUserData] = useState()
  const [productData, setProductData] = useState([]);
  const [prodId, setProdId] = useState('')
  const [title, setTitle] = useState('Add Product')
  const [form] = Form.useForm();
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

  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    form.resetFields();
    setTitle('Add Product')
    setOpen(true);
  };
  const onClose = () => {
    setAddQuant(false)
    setEditProd(false)
    setOpen(false);
  };

  const onReset = () => {
    form.resetFields()
  };

  const onOk = (e) => {
    console.log(e)
    if (form.isFieldsValidating()) {
      setOpen(false);
    } else {
      if (editProd) {
        editProduct(e)
      } else if (addQuant) {
        addQuantity(e)
      } else {
        addProduct(e)
      }
      getProductsDetails(userData)
    }

  };

  const addProduct = async (item) => {
    try {
      const userDetails = {
        "productName": item.name,
        "hoPrice": item.price,
        "remarks": item.remarks,
        "quantity": item.quantity
      }
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/product`;
      axios.defaults.headers.common = { 'Authorization': `Bearer ${userData?.accessToken}` }
      await axios.post(url, userDetails).then((res) => {
        console.log(res)
        notification.success({
          message: "Success",
          description: "Product Added Successfully.",
          style: { width: 600 },
        });
        onClose()
      })
    }
    catch (err) {
      notification.error({
        message: "Error",
        description: "Error Occured",
        style: { width: 600 },
      });
      //console.log(err)
    }
  }

  const editProduct = async (item) => {
    try {
      const userDetails = {
        "productName": item.name,
        "hoPrice": item.price,
        "remarks": item.remarks,
      }
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/product/${prodId}`
      axios.defaults.headers.common = { 'Authorization': `Bearer ${userData?.accessToken}` }
      await axios.post(url, userDetails).then((res) => {
        console.log(res)
        notification.success({
          message: "Success",
          description: "Product Details Updated Successfully.",
          style: { width: 600 },
        });
        onClose();
      })
    }
    catch (err) {
      notification.error({
        message: "Error",
        description: "Error Occured",
        style: { width: 600 },
      });
      //console.log(err)
    }
  }

  const addQuantity = async (item) => {
    try {
      const userDetails = {
        "productName": item.name,
        "remarks": item.remarks,
        "quantity": item.quantity,
        'entrydDate': item.entrydDate
      }
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/product/${userData.user.id}/addproduct`;
      axios.defaults.headers.common = { 'Authorization': `Bearer ${userData?.accessToken}` }
      await axios.post(url, userDetails).then((res) => {
        console.log(res)
        notification.success({
          message: "Success",
          description: "Quantity Added Successfully.",
          style: { width: 600 },
        });
        onClose();
      })
    }
    catch (err) {
      notification.error({
        message: "Error",
        description: "Error Occured",
        style: { width: 600 },
      });
      //console.log(err)
    }
  }

  const getProductsDetails = async (res) => {
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/products`;
      axios.defaults.headers.common = { 'Authorization': `Bearer ${res?.accessToken}` }
      await axios.get(url).then((res) => {
        let data = res.data.body;
        setProductData(data)
      })
    }
    catch (err) {
      //console.log(err)
    }
  }

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (data) {
      setUserData(JSON.parse(data))
      getProductsDetails(JSON.parse(data))
    } else {
      history.push('/login')
    }
  }, [])

  const handelEdit = (item) => {
    setTitle('Edit Product')
    setOpen(true)
    setEditProd(true)
    setProdId(item.id)
    form.setFieldsValue({
      name: item.productName,
      price: item.hoPrice,
      quantity: item.quantity,
    });
  }

  const handelQuantity = (item) => {
    setTitle('Add Quantity')
    setOpen(true)
    setAddQuant(true)
    form.setFieldsValue({
      name: item.productName,
      price: item.hoPrice,
      quantity: ''
    });

  }


  return (
    <AppLayout {...props}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {userData?.user?.email !== 'sales@jbtlapp.com' && <CustButton text='Add Product' style={{ cursor: 'pointer', alignSelf: 'center' }} func={showDrawer} />}
      </div>
      <br />

      <br />

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify='start' >

        <Col className="gutter-row" span={{ xs: 32, sm: 24, md: 16, lg: 8 }} style={{ display: 'flex', flexDirection: 'row', gap: 80, flexWrap: 'wrap' }}>

          {productData.map(item => {
            return (<Card title={item.productName} className='card- prod' style={{ borderRadius: 15, marginBottom: 20, borderWidth: 0.5, borderColor: '#001529', width: '20vw', width: 300 }}>
              <Text><b>Quantity </b> <Text> :  {Number(item.quantity).toFixed(2)}</Text></Text><br />
              <Text><b>Ho Price </b> <Text> : TZS {item.hoPrice}</Text></Text><br />
              <Text><b>Remarks </b> <Text> :  {item.remarks}</Text></Text><br />

              <Divider />
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 15 }}>
                {userData?.user?.email !== 'sales@jbtlapp.com' && <Tooltip title='Add Quantity'> <PlusCircleOutlined style={{ fontSize: 18 }} onClick={() => handelQuantity(item)} /></Tooltip>}
                {userData?.user?.email !== 'sales@jbtlapp.com' && <Tooltip title='Edit'> <EditOutlined onClick={() => handelEdit(item)} style={{ fontSize: 18 }} /></Tooltip>}
                {/* <Button type='link' className="button-css" onClick={showDrawer}>Edit</Button> */}
                {/* <Popconfirm
                  title="Are you sure to delete?"
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type='link' className="button-css" >Delete</Button>
                </Popconfirm> */}
              </div>
            </Card>)
          })}
        </Col>
      </Row>
      <Drawer
        title={title}
        width={400}
        onClose={onClose}
        open={open}
        bodyStyle={{
          paddingBottom: 80,
        }}
        extra={
          <Space>
            <Tooltip title='Reset' ><UndoOutlined hidden={editProd || addQuant} style={{ marginRight: 15 }} onClick={onReset} /></Tooltip>
          </Space>
        }
      >
        <Form layout="vertical" form={form} hideRequiredMark
          onFinish={onOk}>
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="entrydDate"
                label="Entry Date"
                rules={[
                  {
                    required: true,
                    message: 'Please select entry date',
                  },
                ]}
              >
                <DatePicker />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item style={{ display: 'flex', justifyContent: 'center' }}>
                <CustButton text='Submit' htmlType="submit" />

              </Form.Item>
            </Col>
          </Row>




        </Form>
      </Drawer>
    </AppLayout>
  )
}

export default Products;