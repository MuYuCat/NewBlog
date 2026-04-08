import React from 'react';
import { Result, Button } from 'antd';
import { history } from '@umijs/max';

const ArticlePage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Result
        status="info"
        title="文章管理 - 正在建设中"
        subTitle="涵盖知识智库、个人博客、日常随笔，提供沉浸式内容编辑体验。"
        extra={
          <Button type="primary" onClick={() => history.push('/dashboard')}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
};

export default ArticlePage;
