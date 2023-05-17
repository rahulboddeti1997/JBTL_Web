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
  message,
  Popconfirm,
} from "antd";
import AppLayout from "../../AppLayout";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import { useHistory } from "react-router-dom";
import "../style.css";
import { CustButton } from "../button";
import { EyeFilled, DeleteOutlined } from "@ant-design/icons";
import Draggable from "react-draggable";
import { getColumnSearchProps } from "../TableProps";

const { Title, Text } = Typography;

const { RangePicker } = DatePicker;
var AWS = require("aws-sdk");
var s3 = new AWS.S3({
  accessKeyId: "AKIAUR75N36ZLXZH6ERW",
  secretAccessKey: "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",
  region: "us-east-1",
});
const CollectionHistory = (props) => {
  const [salesData, setSalesData] = useState(null);
  const [downloadableData, setDownloadData] = useState(null)
  const [customerData, setCustomerData] = useState(null);
  const [startDate, setstartDate] = useState(
    moment().add(-1, "days").format("YYYY-MM-DD")
  );
  const [endDate, setendDate] = useState(moment().format("YYYY-MM-DD"));
  const [open, setOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  let history = useHistory();
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const searchInput = useRef(null);
  const [users, setUsers] = useState(null)
  const [userData, setUserData] = useState(null);

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
    console.log(bounds);
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

  const getSalesDetails = async (res, obj) => {
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
          item["customerName"] = obj[item["customerId"].toString()];
          if (item["saleType"] === "collection") {
            filtered_data.push(item);
          }
        }
        setIsLoading(false);
        setSalesData(filtered_data);
        formatDownloadData(filtered_data)
      });
    } catch (err) {
      console.log(err);
    }
  };

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

  const formatDownloadData = (data) => {
    const temp = data.map((item) => {
      return {
        'userId': item.userId,
        'userName': users[item.userId],
        'customerId': item.customerId,
        'customerName': item.customerName,
        'creditCollectionAmount': item.creditCollectionAmount,
        'creditCollectionMode': item.creditCollectionMode,
        'creditBalance': item.creditBalance,
        'receiptNumber': item.receiptNumber,
        'image': item.efdPic,
        'createdDate': item.createdDate,
        'dateCollection': item.dateCollection
      }
    })
    setDownloadData(temp)
  }

  const handleOk = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const getCustomers = async (user) => {
    setUserData(user);
    // const userId = route.params?.id ? route.params.id:user?.user.id;
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
          obj[id] = item.customerName;
        });
        setCustomerData(obj);
        getSalesDetails(user, obj);
      });
    } catch (err) {
      console.log(err);
    }
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
      title: "Transaction ID",
      dataIndex: "transId",
      key: "transId",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName", "customerName", searchInput),
    },
    {
      title: "Collection Amount",
      dataIndex: "creditCollectionAmount",
      key: "creditCollectionAmount",
      ...getColumnSearchProps(
        "creditCollectionAmount",
        "creditCollectionAmount",
        searchInput
      ),
    },
    {
      title: "Collection Mode",
      dataIndex: "creditCollectionMode",
      key: "creditCollectionMode",
      ...getColumnSearchProps(
        "creditCollectionMode",
        "creditCollectionMode",
        searchInput
      ),
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
        <CsvDownloader
          style={{ marginLeft: "auto" }}
          datas={downloadableData}
          filename={"collection.csv"}
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
        <img alt="Image Not found" src={modalUrl} style={{ width: 450 }} />
      </Modal>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={salesData}
        rowKey="id"
      />
    </div>
  );
};

export default CollectionHistory;
