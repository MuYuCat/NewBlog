import React from 'react';
import { Result, Button } from 'antd';
import { history } from '@umijs/max';

const GamePage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Result
        status="info"
        title="游戏管理 - 正在建设中"
        subTitle="正在对接 Steam/PSN 数据流，实现三方接口原始数据展示与统计筛选。"
        extra={
          <Button type="primary" onClick={() => history.push('/dashboard')}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
};

export default GamePage;
