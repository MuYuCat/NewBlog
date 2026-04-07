import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, List, Tag, Avatar, Button } from 'antd';
import {
  RiseOutlined,
  BookOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  CheckCircleTwoTone,
  SyncOutlined,
} from '@ant-design/icons';
import { gsap } from 'gsap';
import './index.scss';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('admin-theme');
    setIsDark(theme === 'dark');

    // 渐现动画
    gsap.fromTo(
      '.stat-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
    );
    gsap.fromTo(
      '.main-content-card',
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 1, ease: 'expo.out', delay: 0.4 },
    );
  }, []);

  return (
    <div className={`dashboard-wrapper ${isDark ? 'dark' : 'light'}`}>
      <div className="header-section">
        <div className="title-group">
          <Title level={2} className="dashboard-title">
            领航控制台
          </Title>
          <Text className="dashboard-subtitle">欢迎回来，MuYuCat。系统运行一切正常。</Text>
        </div>
        <div className="system-status">
          <Tag icon={<SyncOutlined spin />} color="processing" className="status-tag">
            API 在线
          </Tag>
          <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} className="status-tag">
            构建已就绪
          </Tag>
        </div>
      </div>

      {/* KPI Stats 网格 */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="累计游戏时长"
              value={1284}
              precision={0}
              suffix="h"
              prefix={<ClockCircleOutlined className="icon-purple" />}
              valueStyle={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '2.4rem',
                fontStyle: 'italic',
              }}
            />
            <div className="stat-footer">
              较上月{' '}
              <Text type="success">
                +12% <RiseOutlined />
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="知识库字数"
              value={42.8}
              precision={1}
              suffix="k"
              prefix={<BookOutlined className="icon-purple" />}
              valueStyle={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '2.4rem',
                fontStyle: 'italic',
              }}
            />
            <div className="stat-footer">已更新 15 篇文章</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="本月访客 UV"
              value={856}
              precision={0}
              prefix={<RocketOutlined className="icon-purple" />}
              valueStyle={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '2.4rem',
                fontStyle: 'italic',
              }}
            />
            <div className="stat-footer">平均停留时长 4:20</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card highlight">
            <div className="mbti-display">
              <span className="mbti-label">人格原型</span>
              <span className="mbti-value">INTJ-A</span>
            </div>
            <div className="mbti-desc">建筑师 · 战略家</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* 最近动态 */}
        <Col xs={24} lg={16}>
          <Card
            className="main-content-card"
            title={<span className="card-title-custom">最近操作记录</span>}
          >
            <List
              itemLayout="horizontal"
              dataSource={[
                { title: '同步了游戏《艾尔登法环》数据', time: '10 分钟前', type: 'GAME' },
                {
                  title: '发布了技术笔记《Astro 性能深度优化》',
                  time: '2 小时前',
                  type: 'ARTICLE',
                },
                { title: '剪藏了新资源：React 19 设计模式库', time: '5 小时前', type: 'VAULT' },
              ]}
              renderItem={(item) => (
                <List.Item className="history-item">
                  <List.Item.Meta
                    avatar={<Avatar className={`type-icon ${item.type.toLowerCase()}`} />}
                    title={<span className="history-title">{item.title}</span>}
                    description={<span className="history-time">{item.time}</span>}
                  />
                  <Button type="link" size="small">
                    撤销
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 快速设置/状态 */}
        <Col xs={24} lg={8}>
          <Card
            className="main-content-card small"
            title={<span className="card-title-custom">系统快照</span>}
          >
            <div className="snapshot-grid">
              <div className="snapshot-item">
                <span className="label">数据库连接</span>
                <span className="value success">健康</span>
              </div>
              <div className="snapshot-item">
                <span className="label">Astro 重构</span>
                <span className="value">待触发</span>
              </div>
              <div className="snapshot-item">
                <span className="label">存储空间</span>
                <span className="value">12.4 / 50 GB</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
