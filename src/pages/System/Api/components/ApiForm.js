import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, TreeSelect, Radio, Button, message } from 'antd';
import { connect } from 'umi';
import { isEmpty } from '@/utils/utils';
import styles from '../../System.less';

const ApiForm = connect(({ systemApi: { tree, api }, loading }) => ({
  tree,
  api,
  loading:
    loading.effects['systemApi/fetchById'] ||
    loading.effects['systemApi/add'] ||
    loading.effects['systemApi/update'],
}))(({ loading, visible, isEdit, id, api, tree, closeModal, dispatch }) => {
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  // 【修改时，获取接口数据】
  useEffect(() => {
    if (visible && isEdit) {
      dispatch({
        type: 'systemApi/fetchById',
        payload: {
          id,
        },
      });
    }
    return () => {
      dispatch({
        type: 'systemApi/clear',
      });
    };
  }, [visible, isEdit, id, dispatch]);

  // 【修改时，回显接口表单】
  useEffect(() => {
    // 👍 将条件判断放置在 effect 中
    if (visible && isEdit) {
      if (!isEmpty(api)) {
        setFieldsValue({ ...api, parentId: api.parentId.toString() });
      }
    }
  }, [visible, isEdit, api, setFieldsValue]);

  // 【添加与修改接口】
  const handleAddOrUpdate = (values) => {
    if (isEdit) {
      dispatch({
        type: 'systemApi/update',
        payload: {
          ...values,
          id,
          type: 2,
        },
        callback: () => {
          resetFields();
          closeModal();
          message.success('修改接口成功。');
        },
      });
    } else {
      dispatch({
        type: 'systemApi/add',
        payload: {
          ...values,
          type: 2,
        },
        callback: () => {
          resetFields();
          closeModal();
          message.success('添加接口成功。');
        },
      });
    }
  };

  // 【表单布局】
  const layout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  };
  const tailLayout = {
    wrapperCol: {
      xs: { offset: 0, span: 24 },
      sm: { offset: 5, span: 19 },
    },
  };

  return (
    <Modal
      destroyOnClose
      title={isEdit ? '修改接口' : '新增接口'}
      visible={visible}
      onCancel={closeModal}
      footer={null}
    >
      <Form
        {...layout}
        form={form}
        name="apiForm"
        className={styles.form}
        initialValues={{
          parentId: id.toString(),
          status: true,
        }}
        onFinish={handleAddOrUpdate}
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[
            {
              required: true,
              message: '请将名称长度保持在1至20字符之间！',
              min: 1,
              max: 20,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="编码"
          name="code"
          rules={[
            {
              required: true,
              message: '请将编码长度保持在1至50字符之间！',
              min: 1,
              max: 50,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="URL"
          name="uri"
          rules={[
            {
              required: true,
              message: '请将URL长度保持在3至100字符之间！',
              min: 3,
              max: 100,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="状态" name="status" rules={[{ required: true }]} valuePropName="checked">
          <Switch checkedChildren="开" unCheckedChildren="关" />
        </Form.Item>
        <Form.Item
          label="方法类型"
          name="method"
          rules={[{ required: true, message: '请选择方法类型。' }]}
        >
          <Radio.Group>
            <Radio value="GET">GET</Radio>
            <Radio value="POST">POST</Radio>
            <Radio value="DELETE">DELETE</Radio>
            <Radio value="PUT">PUT</Radio>
            <Radio value="PATCH">PATCH</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="父菜单" name="parentId">
          <TreeSelect
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={tree}
            placeholder="请选择菜单。"
            treeDefaultExpandAll
          />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button onClick={closeModal}>取消</Button>
          <Button type="primary" loading={loading} htmlType="submit">
            确定
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default ApiForm;
