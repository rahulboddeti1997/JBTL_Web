import React, { useCallback, useState } from 'react'
// import { Form, Input, Button, Row, Col, Card, Alert} from 'antd';
import {useHistory, useParams} from "react-router-dom";
import { Typography, Tabs } from 'antd';
// import Auth from "../utils/Auth"
import SalesHistory from './SalesHistory';
import ExpenseHistory from './ExpenseHistory';
import CollectionHistory from './CollectionHistory';
import AppLayout from '../../AppLayout';
import {QueryClient, QueryClientProvider} from "react-query";
const { Title, Text } = Typography;
const queryClient = new QueryClient();
const { TabPane } = Tabs;
const History = (props) => {
  const history = useHistory();
    const params = useParams();
    const [userId,setuserId] = useState(params['id']);
    const currentTab = params['tab'] === undefined ? 'sales' : params['tab'];
    const [activeTabKey, setActiveTabKey] = useState(currentTab);
      const callback = useCallback((key) => {
        setActiveTabKey(key);
        history.push(`/history/${key}/${userId}`);
    },[history]);

    return (
        <AppLayout {...props}>
            <QueryClientProvider client={queryClient}>
         <Tabs onChange={callback} type="card" activeKey={activeTabKey}>
            <TabPane tab="Sales" key="sales" style={{borderRadius: 10}}>
                <SalesHistory id={userId}/>
            </TabPane>
            <TabPane tab="Expense" key="expense">
                <ExpenseHistory id={userId}/>
            </TabPane>
            <TabPane tab="Collection" key="collection">
                <CollectionHistory  id={userId} />
            </TabPane>
        </Tabs>
            </QueryClientProvider>
        </AppLayout>
    )
}

export default History;