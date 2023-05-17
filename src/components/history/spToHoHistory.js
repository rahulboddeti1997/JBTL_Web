import React, { useState, useEffect, useRef } from "react";
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import CsvDownloader from "react-csv-downloader";
import moment from "moment";
import axios from "axios";
import { Typography, Table, Modal, Tag, DatePicker, Button, Input } from "antd";
import { CustButton } from "../button";
// import Auth from "../utils/Auth";
import { useHistory } from "react-router-dom";
import AppLayout from "../../AppLayout";
import { EyeFilled } from "@ant-design/icons";
import Draggable from "react-draggable";
import { getColumnSearchProps } from "../TableProps";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const SpToHoHistory = (props) => {
  const [expenseData, setExpenseData] = useState([]);
  const [hist, setHist] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadData, setDownloadData] = useState([]);
  const [productData, setProductData] = useState([]);
  const searchInput = useRef(null);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  let history = useHistory();
  const [users, setUsers] = useState([]);
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
      getUsersDetails(JSON.parse(data));
    } else {
      history.push("/login");
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
        setProductData(data);
        getExpenseDetails(resp, obj, data);
      });
    } catch (err) {
      //console.log(err)
    }
  };

  const getExpenseDetails = async (res, obj, prodData) => {
    const userId = props.id;
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/stockadjusts/${startDate}/${moment(
        endDate
      )
        .add(1, "days")
        .format("YYYY-MM-DD")}`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${res?.accessToken}`,
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
          // delete item.products
          return item;
        });
        setIsLoading(false);
        getDownloadData(temp, prodData);
        setHist(temp);
        setExpenseData(temp);
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
                let stockVal = parseInt(item.hoPrice) * parseInt(j.quantity);
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
      console.log(temp);
      setDownloadData(temp);
    } catch (err) {
      console.log(err);
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

  const getUsersDetails = async (resp) => {
    try {
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/allusers`;
      axios.defaults.headers.common = {
        Authorization: `Bearer ${resp.accessToken}`,
      };
      await axios.get(url).then((res) => {
        const filtered = res.data.splice(1);
        // console.log(filtered)
        let obj = {};
        filtered.map((item) => {
          let id = parseInt(item.id);
          obj[id] = item.displayName;
        });
        setUsers(obj);
        getProductsDetails(resp, obj);
      });
    } catch (err) {
      //console.log(err)
    }
  };
  const columns = [
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (row) => {
        return moment(row).format("DD-MM-YYYY");
      },
    },
    {
      title: "Sales Person",
      dataIndex: "salesperson",
      key: "salesperson",
      ...getColumnSearchProps("salesperson", "salesperson", searchInput),
    },
    {
      title: "Vehical Number",
      dataIndex: "deliveryVehicalNumber",
      key: "deliveryVehicalNumber",
      ...getColumnSearchProps(
        "deliveryVehicalNumber",
        "deliveryVehicalNumber",
        searchInput
      ),
    },
    {
      title: "Place",
      dataIndex: "destinationPlace",
      key: "destinationPlace",
      ...getColumnSearchProps(
        "destinationPlace",
        "destinationPlace",
        searchInput
      ),
    },
    {
      title: "Stock Value",
      dataIndex: "stockValue",
      key: "stockValue",
      ...getColumnSearchProps("stockValue", "stockValue", searchInput),
    },
    {
      title: "Sales Type",
      dataIndex: "salesType",
      key: "salesType",
      ...getColumnSearchProps("salesType", "salesType", searchInput),
    },
  ];

  const handleOk = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const searchProduct = (e) => {
    let temp = hist.filter((item) =>
      item.products.includes(e.target.value.toUpperCase())
    );
    setExpenseData(temp);
    getDownloadData(temp, productData);
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
        <CustButton text="Submit" func={getuserData} />

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
          datas={downloadData}
          filename={"spToHo.csv"}
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
    </div>
  );
};

export default SpToHoHistory;
