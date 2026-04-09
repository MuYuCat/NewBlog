import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag, Space } from 'antd';
import { useRef } from 'react';
import { request } from '@umijs/max';

interface JournalItem {
  id: number;
  content: string;
  mood?: string;
  location?: string;
  clicks: number;
  createdAt: string;
}

const JournalPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<JournalItem>[] = [
    {
      title: '内容预览',
      dataIndex: 'content',
      ellipsis: true,
      search: {
        title: '模糊搜索',
      },
      render: (text) => <div style={{ maxWidth: 400 }}>{String(text).replace(/<[^>]+>/g, '')}</div>,
    },
    {
      title: '心情',
      dataIndex: 'mood',
      render: (mood) => (mood ? <Tag color="pink">{mood}</Tag> : '-'),
    },
    {
      title: '发布地点',
      dataIndex: 'location',
      hideInSearch: true,
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
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
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Popconfirm
          key="delete"
          title="确定删除这条随笔吗？"
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
      <ProTable<JournalItem>
        headerTitle="随笔日志管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => message.info('极速发布组件开发中...')}
          >
            发随笔
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, content, ...rest } = params;
          const data = await request<JournalItem[]>('/article/article', {
            params: {
              ...rest,
              search: content,
              type: 'JOURNAL',
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

export default JournalPage;
