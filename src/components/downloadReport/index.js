import React, { useState, useEffect } from 'react'
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import { useHistory, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Layout, Button, Typography, Menu, Drawer, DatePicker, Space } from 'antd';
import axios from 'axios';
import CsvDownloader from "react-csv-downloader";
import { DownloadOutlined, LogoutOutlined } from '@ant-design/icons'
import moment from "moment";

const { Header } = Layout;
const { Text } = Typography;

const DownloadReport = (props) => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadData, setDownloadData] = useState([]);
    const [customerData, setCustomerData] = useState(null);
    const [expenseData, setExpenseData] = useState([])
    const [collectionData, setCollectionData] = useState([])
    const [collectionDataStatus, setCollectionDataStatus] = useState(false)
    const [expenseDataStatus, setExpenseDataStatus] = useState(false)

    const [saleData, setSaleData] = useState(false)
    const [startDate, setstartDate] = useState(
        moment().add(-1, "days").format("YYYY-MM-DD")
    );
    const [productData, setProductData] = useState([]);

    const [endDate, setendDate] = useState(moment().format("YYYY-MM-DD"));

    let history = useHistory();

    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = () => {
        setIsLoading(true);
        const data = localStorage.getItem("user");
        if (data) {
            setUserData(JSON.parse(data));
        } else {
            history.push("/login");
        }
    };
    const getCustomers = async (user) => {
        setUserData(user);
        setSaleData(false)
        const userId = props.id;
        console.log(userId, user.user.id)
        const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${user.user.id}/customers`;
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
                getProductsDetails(user, obj, 'sale');
            });
        } catch (err) {
            console.log(err);
        }
    };

    const getCustomersData = async (user) => {
        setUserData(user);
        setCollectionDataStatus(false)
        const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${user.user.id}/customers`;
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
                getProductsDetails(user, obj, 'collection');
            });
        } catch (err) {
            console.log(err);
        }
    };

    const onSalesDownload = () => {
        getCustomers(userData)
    }

    const onGeneralDownload = () => {
        getCustomersData(userData)
    }

    const getProductsDetails = async (resp, obj, type) => {
        try {
            const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/products`;
            axios.defaults.headers.common = {
                Authorization: `Bearer ${resp.accessToken}`,
            };
            await axios.get(url).then((res) => {
                let data = res.data.body;
                setProductData(data);
                if (type === 'sale') {
                    getSalesDetails(resp, obj, data);
                } else {
                    getExpenseDetails(resp);
                    getCollectionDetails(resp, obj)
                }
            });
        } catch (err) {
            //console.log(err)
        }
    };

    const getSalesDetails = async (res, obj, prodData) => {
        // setIsLoaded(false)
        const userId = props.id;
        try {
            const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${res.user?.id}/saleentry/${startDate}/${moment(
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
                getDownloadData(filtered_data, prodData);
            });
        } catch (err) {
            console.log(err);
        }
    };
    const getDownloadData = (data) => {
        let temp = [];
        try {
            data.forEach((i) => {
                i.products.forEach((j) => {
                    let p = {
                        createdDate: i.createdDate,
                        dateCollection: i.dateCollection,
                        id: i.id,
                        customerName: i.customerName,
                        product: j.product,
                        quantity: j.quantity,
                        hoPrice: j.hoPrice,
                        stockValue: j.stockValue,
                        discountPrice: j.discountPrice,
                        sellingPrice: j.sellingPrice,
                        totalSaleAmount: i.totalSaleAmount,
                        creditBalance: i.creditBalance,
                        todaySaleCollectionAmountMode: i.todaySaleCollectionAmountMode,
                        todaySaleCollectionAmount: i.todaySaleCollectionAmount,
                        efdNumber: i.efdNumber,
                        invoiceNumber: i.invoiceNumber,
                        receiptNumber: i.receiptNumber,
                        saleType: i.saleType,
                    };
                    temp.push(p);
                });
            });
            setDownloadData(temp);
            setSaleData(true);
        } catch (err) {
            console.log(err);
        }
    };

    const getExpenseDetails = async (res, temp) => {
        try {
            const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${res.user.id}/getexpenseentry/${startDate}/${moment(
                endDate
            )
                .add(1, "days")
                .format("YYYY-MM-DD")}`;
            axios.defaults.headers.common = {
                Authorization: `Bearer ${res?.accessToken}`,
            };
            await axios.get(url).then((res) => {
                let data = res.data.body;
                setExpenseData(data);
                setExpenseDataStatus(true)
            });
        } catch (err) {
            //console.log(err)
        }
    };

    const getCollectionDetails = async (res, obj) => {
        try {
            const url = `http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/${res.user.id}/saleentry/${startDate}/${moment(
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
                formatDownloadData(filtered_data, obj, res)
                setCollectionDataStatus(true)
            });
        } catch (err) {
            console.log(err);
        }
    };

    const formatDownloadData = (data, obj, res) => {
        const temp = data.map((item) => {
            return {
                'userId': item.userId,
                'userName': obj[item.userId],
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
        setCollectionData(temp)
    }

    const handelDateChange = (e) => {
        setstartDate(moment(e).format("YYYY-MM-DD"))
        setendDate(moment(e).format("YYYY-MM-DD"))
    }
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

    const handleClick = () => {
        localStorage.clear()
        history.push('/login')
    }

    return (
        <>
            <Header className="site-layout-background" style={{
                padding: 0,
                height: '48px',
                lineHeight: '40px',
                backgroundColor: '#00292fe8',
            }}
            >
                <Menu
                    mode="horizontal"
                    theme='dark'
                    onClick={handleClick}
                    className='mobile'
                >
                    <div style={{ float: 'left' }}>
                        <Text style={{
                            fontSize: '1.7rem',
                            fontWeight: 800,
                            fontFamily: "'Comfortaa'",
                            letterSpacing: '4px',
                            color: '#fff',
                            marginLeft: 30,
                            marginRight: 30
                        }} > JBTL</Text>

                    </div>
                    <Menu.Item key="logout" className='logout' style={{ marginLeft: 'auto' }}>
                        <Text strong style={{ marginRight: 15 }}> </Text><Button type="link" icon={<LogoutOutlined />}>Logout</Button>
                    </Menu.Item>
                </Menu>


            </Header>

            <Space style={{ margin: 50, marginTop: 80, flexDirection: 'column' }}>
                <DatePicker style={{ width: 200 }} onChange={handelDateChange} />
                <br />
                <Space direction='vertical'>
                    {saleData ? <CsvDownloader
                        style={{ marginLeft: "auto" }}
                        datas={downloadData}
                        filename={"sales.csv"}
                    ><Button type='primary'> <DownloadOutlined /> Download Sales Report Now</Button></CsvDownloader> : <Button type='primary' onClick={onSalesDownload}>Get Sales report</Button>}
                    <br />
                    {expenseDataStatus ? <CsvDownloader
                        style={{ marginLeft: "auto" }}
                        datas={expenseData}
                        filename={"expense.csv"}
                    ><Button type='primary'> <DownloadOutlined /> Download Expense Report Now</Button></CsvDownloader> : <Button type='primary' onClick={onGeneralDownload}>Get Expense report</Button>}
                    <br />

                    {collectionDataStatus ? <CsvDownloader
                        style={{ marginLeft: "auto" }}
                        datas={collectionData}
                        filename={"collection.csv"}
                    ><Button type='primary'> <DownloadOutlined /> Download Collection Report Now</Button></CsvDownloader> : <Button type='primary' onClick={onGeneralDownload}>Get Collection report</Button>}


                </Space>
            </Space>
        </>
    )
}

export default DownloadReport;