import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography, ConfigProvider, theme as antdTheme } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate, useModel, request } from '@umijs/max';
import { LoginSchema } from '@newblog/validation';
import { gsap } from 'gsap';
import './index.scss';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const { setInitialState } = useModel('@@initialState');

  // 初始化主题检查
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDark(true);
    }

    // 入场动画
    gsap.fromTo(
      '.login-card',
      { opacity: 0, x: 40, filter: 'blur(10px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', delay: 0.3 },
    );
    gsap.fromTo(
      '.brand-side > *',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power2.out' },
    );
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('admin-theme', next ? 'dark' : 'light');
  };

  const handleSubmit = async (values: any) => {
    const result = LoginSchema.safeParse(values);
    if (!result.success) {
      message.error(result.error.errors[0].message);
      return;
    }

    const loadingKey = 'login-loading';
    message.loading({ content: '身份验证中...', key: loadingKey });

    try {
      // 现在的 request 直接返回了后端的 data 字段
      const res = await request('/auth/login', {
        method: 'POST',
        data: values,
      });

      if (res.access_token) {
        message.success({ content: '欢迎回来，管理员。', key: loadingKey });
        localStorage.setItem('admin-token', res.access_token);

        // 更新全局状态
        setInitialState({
          isLoggedIn: true,
          currentUser: {
            username: res.user.username,
            avatar: res.user.avatar,
            role: res.user.role,
          },
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      // error 已经被拦截器处理并 message.error 了，这里只需停止 loading
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8a2be2',
          borderRadius: 16,
        },
      }}
    >
      <div
        className={`login-container ${isDark ? 'dark' : 'light'}`}
        style={
          {
            '--text-color-rgb': isDark ? '255, 255, 255' : '0, 0, 0',
            '--accent-color': '#8a2be2',
          } as React.CSSProperties
        }
      >
        {/* 背景动态光晕 */}
        <div className="glow-orb glow-1" />
        <div className="glow-orb glow-2" />

        <div className="login-content">
          {/* 左侧：品牌展示 (仅在大屏幕显示) */}
          <div className="brand-side">
            <Title
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '4.5rem',
                lineHeight: 1,
                margin: 0,
                fontStyle: 'italic',
                color: isDark ? '#fff' : '#08060d',
              }}
            >
              MuYuCat
            </Title>
            <div className="divider" />
            <div className="slogan-wrapper">
              <Text className="slogan-line">一记木鱼，一只野猫，</Text>
              <Text className="slogan-line">于喧嚣之外，管理这一方静谧的数字净土。</Text>
            </div>
          </div>

          {/* 右侧：登录卡片 */}
          <div className="login-card-wrapper">
            <div className={`login-card ${isDark ? 'dark-card' : 'light-card'}`}>
              {/* 主题切换开关 */}
              <button onClick={toggleTheme} className="theme-toggle">
                {isDark ? <SunOutlined /> : <MoonOutlined />}
              </button>

              <div style={{ marginBottom: '3rem' }}>
                <Title
                  level={2}
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontWeight: 500,
                    fontSize: '2rem',
                    marginBottom: '8px',
                  }}
                >
                  管理员登录
                </Title>
                <Text
                  type="secondary"
                  style={{
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    opacity: 0.6,
                  }}
                >
                  Admin Authentication
                </Text>
              </div>

              <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
                <Form.Item name="username" className="custom-input">
                  <Input
                    size="large"
                    placeholder="管理账号"
                    allowClear
                    prefix={<UserOutlined style={{ opacity: 0.3, marginRight: '12px' }} />}
                  />
                </Form.Item>

                <Form.Item name="password" className="custom-input">
                  <Input.Password
                    size="large"
                    placeholder="安全密钥"
                    allowClear
                    prefix={<LockOutlined style={{ opacity: 0.3, marginRight: '12px' }} />}
                  />
                </Form.Item>

                <div
                  style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}
                >
                  <a
                    style={{ fontSize: '0.8rem', color: '#8a2be2', fontWeight: 500, opacity: 0.8 }}
                  >
                    重置密钥
                  </a>
                </div>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" block className="elite-submit-btn">
                    确认登入
                    <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
