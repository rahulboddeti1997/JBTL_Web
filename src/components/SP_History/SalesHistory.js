import React, { useState, useEffect, useRef } from "react";
import CsvDownloader from "react-csv-downloader";
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import {
  Typography,
  Table,
  Button,
  Modal,
  DatePicker,
  notification,
  Input,
  Popconfirm,
} from "antd";
import AppLayout from "../../AppLayout";
import axios from "axios";
import moment from "moment";
import "../style.css";
import { useHistory } from "react-router-dom";
import { CustButton } from "../button";
import { EyeFilled, DeleteOutlined } from "@ant-design/icons";
import Draggable from "react-draggable";
import { getColumnSearchProps } from "../TableProps";

const { Title, Text } = Typography;
const { Search } = Input;

const { RangePicker } = DatePicker;
var AWS = require("aws-sdk");
var s3 = new AWS.S3({
  accessKeyId: "AKIAUR75N36ZLXZH6ERW",
  secretAccessKey: "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",
  region: "us-east-1",
});
const SalesHistory = (props) => {
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [startDate, setstartDate] = useState(
    moment().add(-1, "days").format("YYYY-MM-DD")
  );
  const [endDate, setendDate] = useState(moment().format("YYYY-MM-DD"));
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState([]);
  const [hist, setHist] = useState([]);
  const [modalUrl, setModalUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState(null)
  const [disabled, setDisabled] = useState(false);
  const searchInput = useRef(null);
  const [downloadData, setDownloadData] = useState([]);
  const [discountDownloadData, setDicountDownloadData] = useState([]);

  const [open, setOpen] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  let history = useHistory();
  const draggleRef = useRef(null);
  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = () => {
    setIsLoading(true);
    const data = localStorage.getItem("user");
    if (data) {
      setUserData(JSON.parse(data));
      getCustomers(JSON.parse(data));
      getSalesPersonDetails(JSON.parse(data))
    } else {
      history.push("/login");
    }
  };


  const getSalesDetails = async (res, obj, prodData) => {
    // setIsLoaded(false)
    const userId = props.id;
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${userId}/saleentry/${startDate}/${moment(
        endDate
      )
        .add(1, "days")
        .format("YYYY-MM-DD")}`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${res?.accessToken}`,
      };
      await axios.get(url).then(async (response) => {
        let data = response.data.body;
        let filtered_data = [];
        for (let item of data) {
          item["customerName"] = obj.hasOwnProperty(item["customerId"].toString()) && obj[item["customerId"].toString()][0];
          item["tinNumber"] = obj.hasOwnProperty(item["customerId"].toString()) && obj[item["customerId"].toString()][1];
          let prod = await getProducts(item.transId, res.accessToken).then(
            function (res) {
              return res.data.body;
            }
          );
          item["products"] = prod;
          if (item["products"].length !== 0) {
            filtered_data.push(item);
          }
        }
        setIsLoading(false);
        setHist(filtered_data);
        getDownloadData(filtered_data, prodData);
        getDiscountDownloadData(filtered_data);
        setSalesData(filtered_data);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getProducts = async (trans_id, token) => {
    let data = "";
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/productsaleentry/${trans_id}`;
      axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
      return await axios.get(url);
    } catch (err) {
      console.log(err);
    }
    return data;
  };

  const getProductsDetails = async (resp, obj) => {
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/products`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${resp.accessToken}`,
      };
      await axios.get(url).then((res) => {
        let data = res.data.body;
        setProductData(data);
        getSalesDetails(resp, obj, data);
      });
    } catch (err) {
      //console.log(err)
    }
  };

  const getCustomers = async (user) => {
    setUserData(user);
    const userId = props.id;
    const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${userId}/customers`;
    axios.defaults.headers.common = {
      Authorization: `Bearer ${user?.accessToken}`,
    };
    try {
      await axios.get(url).then((res) => {
        let obj = {};
        res.data.map((item) => {
          let id = parseInt(item.id);
          obj[id] = [item.customerName, item.tinNumber];
        });
        setCustomerData(obj);
        getProductsDetails(user, obj);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getSignedUrl = (link) => {
    let key_arr = link.split("/");
    let key = key_arr[key_arr.length - 2] + "/" + key_arr[key_arr.length - 1];
    console.log(link);
    var params = { Bucket: "jbtlfiles", Key: key };
    s3.getSignedUrlPromise("getObject", params).then(
      function (url) {
        console.log(url);
        setModalUrl(url.toString());
        setOpen(true);
      },
      function (err) {
        //console.log(err)
      }
    );
  };

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

  const deleteTrans = async (row) => {
    const userId = props.id;
    const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${userId}/saleentry/${row.customerId}/${row.transId}`;
    axios.defaults.headers.common = {
      Authorization: `Bearer ${userData?.accessToken}`,
    };
    try {
      await axios.delete(url).then((res) => {
        console.log(res);
        notification.success({
          message: "Success",
          description: "Transaction Deleted Successfully.",
          style: { width: 600 },
        });
        getUserData();
      });
    } catch (err) {
      notification.error({
        message: "Error",
        description: "Error occured while deleting the Transaction.",
        style: { width: 600 },
      });
      console.log(err);
    }
  };
  const columns = [
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (row) => moment(row).format("DD-MM-YYYY"),
    },
    {
      title: "Collection Date",
      dataIndex: "dateCollection",
      key: "dateCollection",
      render: (row) => moment(row).format("DD-MM-YYYY"),
    },
    {
      title: "Transaction ID",
      dataIndex: "transId",
      key: "transId",
      ...getColumnSearchProps("transId", "transId", searchInput),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName", "customerName", searchInput),
    },
    {
      title: "Sale Amount",
      dataIndex: "todaySaleCollectionAmount",
      key: "todaySaleCollectionAmount",
      ...getColumnSearchProps(
        "todaySaleCollectionAmount",
        "todaySaleCollectionAmount",
        searchInput
      ),
    },
    {
      title: "Sale Mode",
      dataIndex: "todaySaleCollectionAmountMode",
      key: "todaySaleCollectionAmountMode",
      ...getColumnSearchProps(
        "todaySaleCollectionAmountMode",
        "todaySaleCollectionAmountMode",
        searchInput
      ),
    },
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      ...getColumnSearchProps("invoiceNumber", "invoiceNumber", searchInput),
    },
    {
      title: "Receipt Number",
      dataIndex: "receiptNumber",
      key: "receiptNumber",
      ...getColumnSearchProps("receiptNumber", "receiptNumber", searchInput),
    },
    {
      title: "Receipt",
      render: (row) =>
        row.efdPic && <EyeFilled onClick={() => getSignedUrl(row.efdPic)} />,
    },
    {
      title: "Delete",
      render: (row) => (
        <Popconfirm
          title="Are you sure to delete this transaction?"
          onConfirm={() => deleteTrans(row)}
          okText="Yes"
          cancelText="No"
        >
          <DeleteOutlined />
        </Popconfirm>
      ),
    },
  ];

  const getSalesPersonDetails = async (resp) => {
    try {
      const token = resp.accessToken;
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/allusers`;
      axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
      await axios.get(url).then((res) => {
        let data = {}
        res.data.forEach((item) => {
          data[item.id] = item.displayName
          setUsers(data)
        });
      });
    } catch (err) {
      //console.log(err)
    }
  };

  const getDownloadData = (data) => {
    let temp = [];
    try {
      data.forEach((i) => {
        let p = {

          userId: i.userId,
          userName: users[i.userId],
          customerId: i.customerId,
          customerName: i.customerName,
          TinNumber: i.tinNumber,
        };
        let n = ['CUCA VODKA (30X200ML)-PET', 'CUCA VODKA (24X200ML) - GLASS', 'CUCA VODKA (6 X 750ML)-Glass', 'RELAX VODKA (24X200ML)-PET', 'X5 GIN (24X200ML)-PET', 'X5 - GIN - (24 X 200ML) - GLASS', 'OLA -Kahawa Liqueur(15 X 200ML) -PET']
        let q = {}
        let prod = []
        i.products.forEach((j) => {
          n.map((k, index) => {
            let q1 = {}
            if (j.product === k) {
              q1[k] = j.quantity
              q1['sellingPrice' + index] = j.sellingPrice
              prod.push(j.product)
            } else if (!prod.includes(k)) {
              q1[k] = 0
              q1['sellingPrice' + index] = 0
            }
            q = { ...q, ...q1 }
          });
        });
        let u = {
          totalSaleAmount: i.totalSaleAmount,
          todaySaleCollectionAmount: i.todaySaleCollectionAmount,
          todaySaleCollectionAmountMode: i.todaySaleCollectionAmountMode,
          efdNumber: i.efdNumber,
          invoiceNumber: i.invoiceNumber.replace(',', ' '),
          receiptNumber: i.receiptNumber.replace(',', ' '),
          image: '"' + i.efdPic + '"',
          saleType: i.saleType,
          collectedDate: i.dateCollection,
          createdDate: i.createdDate,
        }
        temp.push({ ...p, ...q, ...u });
      });
      setDownloadData(temp);
    } catch (err) {
      console.log(err);
    }
  };

  const getDiscountDownloadData = (data) => {
    let temp = [];
    try {
      data.forEach((i) => {
        let p = {

          userId: i.userId,
          userName: users[i.userId],
          customerId: i.customerId,
          customerName: i.customerName,
          TinNumber: i.tinNumber,
        };
        let n = ['CUCA VODKA (30X200ML)-PET', 'CUCA VODKA (24X200ML) - GLASS', 'CUCA VODKA (6 X 750ML)-Glass', 'RELAX VODKA (24X200ML)-PET', 'X5 GIN (24X200ML)-PET', 'X5 - GIN - (24 X 200ML) - GLASS', 'OLA -Kahawa Liqueur(15 X 200ML) -PET']
        let q = {}
        let prod = []
        console.log(i.products)
        i.products.forEach((j) => {
          n.map((k, index) => {
            let q1 = {}
            if (j.product === k) {
              q1[k] = j.quantity
              q1['sellingPrice' + index] = j.sellingPrice
              q1['discountedPrice' + index] = j.discountPrice
              prod.push(j.product)
            } else if (!prod.includes(k)) {
              q1[k] = 0
              q1['sellingPrice' + index] = 0
              q1['discountedPrice' + index] = 0
            }
            q = { ...q, ...q1 }
          });
        });
        let u = {
          totalSaleAmount: i.totalSaleAmount,
          todaySaleCollectionAmount: i.todaySaleCollectionAmount,
          todaySaleCollectionAmountMode: i.todaySaleCollectionAmountMode,
          efdNumber: i.efdNumber,
          invoiceNumber: i.invoiceNumber.replace(',', ' '),
          receiptNumber: i.receiptNumber.replace(',', ' '),
          image: '"' + i.efdPic + '"',
          saleType: i.saleType,
          collectedDate: i.dateCollection,
          createdDate: i.createdDate,
        }
        temp.push({ ...p, ...q, ...u });
      });
      setDicountDownloadData(temp);
    } catch (err) {
      console.log(err);
    }
  };

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
    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
    },
    {
      title: "Total Sale Value",
      dataIndex: "totalAmount",
      key: "totalAmount",
    },
  ];
  const handleOk = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const searchProduct = (e) => {
    let temp = hist.filter(
      (item) =>
        item.products.filter((i) =>
          i.product.toUpperCase().includes(e.target.value.toUpperCase())
        ).length > 0
    );
    setSalesData(temp);
    getDownloadData(temp, productData);
    getDiscountDownloadData(temp);
  };
  return (
    <div
      style={{
        width: "100%",
        padding: 25,
        backgroundColor: "white",
        border: "2px solid #870000",
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <RangePicker
          style={{
            marginRight: 15,
            border: "1px solid #870000",
            borderRadius: 16,
          }}
          defaultValue={[moment().add(-1, "days"), moment()]}
          onChange={(e) => {
            setstartDate(e[0].format("YYYY-MM-DD"));
            setendDate(e[1].format("YYYY-MM-DD"));
          }}
        />

        <CustButton text="Submit" func={getUserData} />
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
          o
        />
        <CsvDownloader
          style={{ marginLeft: "auto" }}
          datas={discountDownloadData}
          filename={"discounted.csv"}
        >
          <CustButton text="Discounted Report" />
        </CsvDownloader>
        <CsvDownloader
          style={{ marginLeft: "auto" }}
          datas={downloadData}
          filename={"sales.csv"}
        >
          <CustButton text="Download Report" />
        </CsvDownloader>
      </div>
      <br />
      <Modal
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            onFocus={() => { }}
            onBlur={() => { }}
          >
            View Receipt
          </div>
        }
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <a key="download" href={modalUrl}>
            Download
          </a>,
          <Button
            key="back"
            type="primary"
            style={{ marginLeft: 20 }}
            onClick={handleCancel}
          >
            Ok
          </Button>,
        ]}
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
        <img src={modalUrl} style={{ width: 450 }} />
      </Modal>

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={salesData}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <Table
              rowKey="id"
              size="small"
              scroll={{ x: 0, y: 350 }}
              columns={status_columns}
              dataSource={record.products}
              pagination={false}
            />
          ),
        }}
      />
    </div>
  );
};

export default SalesHistory;
