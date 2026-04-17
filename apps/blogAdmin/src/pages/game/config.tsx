import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Modal, Form, Input, message, Badge, Space, Alert } from 'antd';
import {
  SettingOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { request } from '@umijs/max';
import dayjs from 'dayjs';
import './game.scss';

const GameConfig: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await request('/game/config');
      setConfigs(res);
    } catch {
      message.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleEdit = (record: any) => {
    setCurrentPlatform(record);
    form.setFieldsValue({
      config: JSON.stringify(record.config, null, 2),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await request('/game/config', {
        method: 'POST',
        data: {
          platform: currentPlatform.platform,
          config: JSON.parse(values.config),
        },
      });
      message.success(`${currentPlatform.platform} 配置已更新`);
      setModalVisible(false);
      fetchConfigs();
    } catch {
      message.error('保存失败，请检查 JSON 格式');
    }
  };

  const columns = [
    {
      title: '同步平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (text: string) => (
        <Space>
          <SafetyCertificateOutlined style={{ color: text === 'Steam' ? '#1b2838' : '#0070d1' }} />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap: any = {
          1: { text: '健康 (Active)', status: 'success' },
          0: { text: '异常 (Fault)', status: 'error' },
          2: { text: '同步中 (Syncing)', status: 'processing' },
          3: { text: '风险隔离 (Risk)', status: 'warning' },
        };
        const config = statusMap[status] || statusMap[1];
        return <Badge status={config.status} text={config.text} />;
      },
    },
    {
      title: '最后同步时间',
      dataIndex: 'lastSyncAt',
      key: 'lastSyncAt',
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '从无同步'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<SettingOutlined />}
          onClick={() => handleEdit(record)}
          disabled={record.platform === 'GLOBAL_SYNC_STATE'}
        >
          配置凭证
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '同步指挥塔 / Control Tower',
        subTitle: '全平台同步凭证管理与熔断策略',
      }}
    >
      <Alert
        message="工业级安全阀提示"
        description="所有敏感凭证（API Key, Tokens）在后端均执行加密存储。手动修改配置后需等待 CD 冷却完毕方可再次触发同步。"
        type="info"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Card bordered={false} className="elite-card">
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={`修订 ${currentPlatform?.platform} 同步协议`}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="平台特有配置 (JSON 镜像)"
            name="config"
            rules={[{ required: true, message: '请输入配置 JSON' }]}
            extra="请务必确保 JSON 格式正确，包含 API Key 或 Session Tokens。"
          >
            <Input.TextArea rows={12} className="code-editor" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default GameConfig;
