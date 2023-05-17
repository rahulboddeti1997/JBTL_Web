import React, { useEffect, useState } from 'react'
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { Typography, Select, DatePicker, Card } from 'antd';
// import Auth from "../utils/Auth";
import AppLayout from '../../AppLayout';
import Chart from "react-apexcharts";
import axios from 'axios';
import moment from "moment";
import { RightCircleFilled } from "@ant-design/icons";
import './styles.css'
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = (props) => {
  const [categ, setCateg] = useState([]);
  const [count, setCount] = useState([]);
  const [categ1, setCateg1] = useState([]);
  const [count1, setCount1] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState();
  const [userData, setUserData] = useState([])
  const [dateRange, setDateRange] = useState([moment().add(-1, "days").format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")])
  const [dateRange1, setDateRange1] = useState([moment().add(-1, "days").format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")])

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUserData(JSON.parse(data))
      getUsersDetails(JSON.parse(data))
      getSalesPersonDetails(JSON.parse(data));

    }
  }, []);

  const getUsersDetails = async (resp) => {
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
        setUser(filtered[0].id)
        getDetailsBySP(resp)
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getSalesPersonDetails = async (resp) => {
    try {
      const token = resp.accessToken;
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/report/getallproductsales/${dateRange[0]}/${dateRange[1]}`;
      axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
      await axios.get(url).then((res) => {
        let displayNames = [];
        let count = [];
        console.log(res.data)
        res.data.body.forEach((item) => {
          displayNames.push(item[0])
          count.push(item[1])
        });
        setCateg(displayNames)
        setCount(count)
      });
    } catch (err) {
      //console.log(err)
    }
  };

  const getDetailsBySP = async (resp) => {
    try {
      const token = resp.accessToken;
      const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/report/${user}/getspproductsales/${dateRange1[0]}/${dateRange1[1]}`;
      axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
      await axios.get(url).then((res) => {
        let displayNames = [];
        let count = [];
        res.data.body.forEach((item) => {

          displayNames.push(item[0])
          count.push(item[1])
        });
        setCateg1(displayNames)
        setCount1(count)
      });
    } catch (err) {
      //console.log(err)
    }
  };
  const options = {
    chart: {
      id: "basic-bar"
    },
    xaxis: {
      categories: categ
    }
  }
  const series = [
    {
      name: "quantity",
      data: count
    }
  ]

  const options1 = {
    chart: {
      id: "basic-bar"
    },
    xaxis: {
      categories: categ1
    }
  }
  const series1 = [
    {
      name: "quantity",
      data: count1
    }
  ]
  return (
    <AppLayout {...props}>
      <div style={{ justifyContent: "center" }}>
        <h2 style={{ color: 'white' }}>Dashboard</h2>
      </div>
      <Card className='dash' style={{ backgroundColor: 'white', borderRadius: '20px' }}>
        <div>
          <h2>All Products Sales</h2>
          <div>
            <RangePicker
              style={{
                marginRight: 15,
                border: "1px solid #870000",
                borderRadius: 16,
                width: 300
              }}
              defaultValue={[moment().add(-1, "days"), moment()]}
              onChange={(e) => {
                setDateRange([e[0].format("YYYY-MM-DD"), e[1].format("YYYY-MM-DD")]);
              }}
            />
            <RightCircleFilled
              onClick={() => getSalesPersonDetails(userData)}
              style={{ fontSize: 20 }}
            />
          </div>


          <Chart
            options={options}
            series={series}
            type="bar"
            height="400"
          />
        </div>
        <div>
          <h2>Products sales by SP </h2>
          <div>
            <RangePicker
              style={{
                marginRight: 15,
                border: "1px solid #870000",
                borderRadius: 16,
                width: 300
              }}
              defaultValue={[moment().add(-1, "days"), moment()]}
              onChange={(e) => {
                setDateRange1([e[0].format("YYYY-MM-DD"), e[1].format("YYYY-MM-DD")]);
              }}
            />
            <Select placeholder={"Select sales person"} onChange={(e) => { setUser(e); }} value={user}>
              {users.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.displayName}
                </Option>
              ))}
            </Select>
            <RightCircleFilled
              onClick={() => getDetailsBySP(userData)}
              style={{ fontSize: 20, marginLeft: 20 }}
            />

          </div>


          <Chart
            options={options1}
            series={series1}
            type="bar"
            height="400"

          />

        </div>

      </Card>
    </AppLayout>
  )
}

export default Dashboard;