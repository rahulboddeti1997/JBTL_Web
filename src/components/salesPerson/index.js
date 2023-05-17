import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Modal,
  Divider,
  Drawer,
  Tooltip,
  Button,
  notification,
  Popconfirm,
} from "antd";
import { Typography, Space } from "antd";
import "../style.css";
import axios from "axios";
import { useHistory } from "react-router-dom";
import AppLayout from "../../AppLayout";
import Chart from "react-apexcharts";

import {
  ArrowRightOutlined,
  UndoOutlined,
  UnlockOutlined,
  EditOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { CustButton } from "../button";
import { IoTRoboRunner } from "aws-sdk";

const { Title, Text } = Typography;
const style = {
  background: "#0092ff",
  padding: "8px 0",
};
const SalesPerson = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [salesPersonData, setSalesPersonData] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [userData, setUserData] = useState(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();


  let history = useHistory();
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [errMsg, setErrMsg] = useState("");
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const userDetails = { email: email, password: password };
    const url =
      "http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/auth/forgotpassword";
    await axios
      .post(url, userDetails)
      .then((res) => {
        setIsModalOpen(false);
        setEmail("");
        setPassword("");
        form1.setFieldsValue({ password: "" });
        form1.resetFields();
        notification.success({
          message: "Success",
          description: res.data.message,
          style: { width: 600 },
        });
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancel = () => {
    form1.resetFields();
    form1.setFieldsValue({ password: "" });
    setIsModalOpen(false);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onOk = async (e) => {
    setErrMsg("");
    if (form.isFieldsValidating()) {
      setOpen(false);
    } else if (e.password !== e.confirmPassword) {
      setErrMsg("Password & Confirm Password must be same.");
      // setOpen(false);
    } else {
      const userDetails = {
        displayName: e.displayName,
        email: e.email,
        password: e.password,
        matchingPassword: e.password,
        socialProvider: "LOCAL",
        using2FA: true,
      };
      setUserName(e.displayName);
      const url =
        "http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/auth/signup";
      await axios
        .post(url, userDetails)
        .then((res) => {
          setIsQrModalOpen(true);
          setImgUrl(res.qrCodeImage);
          getSalesPersonDetails(userData);
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUserData(JSON.parse(data));
      getSalesPersonDetails(JSON.parse(data));
    } else {
      history.push("/login");
    }
  }, []);

  const getSalesPersonDetails = async (resp) => {
    try {
      const token = resp.accessToken;
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/allusers`;
      axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
      await axios.get(url).then((res) => {
        let data = [];
        res.data.forEach((item) => {
          if (
            item.email === "tanzania@jbtlapp.com" ||
            item.email === "accounts@jbtlapp.com" ||
            item.email === "sales@jbtlapp.com" ||
            item.email === 'admin@jbtlapp.com'
          ) {
          } else {
            getReportDetails(token, item.id)
              .then((res) => {
                let d = res.data.body;
                item["outstanding"] =
                  Number(d.cash +
                    d.mpesa +
                    d.tigoPesa +
                    d.airtelMoney +
                    d.creditValue +
                    d.stockValue -
                    d.expensis).toFixed(2)
                item["cash"] = Number(d.cash + d.mpesa + d.tigoPesa + d.airtelMoney).toFixed(2)
                item["credit"] = Number(d.creditValue).toFixed(2)
              })
              .catch((err) => {
                item["outstanding"] = 0;
                item["cash"] = 0;
                item["credit"] = 0;
                console.log(err);
              });
            data.push(item);
          }
        });
        setTimeout(() => {
          setSalesPersonData(data);
        }, 2000)
      });
    } catch (err) {
      //console.log(err)
    }
  };
  const showDrawer = () => {
    form.resetFields();
    setOpen(true);
  };

  const getReportDetails = async (token, id) => {
    const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/report/${id}/getReport`;
    axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
    return await axios.get(url);
  };

  const handleDisable = async (id) => {
    console.log(id)
    const body = { enabled: false }
    const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${id}`;
    axios.defaults.headers.common = { Authorization: `Bearer ${userData.accessToken}` };
    await axios.put(url, body).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
  }



  return (
    <AppLayout {...props}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {userData?.user?.email !== "sales@jbtlapp.com" && (
          <CustButton
            text="Register"
            style={{ cursor: "pointer", alignSelf: "center" }}
            func={showDrawer}
          />
        )}
      </div>
      <br />
      <br />

      <Row
        gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
        type="flex"
        justify="start"
      >
        {salesPersonData.map((item) => {
          return (
            <Col
              key={item.id}
              className="gutter-row"
              style={{ marginRight: "-20px" }}
              span={{ xs: 32, sm: 24, md: 16, lg: 8 }}
              offset={1}
            >
              <Card
                title={item.displayName}
                className="card-"
                style={{
                  borderRadius: 15,
                  marginBottom: 20,
                  borderWidth: 0.5,
                  borderColor: "#001529",
                  width: 300,
                }}
              >
                <Text>
                  <b>Outstanding </b> <Text> : TZS {item?.outstanding}</Text>
                </Text>
                <br />
                <Text>
                  <b>Cash </b> : TZS {item?.cash}
                </Text>
                <br />
                <Text>
                  <b>Credit </b> : TZS {item?.credit}
                </Text>
                <Divider />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  {userData?.user?.email !== "sales@jbtlapp.com" && (
                    <Tooltip title="Forget Password">
                      <UnlockOutlined
                        style={{ fontSize: 18, marginRight: 20 }}
                        onClick={() => {
                          setEmail(item.email);
                          setIsModalOpen(true);
                        }}
                      />
                    </Tooltip>
                  )}

                  <Popconfirm
                    title="Are you sure to disable?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      handleDisable(item.id)
                    }}
                  >
                    <Tooltip title="Disable">
                      <DisconnectOutlined
                        style={{ fontSize: 18, marginRight: 20 }}
                      />
                    </Tooltip>
                  </Popconfirm>
                  <Tooltip title="History">
                    <ArrowRightOutlined
                      style={{ fontSize: 18 }}
                      onClick={() => {
                        props.history.push("/history/dashboard/" + item.id);
                        localStorage.setItem("openKey", "history");
                      }}
                    />
                  </Tooltip>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <Drawer
        title="Register"
        width={400}
        onClose={onClose}
        open={open}
        bodyStyle={{
          paddingBottom: 80,
        }}
        extra={
          <Space>
            <Tooltip title="Reset">
              <UndoOutlined style={{ marginRight: 15 }} onClick={onReset} />
            </Tooltip>
          </Space>
        }
      >
        <Form layout="vertical" form={form} hideRequiredMark onFinish={onOk}>
          <Row>
            <Col span={24}>
              <Form.Item
                name="displayName"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter name",
                  },
                ]}
              >
                <Input placeholder="Please enter name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Please enter email",
                  },
                ]}
              >
                <Input placeholder="Please enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please enter password",
                  },
                ]}
              >
                <Input.Password placeholder="Please enter password" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                rules={[
                  {
                    required: true,
                    message: "Please enter confirm password",
                  },
                ]}
              >
                <Input.Password placeholder="Please enter confirm password" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <p style={{ color: "red" }}>
                {" "}
                <b>{errMsg !== "" && errMsg}</b>
              </p>
              <br />
              <Form.Item style={{ display: "flex", justifyContent: "center" }}>
                <CustButton text="Submit" htmlType="submit" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      <Modal
        title="Forget Password"
        open={isModalOpen}
        footer={false}
        onCancel={handleCancel}
        closable
      >
        <Form onFinish={handleOk} layout="vertical" form={form1}>
          <Form.Item label="Email">
            <Input value={email} disabled />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Please enter password",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <CustButton text="Submit" htmlType="submit" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Qr Code(${userName})`}
        open={isQrModalOpen}
        onCancel={() => setIsQrModalOpen(false)}
        onOk={() => setIsQrModalOpen(false)}
        width={400}
        style={{ textAlign: "center" }}
      >
        <img height={250} width={250} src={imgUrl}></img>
      </Modal>
    </AppLayout>
  );
};

export default SalesPerson;
