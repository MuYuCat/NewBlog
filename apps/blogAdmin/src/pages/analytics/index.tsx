import React from 'react';
import { Result, Button } from 'antd';
import { history } from '@umijs/max';

const AnalyticsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Result
        status="info"
        title="日志管理 - 正在建设中"
        subTitle="操作埋点记录审计日志，展示 PV/UV 与游戏数据趋势。"
        extra={
          <Button type="primary" onClick={() => history.push('/dashboard')}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
};

export default AnalyticsPage;
