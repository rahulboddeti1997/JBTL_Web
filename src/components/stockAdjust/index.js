import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Table,
  DatePicker,
  notification,
  Select,
  Input,
  Space,
} from "antd";
import { Typography, Avatar } from "antd";
import "../style.css";
import axios from "axios";
import moment from "moment";
import { useHistory } from "react-router-dom";
import AppLayout from "../../AppLayout";
import CsvDownloader from "react-csv-downloader";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { CustButton } from "../button";
const { RangePicker } = DatePicker;

const { Title, Text } = Typography;
const style = {
  background: "#0092ff",
  padding: "8px 0",
};
const { Search } = Input;

const { Option } = Select;

const StockAdjust = (props) => {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState("");
  const [conditions, setConditions] = useState();
  const [hist, setHist] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [downloadData, setDownloadData] = useState([]);
  const [startDate, setstartDate] = useState(
    moment().add(-1, "days").format("YYYY-MM-DD")
  );
  const [endDate, setendDate] = useState(moment().format("YYYY-MM-DD"));
  let history = useHistory();
  const [form] = Form.useForm();

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUserData(JSON.parse(data));
      getProductsDetails(JSON.parse(data));
      getUsersDetails(JSON.parse(data));
      getStockDetails(JSON.parse(data));
    } else {
      history.push("/login");
    }
  }, []);

  const getUsersDetails = async (resp) => {
    setIsLoading(true);
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/allusers`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${resp.accessToken}`,
      };
      await axios.get(url).then((res) => {
        const filtered = res.data.splice(1);
        let obj = {};
        filtered.map((item) => {
          let id = parseInt(item.id);
          obj[id] = item.displayName;
        });
        setUsers(filtered);
        setUser(filtered[0].id);
        getProductsDetails(resp, obj);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const onOk = async (e) => {
    let products = [];
    let totalStock = 0;
    let flag = true
    productData.forEach((item) => {
      e.products.forEach((i) => {
        if (item.id === i.productId) {
          if (i.quantity > item.quantity) {
            alert('entered quantity is more than existing quantity.')
            flag = false;
          } else {
            let stockVal = parseFloat(item.hoPrice) * parseFloat(i.quantity);
            totalStock += stockVal;
            let prod = {
              product: item.productName,
              quantity: i.quantity,
              hoPrice: item.hoPrice,
              stockValue: stockVal,
            };
            products.push(prod);
          }
        }
      });
    });

    const payload = {
      products: products,
      stockValue: totalStock.toString(),
      deliveryNoteNumber: e.deliveryNoteNumber,
      deliveryVehicalNumber: e.deliveryVechicalNumber,
      hoToSalesCash: e.salesCash,
      destinationPlace: e.destinationPlace,
      salesPersonID: e.salesPerson,
      entrydDate: e.entryDate,
    };
    if (flag) {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${e.salesPerson}/stockhotosp`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${userData?.accessToken}`,
      };
      try {
        await axios.post(url, payload).then((res) => {
          notification.success({
            message: "Success",
            description: "Stock Assigned Successfully.",
            style: { width: 600 },
          });
          form.resetFields();
        });
      } catch (err) {
        notification.error({
          message: "Error",
          description: "Error Occurred.",
          style: { width: 600 },
        });
      }
    }

  };

  const getProductsDetails = async (resp, obj) => {
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/products`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${resp.accessToken}`,
      };
      await axios.get(url).then((res) => {
        let data = res.data.body;
        getStockDetails(resp, obj, data);
        setProductData(data);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getStockDetails = async (res, obj, prodData) => {
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/stockhotosps/${startDate}/${moment(
        endDate
      )
        .add(1, "days")
        .format("YYYY-MM-DD")}`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${res.accessToken}`,
      };
      await axios.get(url).then((res) => {
        let data = res.data.body;
        let temp = data.map((item) => {
          let p = [];
          if (item.products !== "") {
            item.products.split(",").forEach((i) => {
              if (i !== " ") {
                let t = i.split(/product :/)[1].split(/quantity :/);
                p.push({ product: t[0], quantity: t[1] });
              }
              item["salesperson"] = obj[item.userId];
              item["product"] = p;
            });
          }
          return item;
        });
        getDownloadData(temp, prodData);
        setStockData(temp);
        setHist(temp);
        setIsLoading(false);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getDownloadData = (data, prodData) => {
    let temp = [];
    try {
      data.forEach((i) => {
        i?.product &&
          i.product.forEach((j) => {
            prodData.forEach((item) => {
              if (item.productName === j.product.trim()) {
                let stockVal =
                  parseFloat(item.hoPrice) * parseFloat(j.quantity);
                let p = {
                  createdDate: i.createdDate,
                  id: i.id,
                  product: j.product,
                  quantity: j.quantity,
                  salesperson: i.salesperson,
                  stockValue: stockVal,
                  hoPrice: item.hoPrice,
                  deliveryNoteNumber: i.deliveryNoteNumber,
                  deliveryVehicalNumber: i.deliveryVehicalNumber,
                  salesType: i.salesType,
                };
                temp.push(p);
              }
            });
          });
      });
      setDownloadData(temp);
    } catch (err) {
      console.log(err);
    }
  };

  const searchProduct = (e) => {
    let temp = hist.filter((item) =>
      item.products.includes(e.target.value.toUpperCase())
    );
    setStockData(temp);
    getDownloadData(temp, productData);
  };

  const createConditions = () => {
    return (
      <Form.List name="products">
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="start">
                  <Form.Item name={[name, "productId"]} style={{ width: 250 }}>
                    <Select placeholder="Select Product">
                      {productData.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.productName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name={[name, "quantity"]}>
                    <Input placeholder="Quantity"></Input>
                  </Form.Item>
                  {fields.length > 1 ? (
                    <Button
                      type="danger"
                      className="dynamic-delete-button"
                      style={{
                        width: 35,
                        padding: 6,
                        borderRadius: 17,
                        paddingTop: 4,
                        marginLeft: 10,
                      }}
                      onClick={() => remove(name)}
                      icon={<MinusCircleOutlined />}
                    ></Button>
                  ) : null}
                </Space>
              ))}
              <Form.Item style={{ textAlign: "center" }}>
                <Button
                  onClick={() => add()}
                  style={{
                    width: 35,
                    padding: 6,
                    borderRadius: 17,
                    paddingTop: 4,
                  }}
                  className="rount_btn"
                >
                  <PlusOutlined />
                </Button>
              </Form.Item>
            </div>
          );
        }}
      </Form.List>
    );
  };

  const columns = [
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (row) => moment(row).format("DD-MM-YYYY"),
    },
    {
      title: "Sales Person",
      dataIndex: "salesperson",
      key: "salesperson",
    },
    {
      title: "Cash",
      dataIndex: "hoToSalesCash",
      key: "hoToSalesCash",
    },
    {
      title: "Vehical Number",
      dataIndex: "deliveryVehicalNumber",
      key: "deliveryVehicalNumber",
    },
    {
      title: "Place",
      dataIndex: "destinationPlace",
      key: "destinationPlace",
    },
    {
      title: "Stock Value",
      dataIndex: "stockValue",
      key: "stockValue",
    },
  ];

  const status_columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  return (
    <AppLayout {...props}>
      <Space className="stock">
        {userData?.user?.email !== "sales@jbtlapp.com" && (
          <Card
            style={{ width: "38vw", minHeight: "86vh", marginLeft: -30 }}
            className="form-card"
          >
            <b style={{ fontSize: 20 }}>Stock Adjust</b>
            <Row>
              <Col span={24}>
                <br />

                <Form
                  layout="vertical"
                  form={form}
                  hideRequiredMark
                  onFinish={onOk}
                >
                  <Form.Item
                    name="salesPerson"
                    label={<h4 style={{ fontWeight: "bold" }}>Sales Person</h4>}
                    rules={[
                      {
                        required: true,
                        message: "Please select sales person",
                      },
                    ]}
                  >
                    <Select placeholder={"Select sales person"}>
                      {users.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.displayName}
                        </Option>
                      ))}
                    </Select>
                    {/* <Input placeholder="Please enter product name" /> */}
                  </Form.Item>
                  <Form.Item
                    name="products"
                    label={<h4 style={{ fontWeight: "bold" }}>Products</h4>}
                  >
                    {createConditions()}
                  </Form.Item>
                  <Form.Item
                    name="deliveryNoteNumber"
                    label={
                      <h4 style={{ fontWeight: "bold" }}>
                        Delivery Note Number
                      </h4>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter delivery note number",
                      },
                    ]}
                  >
                    <Input placeholder="Please enter delivery note number" />
                  </Form.Item>
                  <Form.Item
                    name="deliveryVechicalNumber"
                    label={
                      <h4 style={{ fontWeight: "bold" }}>
                        Delivery Vechical Number
                      </h4>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter delivery vechical number",
                      },
                    ]}
                  >
                    <Input placeholder="Please enter delivery vechical number" />
                  </Form.Item>
                  <Form.Item
                    name="destinationPlace"
                    label={
                      <h4 style={{ fontWeight: "bold" }}>Destination Place</h4>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter destination place",
                      },
                    ]}
                  >
                    <Input placeholder="Please enter destination place" />
                  </Form.Item>
                  <Form.Item
                    name="salesCash"
                    label={<h4 style={{ fontWeight: "bold" }}>Sales Cash</h4>}
                    rules={[
                      {
                        required: true,
                        message: "Please enter sales cash",
                      },
                    ]}
                  >
                    <Input placeholder="Please enter destination place" />
                  </Form.Item>
                  <Form.Item
                    name="entryDate"
                    label={
                      <h4 style={{ fontWeight: "bold" }}>
                        Entry Date
                      </h4>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select entry date",
                      },
                    ]}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <CustButton text="Submit" htmlType="submit" />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        )}
        <Card
          style={{
            width: "60vw",
            minHeight: "86vh",
            overflow: "scroll",
            alignSelf: "flex-start",
          }}
          className="form-card"
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <RangePicker
              style={{
                marginRight: 15,
                border: "1px solid #870000",
                borderRadius: 16,
                width: 300
              }}
              defaultValue={[moment().add(-1, "days"), moment()]}
              onChange={(e) => {
                setstartDate(e[0].format("YYYY-MM-DD"));
                setendDate(e[1].format("YYYY-MM-DD"));
              }}
            />
            <CustButton text="Submit" func={() => getUsersDetails(userData)} />
            <Search
              size="small"
              style={{
                marginLeft: 20,
                borderRadius: 16,
                width: 300,
                height: 35,
                marginTop: 12,
              }}
              allowClear
              onKeyUp={searchProduct}
              placeholder="search product"
            />

            <CsvDownloader
              style={{ marginLeft: "auto" }}
              datas={downloadData}
              filename={"hoToSP.csv"}
            >
              <CustButton text="Download Report" />
            </CsvDownloader>
          </div>
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={stockData}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  rowKey="id"
                  size="small"
                  scroll={{ x: 0, y: 150 }}
                  columns={status_columns}
                  dataSource={record.product}
                  pagination={false}
                />
              ),
            }}
          />
        </Card>
      </Space>
    </AppLayout>
  );
};

export default StockAdjust;
