import React from 'react';
import { LoginForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-components';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { message, Tabs } from 'antd';
import { history } from '@umijs/max';
import { LoginSchema, type LoginInput } from '@newblog/validation';

const LoginPage: React.FC = () => {
  const handleSubmit = async (values: LoginInput) => {
    // 使用共享包进行校验
    const result = LoginSchema.safeParse(values);

    if (!result.success) {
      message.error(result.error.errors[0].message);
      return;
    }

    console.log('Valid login data:', values);
    message.success('登录成功！');
    history.push('/');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="shadow-lg rounded-lg bg-white">
        <LoginForm title="NewBlog Admin" subTitle="企业级后台管理系统" onFinish={handleSubmit}>
          <Tabs centered items={[{ key: 'account', label: '账户登录' }]} />
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="用户名: 3-20位字母开头"
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="密码: 含大小写及特殊字符"
            rules={[{ required: true, message: '请输入密码' }]}
          />
          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="remember">
              自动登录
            </ProFormCheckbox>
            <a className="float-right text-blue-500 hover:text-blue-700">忘记密码</a>
          </div>
        </LoginForm>
      </div>
    </div>
  );
};

export default LoginPage;
