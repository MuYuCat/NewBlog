import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Form, Input, Button, Rate, Card, Row, Col, Space, message, Divider } from 'antd';
import { SaveOutlined, RocketOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { history, useParams, request } from '@umijs/max';
import './game.scss';

const { TextArea } = Input;

const GameEdit: React.FC = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await request(`/game/${id}`);
      form.setFieldsValue(res);
    } catch {
      message.error('获取详情失败');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (id) {
        await request(`/game/${id}`, { method: 'PATCH', data: values });
        message.success('档案协议已修订');
      } else {
        await request('/game', { method: 'POST', data: values });
        message.success('新档案已入库');
      }
      history.push('/game/index');
    } catch {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      header={{
        title: id ? '档案实验室 / Game Lab' : '入库中心 / Game Entry',
        subTitle: id ? '正在修订 Master Game 核心元数据' : '手动创建新的主游戏实体',
        onBack: () => history.push('/game/index'),
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{ rating: 0 }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Card title="核心识别 (Core Identity)" bordered={false} className="elite-card">
              <Form.Item
                label="统一显示标题"
                name="title"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="游戏官方中文或英文原名" size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="IGDB 唯一标识" name="igdbId">
                    <Input
                      placeholder="用于跨平台自动匹配的识别码"
                      addonAfter={<RocketOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="高清封面 URL" name="coverUrl">
                    <Input placeholder="https://..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="剧情梗概" name="summary">
                <TextArea rows={6} placeholder="简短描述游戏的世界观与核心玩法" />
              </Form.Item>
            </Card>

            <Card
              title="深度评测协议 (Review Protocol)"
              bordered={false}
              className="elite-card"
              style={{ marginTop: 24 }}
            >
              <Form.Item label="个人评分" name="rating">
                <Rate allowHalf />
              </Form.Item>
              <Form.Item label="深度简评" name="review">
                <TextArea rows={10} placeholder="支持 Markdown 格式的深度见解..." />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="发布状态" bordered={false} className="elite-card">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => form.submit()}
                >
                  确认入库
                </Button>
                <Button block size="large" onClick={() => history.push('/game/index')}>
                  放弃修订
                </Button>
              </Space>
              <Divider />
              <div className="status-info">
                <p>最后更新: 2026-04-17</p>
                <p>归档编号: {id || 'NEW_ENTITY'}</p>
              </div>
            </Card>

            <Card
              title="平台拓扑 (Topology)"
              bordered={false}
              className="elite-card"
              style={{ marginTop: 24 }}
            >
              <div className="empty-tip">
                <CloudSyncOutlined style={{ fontSize: 32, color: '#ccc' }} />
                <p>平台关联通常由自动同步器驱动</p>
                <Button type="link">管理关联平台</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </PageContainer>
  );
};

export default GameEdit;
