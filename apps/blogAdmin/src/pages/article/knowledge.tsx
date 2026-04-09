import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Tag, Popconfirm, Select, Space } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { request, history } from '@umijs/max';

interface ArticleItem {
  id: number;
  type: string;
  title: string;
  slug: string;
  status: number;
  clicks: number;
  category?: { name: string };
  createdAt: string;
}

const KnowledgePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);

  // 获取全量分类用于筛选
  useEffect(() => {
    request('/article/category').then((res) => {
      setCategories(res.map((item: any) => ({ label: item.name, value: item.id })));
    });
  }, []);

  const columns: ProColumns<ArticleItem>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
      formItemProps: {
        placeholder: '模糊搜索标题或内容...',
      },
    },
    {
      title: '主题分类',
      dataIndex: 'categoryId',
      valueType: 'select',
      fieldProps: {
        options: categories,
      },
      render: (_, record) => <Tag color="blue">{record.category?.name || '未分类'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: { text: '草稿', status: 'Default' },
        1: { text: '已发布', status: 'Success' },
        2: { text: '私密', status: 'Error' },
      },
    },
    {
      title: '浏览量',
      dataIndex: 'clicks',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '发布日期',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => ({ startDate: value[0], endDate: value[1] }),
      },
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="edit" onClick={() => message.info('编辑器组件开发中...')}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这篇文章吗？"
          onConfirm={async () => {
            await request(`/article/article/${record.id}`, { method: 'DELETE' });
            message.success('删除成功');
            actionRef.current?.reload();
          }}
        >
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<ArticleItem>
        headerTitle="智库博文管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => message.info('编辑器组件开发中...')}
          >
            写博文
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, title, ...rest } = params;
          const data = await request<ArticleItem[]>('/article/article', {
            params: {
              ...rest,
              search: title,
              type: 'KNOWLEDGE',
            },
          });
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default KnowledgePage;
