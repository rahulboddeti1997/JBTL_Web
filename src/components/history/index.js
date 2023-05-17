import React, { useCallback, useState } from 'react'
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import {useHistory, useParams} from "react-router-dom";
import { Typography, Tabs } from 'antd';
// import Auth from "../utils/Auth"
import AppLayout from '../../AppLayout';
import SpToHoHistory from './spToHoHistory';
import AddProductHistory from './addProduct';
import {QueryClient, QueryClientProvider} from "react-query";
const { Title, Text } = Typography;
const queryClient = new QueryClient();
const { TabPane } = Tabs;
const History = (props) => {
  const history = useHistory();
    const params = useParams();
    const [userId,setuserId] = useState(params['id']);
    const currentTab = params['tab'] === undefined ? 'sptoho' : params['tab'];
    const [activeTabKey, setActiveTabKey] = useState(currentTab);
      const callback = useCallback((key) => {
        setActiveTabKey(key);
        history.push(`/adminhistory/${key}`);
    },[history]);

    return (
        <AppLayout {...props}>
            <QueryClientProvider client={queryClient}>
         <Tabs onChange={callback} type="card" activeKey={activeTabKey}>
             <TabPane tab="Sp To Ho" key="sptoho" style={{borderRadius: 10}}>
                <SpToHoHistory/>
            </TabPane>
            <TabPane tab="Add Product" key="addproduct">
                <AddProductHistory />
            </TabPane>
        </Tabs>
            </QueryClientProvider>
        </AppLayout>
    )
}

export default History;