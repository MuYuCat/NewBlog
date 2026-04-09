import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Modal, Form, Input, InputNumber, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { request } from '@umijs/max';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  order: number;
  _count?: {
    articles: number;
  };
  createdAt: string;
}

const CategoryPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<CategoryItem | null>(null);

  const columns: ProColumns<CategoryItem>[] = [
    {
      title: '分类名称',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '标识 (Slug)',
      dataIndex: 'slug',
      valueType: 'code',
    },
    {
      title: '排序',
      dataIndex: 'order',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '文章数量',
      dataIndex: ['_count', 'articles'],
      hideInSearch: true,
      render: (text) => text || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRecord(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="警告"
          description="确定要删除这个分类吗？如果分类下已有文章将无法删除。"
          onConfirm={async () => {
            try {
              await request(`/article/category/${record.id}`, { method: 'DELETE' });
              message.success('删除成功');
              actionRef.current?.reload();
            } catch (e: any) {
              message.error(e.message || '删除失败');
            }
          }}
        >
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<CategoryItem>
        headerTitle="分类管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setCurrentRecord(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建分类
          </Button>,
        ]}
        request={async (params) => {
          const data = await request<CategoryItem[]>('/article/category');
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />

      <Modal
        title={currentRecord ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            if (currentRecord) {
              await request(`/article/category/${currentRecord.id}`, {
                method: 'PATCH',
                data: values,
              });
            } else {
              await request('/article/category', {
                method: 'POST',
                data: values,
              });
            }
            message.success(currentRecord ? '更新成功' : '创建成功');
            setModalVisible(false);
            actionRef.current?.reload();
          } catch (e) {
            // 表单校验失败或 API 报错
          }
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ order: 0 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：前端开发" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="标识 (Slug)"
            rules={[{ required: true, message: '请输入标识' }]}
          >
            <Input placeholder="如：frontend" />
          </Form.Item>
          <Form.Item name="order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default CategoryPage;
