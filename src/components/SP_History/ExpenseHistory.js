import React, { useState, useEffect, useRef } from "react";
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import CsvDownloader from "react-csv-downloader";
import moment from "moment";
import axios from "axios";
import {
  Typography,
  Table,
  Modal,
  Tag,
  DatePicker,
  Button,
  notification,
  message,
  Popconfirm,
} from "antd";
import { CustButton } from "../button";
// import Auth from "../utils/Auth";
import { useHistory } from "react-router-dom";
import AppLayout from "../../AppLayout";
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

const ExpenseHistory = (props) => {
  const [expenseData, setExpenseData] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const searchInput = useRef(null);
  let history = useHistory();

  const [startDate, setstartDate] = useState(
    moment().add(-1, "days").format("YYYY-MM-DD")
  );
  const [endDate, setendDate] = useState(moment().format("YYYY-MM-DD"));
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    getuserData();
  }, []);

  const getuserData = () => {
    setIsLoading(true);
    const data = localStorage.getItem("user");
    if (data) {
      setUserData(JSON.parse(data));
      getExpenseDetails(JSON.parse(data));
    } else {
      history.push("/login");
    }
  };

  const getSignedUrl = (link) => {
    let key_arr = link.split("/");
    let key = key_arr[key_arr.length - 2] + "/" + key_arr[key_arr.length - 1];
    var params = { Bucket: "jbtlfiles", Key: key };
    s3.getSignedUrlPromise("getObject", params).then(
      function (url) {
        setModalUrl(url.toString());
        setOpen(true);
      },
      function (err) {
        //console.log(err)
      }
    );
  };

  const getExpenseDetails = async (res) => {
    // const userId = route.params.id ? route.params.id:res?.user.id;
    const userId = props.id;
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${userId}/getexpenseentry/${startDate}/${moment(
        endDate
      )
        .add(1, "days")
        .format("YYYY-MM-DD")}`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${res?.accessToken}`,
      };
      await axios.get(url).then((res) => {
        let data = res.data.body;
        setIsLoading(false);
        setExpenseData(data);
      });
    } catch (err) {
      //console.log(err)
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

  const deleteTrans = async (row) => {
    const userId = props.id;
    const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/userexpensrdelete/${row.id}`;
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
        getuserData();
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
      title: "Bill No",
      dataIndex: "billNo",
      key: "billNo",
      ...getColumnSearchProps("billNo", "billNo", searchInput),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      ...getColumnSearchProps("department", "department", searchInput),
    },
    {
      title: "Expense Type",
      dataIndex: "expenseType",
      key: "expenseType",
      ...getColumnSearchProps("expenseType", "expenseType", searchInput),
    },

    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      ...getColumnSearchProps("amount", "amount", searchInput),
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      ...getColumnSearchProps("paymentMode", "paymentMode", searchInput),
    },
    {
      title: "Voucher",
      dataIndex: "voucher",
      key: "voucher",
      ...getColumnSearchProps("voucher", "voucher", searchInput),
    },
    {
      title: "Receipt",
      render: (row) =>
        row.billpic && <EyeFilled onClick={() => getSignedUrl(row.billpic)} />,
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ...getColumnSearchProps("remarks", "remarks", searchInput),
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

  const handleOk = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
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
        <CustButton text="Submit" func={getuserData} />
        <CsvDownloader
          style={{ marginLeft: "auto" }}
          datas={expenseData}
          filename={"expense.csv"}
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
            onFocus={() => {}}
            onBlur={() => {}}
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
        dataSource={expenseData}
        rowKey="id"
      />
    </div>
  );
};

export default ExpenseHistory;
