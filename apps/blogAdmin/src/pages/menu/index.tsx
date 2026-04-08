import React from 'react';
import { Result, Button } from 'antd';
import { history } from '@umijs/max';

const MenuPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Result
        status="info"
        title="菜单管理 - 正在建设中"
        subTitle="在这里配置前台导航项，支持二级菜单与 i18n Key 配置。"
        extra={
          <Button type="primary" onClick={() => history.push('/dashboard')}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
};

export default MenuPage;
