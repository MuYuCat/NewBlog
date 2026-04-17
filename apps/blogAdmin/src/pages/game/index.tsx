import React, { useRef, useState, useEffect } from 'react';
import { PageContainer, ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Space, message, Modal, Image, Tooltip } from 'antd';
import { PlusOutlined, SyncOutlined, DeleteOutlined } from '@ant-design/icons';
import { history, request } from '@umijs/max';
import dayjs from 'dayjs';
import './game.scss';

const GameList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [syncLoading, setSyncLoading] = useState(false);
  const [remainingCD, setRemainingCD] = useState<number>(0); // 剩余 CD 分钟

  // 1. 获取并刷新同步状态
  const refreshSyncState = async () => {
    try {
      const res = await request('/game/last-sync');
      if (res?.lastSyncAt) {
        const diff = dayjs().diff(dayjs(res.lastSyncAt), 'minute');
        setRemainingCD(diff < 120 ? 120 - diff : 0);
      }
    } catch (e) {
      console.error('获取同步状态失败', e);
    }
  };

  useEffect(() => {
    refreshSyncState();
    const timer = setInterval(() => {
      if (remainingCD > 0) setRemainingCD((prev) => prev - 1);
    }, 60000);
    return () => clearInterval(timer);
  }, [remainingCD]);

  // 2. 触发手动同步
  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      await request('/game/sync', { method: 'POST' });
      message.success('同步指令已下达，全量数据更新中...');
      actionRef.current?.reload();
      refreshSyncState();
    } catch (e: any) {
      if (e.response?.status === 429) {
        message.warning(e.data?.message || '同步冷却中');
      } else {
        message.error('同步失败，请检查后端服务');
      }
    } finally {
      setSyncLoading(false);
    }
  };

  const columns: ProColumns[] = [
    {
      title: '封面',
      dataIndex: 'coverUrl',
      hideInSearch: true,
      render: (text) => (
        <Image
          src={text as string}
          width={60}
          height={80}
          className="game-cover-mini"
          fallback="/MuYuCat.png"
        />
      ),
    },
    {
      title: '游戏名称',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '平台',
      dataIndex: 'platforms',
      hideInSearch: true,
      render: (_, record) => (
        <Space size="small">
          {record.platforms?.map((p: any) => (
            <Tag color={p.platform === 'PS5' ? 'blue' : 'green'} key={p.id}>
              {p.platform}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '上次活跃',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a key="edit" onClick={() => history.push(`/game/edit/${record.id}`)}>
          编辑
        </a>,
        <Button
          type="link"
          danger
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => {
            Modal.confirm({
              title: '确认删除？',
              onOk: async () => {
                await request(`/game/${record.id}`, { method: 'DELETE' });
                action?.reload();
              },
            });
          }}
        />,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        title: '游戏实验室 / Game Lab',
        subTitle: '自动化全平台游戏档案同步',
      }}
      extra={[
        <Button key="config" icon={<SyncOutlined />} onClick={() => history.push('/game/config')}>
          同步指挥塔
        </Button>,
        <Tooltip
          key="tip"
          title={remainingCD > 0 ? `安全阀生效中，剩余 ${remainingCD} 分钟` : '可以执行同步'}
        >
          <Button
            key="sync"
            icon={<SyncOutlined />}
            loading={syncLoading}
            disabled={remainingCD > 0}
            onClick={handleManualSync}
          >
            {remainingCD > 0 ? `同步冷却 (${remainingCD}m)` : '一键全量同步'}
          </Button>
        </Tooltip>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => history.push('/game/edit')}
        >
          手动录入
        </Button>,
      ]}
    >
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}) => {
          const res = await request('/game', {
            params: {
              page: params.current,
              limit: params.pageSize,
              search: params.title,
            },
          });
          return { data: res.items, success: true, total: res.total };
        }}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
      />
    </PageContainer>
  );
};

export default GameList;
