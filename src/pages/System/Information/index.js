import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Switch, Tag, Button, Popconfirm, Divider, message } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PlusOutlined, DeleteOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import Authorized from '@/utils/Authorized';
import NoMatch from '@/components/Authorized/NoMatch';
import withModal from '@/components/HOCModal';
import { getValue } from '@/utils/utils';
import InformationForm from './components/InformationForm';
import styles from '../System.less';

const InformationModal = withModal(InformationForm);

const getText = (value) => {
  switch (value) {
    case 1:
      return <Tag color="#2db7f5">通知</Tag>;
    case 2:
      return <Tag color="#87d068">消息</Tag>;
    case 3:
      return <Tag color="#108ee9">事件</Tag>;
    default:
      return '--';
  }
};

const Information = connect(({ systemInformation: { list, pagination }, loading }) => ({
  list,
  pagination,
  loading: loading.effects['systemInformation/fetch'],
}))(({ loading, list, pagination, dispatch }) => {
  // 【复选框状态属性与函数】
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 列表参数
  const [params, setParams] = useState({
    current: pagination.current || 1,
    pageSize: pagination.pageSize || 10,
  });

  // 【初始化后，加载列表数据】
  useEffect(() => {
    dispatch({
      type: 'systemInformation/fetch',
      payload: {
        ...params,
      },
    });
    return () => {
      dispatch({
        type: 'systemInformation/clearList',
      });
    };
  }, [params, dispatch]);

  // 【开启禁用 信息状态】
  const toggleState = (checked, record) => {
    const { id } = record;
    dispatch({
      type: 'systemInformation/enable',
      payload: {
        id,
        status: checked,
        searchParams: params,
      },
    });
  };

  // 【搜索】
  const handleFormSubmit = () => {
    message.info('暂未开放。');
  };

  // 【批量删除信息】
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;
    dispatch({
      type: 'systemInformation/deleteBatch',
      payload: {
        ids: selectedRowKeys,
        searchParams: params,
      },
      callback: () => {
        setSelectedRowKeys([]);
        message.success('批量删除信息成功。');
      },
    });
  };

  // 【删除信息】
  const handleDelete = (record) => {
    const { id } = record;
    dispatch({
      type: 'systemInformation/delete',
      payload: {
        id,
        searchParams: params,
      },
      callback: () => {
        setSelectedRowKeys([]);
        message.success('删除信息成功。');
      },
    });
  };

  // 【复选框相关操作】
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  // 【分页、过滤】
  const handleTableChange = (page, filtersArg) => {
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const { current, pageSize } = page;

    setParams({
      ...params,
      current,
      pageSize,
      ...filters,
    });
  };

  // 【全页搜索框】
  const mainSearch = (
    <div style={{ textAlign: 'center' }}>
      <Input.Search
        placeholder="请输入信息标题"
        enterButton
        size="large"
        onSearch={handleFormSubmit}
        style={{ maxWidth: 522, width: '100%' }}
      />
    </div>
  );

  // 【表格列】
  const columns = [
    {
      title: '发信人',
      dataIndex: 'sendName',
    },
    {
      title: '收信人',
      dataIndex: 'receiveName',
    },
    {
      title: '信息标题',
      dataIndex: 'title',
    },
    {
      title: '信息类型',
      dataIndex: 'type',
      filters: [
        { text: '通知', value: 1 },
        { text: '消息', value: 2 },
        { text: '事件', value: 3 },
      ],
      filterMultiple: false,
      render: (text) => getText(text),
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        { text: '禁用', value: 0 },
        { text: '启用', value: 1 },
      ],
      filterMultiple: false,
      render: (text, record) => (
        <Authorized authority="system:information:status" noMatch={NoMatch(text)}>
          <Switch checked={text} onClick={(checked) => toggleState(checked, record)} />
        </Authorized>
      ),
    },
    {
      title: '是否发布',
      dataIndex: 'publish',
      ellipsis: true,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (text, record) => (
        <>
          <Authorized authority="system:information:update" noMatch={null}>
            <InformationModal isEdit id={record.id} searchParams={params}>
              <EditOutlined title="编辑" className="icon" />
            </InformationModal>
            <Divider type="vertical" />
          </Authorized>
          <Authorized authority="system:information:delete" noMatch={null}>
            <Popconfirm
              title="您确定要删除该信息吗？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <DeleteOutlined title="删除" className="icon" />
            </Popconfirm>
            <Divider type="vertical" />
          </Authorized>
          <Authorized authority="system:information:publish" noMatch={null}>
            <CalendarOutlined title="发布" className="icon" onClick={() => handleDelete(record)} />
          </Authorized>
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper title={false} content={mainSearch}>
      <Card style={{ marginTop: 10 }} bordered={false} bodyStyle={{ padding: '15px' }}>
        <div className={styles.tableList}>
          <div className={styles.tableListOperator}>
            <Authorized authority="system:information:add" noMatch={null}>
              <InformationModal>
                <Button type="primary" title="新增">
                  <PlusOutlined />
                </Button>
              </InformationModal>
            </Authorized>
            <Authorized authority="system:information:batchDelete" noMatch={null}>
              <Popconfirm
                title="您确定要删除这些信息吗？"
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
                disabled={selectedRowKeys.length <= 0}
              >
                <Button type="danger" disabled={selectedRowKeys.length <= 0} title="删除">
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </Authorized>
          </div>
          <Table
            rowKey="id"
            bordered
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={handleTableChange}
          />
        </div>
      </Card>
    </PageHeaderWrapper>
  );
});

export default Information;
