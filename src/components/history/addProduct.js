import React, { useState, useEffect, useRef } from "react";
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import CsvDownloader from "react-csv-downloader";
import moment from "moment";
import axios from "axios";
import { Typography, Table, Modal, Tag, DatePicker, Button } from "antd";
import { CustButton } from "../button";
// import Auth from "../utils/Auth";
import { useHistory } from "react-router-dom";
import AppLayout from "../../AppLayout";
import { EyeFilled } from "@ant-design/icons";
import Draggable from "react-draggable";
import { getColumnSearchProps } from "../TableProps";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AddProductHistory = (props) => {
  const [expenseData, setExpenseData] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const searchInput = useRef(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  let history = useHistory();
  const draggleRef = useRef(null);
  const [modalUrl, setModalUrl] = useState(null);

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

  const getExpenseDetails = async (res) => {
    // const userId = route.params.id ? route.params.id:res?.user.id;
    const userId = props.id;
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/product/${startDate}/${moment(
        endDate
      )
        .add(1, "days")
        .format("YYYY-MM-DD")}`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${res?.accessToken}`,
      };
      await axios.get(url).then((res) => {
        let data = res.data.body;
        console.log(data);
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

  const columns = [
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (row) => moment(row).format("DD-MM-YYYY"),
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      ...getColumnSearchProps("productName", "productName", searchInput),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ...getColumnSearchProps("remarks", "remarks", searchInput),
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

export default AddProductHistory;
