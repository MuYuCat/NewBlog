import React from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Button, Typography, Space, Row, Col } from 'antd';
import { LoginSchema } from '@newblog/validation';

const { Title, Paragraph } = Typography;
const { Statistic } = StatisticCard;

const HomePage: React.FC = () => {
  // 架构验证：确保共享校验包可用
  console.log('Validation Schema:', LoginSchema);

  return (
    <PageContainer title="工作台">
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <ProCard
          title="系统动态"
          extra={<Button type="primary">快速发布</Button>}
          headerBordered
          boxShadow
        >
          <Title level={3}>欢迎来到 NewBlog 管理后台</Title>
          <Paragraph className="text-gray-500">
            当前系统由 <strong>@umijs/max</strong> 强力驱动，已完美集成{' '}
            <strong>Ant Design ProComponents</strong>与 <strong>Tailwind CSS</strong>
            。全栈校验逻辑已通过 Monorepo 共享。
          </Paragraph>
        </ProCard>

        <Row gutter={16}>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '累计文章',
                value: 128,
                suffix: '篇',
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '昨日新增',
                value: 12,
                status: 'error',
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '资源收藏',
                value: 45,
                suffix: '个',
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '访问人数',
                value: 1024,
                precision: 0,
              }}
            />
          </Col>
        </Row>
      </Space>
    </PageContainer>
  );
};

export default HomePage;
