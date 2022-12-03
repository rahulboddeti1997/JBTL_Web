import React from 'react'
import { Layout,Typography } from 'antd';
import AppHeader from './AppHeader'

const { Content } = Layout;
const { Title } = Typography;


const AppLayout = (props) => {
    return (
        <>
        <Layout>
            <Layout className="site-layout">
                <AppHeader {...props} app_title={props.app_title}/>
                {
                    (props.page_header && props.page_header !== '')?
                        <Title level={4} style={{ margin: '16px 16px 0' }}>{props.page_header}</Title>
                    :
                    null
                }
                <Content className={props.classname || ''} style={{ padding: '40px 50px 16px 50px', minHeight: '100vh', backgroundColor:'currentcolor'}}>
                    {props.children}
                </Content>
            </Layout>
        </Layout>

        </>

    );
}

export default AppLayout;
