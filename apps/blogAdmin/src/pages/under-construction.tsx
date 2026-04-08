import React from 'react';
import { Result, Button } from 'antd';
import { history } from '@umijs/max';

const UnderConstruction: React.FC = () => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <Result
        status="404"
        title="正在开发中"
        subTitle="抱歉，该功能模块正在抓紧建设中，敬请期待。"
        extra={
          <Button type="primary" onClick={() => history.push('/dashboard')}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
};

export default UnderConstruction;
