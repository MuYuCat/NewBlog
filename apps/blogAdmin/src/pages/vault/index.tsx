import React from 'react';
import { Result, Button } from 'antd';
import { history } from '@umijs/max';

const VaultPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Result
        status="info"
        title="资源宝库 - 正在建设中"
        subTitle="负责资源剪藏，链接分类（工具、灵感等）及编辑备注管理。"
        extra={
          <Button type="primary" onClick={() => history.push('/dashboard')}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
};

export default VaultPage;
