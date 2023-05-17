import React from "react";
import {Button, Input, Space} from "antd";
import {SearchOutlined} from "@ant-design/icons";

export const getColumnSearchProps = (dataIndex, indexName, searchInputRef) => ({
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
        <div style={{padding: 8}}>
            <Input
                ref={searchInputRef}
                placeholder={`Search ${indexName}`}
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => confirm()} // handleSearch(selectedKeys, confirm, dataIndex)
                style={{width: 188, marginBottom: 8, display: 'block'}}
            />
            <Space>
                <Button
                    type="primary"
                    onClick={() => confirm()} // handleSearch(selectedKeys, confirm, dataIndex)
                    icon={<SearchOutlined/>}
                    size="small"
                    style={{width: 90}}
                >
                    Search
                </Button>
                {/* <Button onClick={() => clearFilters()} size="small" style={{width: 90}}>
                    Reset
                </Button> */}
            </Space>
        </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
    onFilter: (value, record) =>
        record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    onFilterDropdownVisibleChange: visible => {
        if (visible) {
            setTimeout(() => searchInputRef.current.select(), 100);
        }
    },

});
