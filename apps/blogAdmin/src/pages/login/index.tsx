import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  ConfigProvider,
  theme as antdTheme,
  Space,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  SunOutlined,
  MoonOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useModel, request } from '@umijs/max';
import { LoginSchema, TwoFactorSchema } from '@newblog/validation';
import { gsap } from 'gsap';
import './index.scss';

const { Title, Text } = Typography;

/**
 * 6 位分体式验证码组件 - 完美居中交互版
 */
const DigitInput: React.FC<{ value?: string; onChange?: (val: string) => void }> = ({
  value = '',
  onChange,
}) => {
  const [digits, setDigits] = useState<string[]>(new Array(6).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value === '') setDigits(new Array(6).fill(''));
  }, [value]);

  const handleChange = (val: string, index: number) => {
    const newVal = val.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = newVal;
    setDigits(newDigits);
    const result = newDigits.join('');
    onChange?.(result);

    if (newVal && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, 6);
    if (pasteData) {
      const newDigits = pasteData.split('').concat(new Array(6 - pasteData.length).fill(''));
      setDigits(newDigits);
      onChange?.(newDigits.join(''));
      inputs.current[Math.min(pasteData.length, 5)]?.focus();
    }
  };

  return (
    <div className="digit-input-container" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          value={d}
          placeholder="0"
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          maxLength={1}
          className="digit-box"
        />
      ))}
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [twoFactorForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isDark, setIsDark] = useState(false);
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { initialState, setInitialState } = useModel('@@initialState');

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDark(true);
    }
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

  const handleLoginSuccess = async (data: any, loadingKey: string) => {
    messageApi.success({ content: '身份验证成功，正在同步空间...', key: loadingKey });

    // 1. 先存 Token，保证后续请求合法
    localStorage.setItem('admin-token', data.access_token);

    // 2. 核心修复：必须 await 同步状态，并保留旧状态防止回弹
    await setInitialState((s: any) => ({
      ...s,
      isLoggedIn: true,
      currentUser: data.user,
    }));

    // 3. 状态确定后再跳转
    navigate('/dashboard');
  };

  const handleSubmit = async (values: any) => {
    const validation = LoginSchema.safeParse(values);
    if (!validation.success) return messageApi.error(validation.error.errors[0].message);

    const loadingKey = 'login-loading';
    messageApi.loading({ content: '身份验证中...', key: loadingKey });

    try {
      const res = await request('/auth/login', { method: 'POST', data: values });
      if (res.require2FA) {
        messageApi.destroy(loadingKey);
        setTempUserId(res.userId);
        setStep('2fa');
        gsap.fromTo(
          '.login-card-inner',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        );
      } else {
        await handleLoginSuccess(res, loadingKey);
      }
    } catch (e) {}
  };

  const handle2FASubmit = async (values: { token: string }) => {
    const validation = TwoFactorSchema.safeParse(values);
    if (!validation.success) return messageApi.error(validation.error.errors[0].message);

    const loadingKey = '2fa-loading';
    messageApi.loading({ content: '正在校验安全令牌...', key: loadingKey });

    try {
      const res = await request('/auth/2fa/verify', {
        method: 'POST',
        data: { userId: tempUserId, token: values.token },
      });
      await handleLoginSuccess(res, loadingKey);
    } catch (e) {}
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: '#8a2be2', borderRadius: 16 },
      }}
    >
      {contextHolder}
      <div
        className={`login-container ${isDark ? 'dark' : 'light'}`}
        style={
          {
            '--text-color-rgb': isDark ? '255, 255, 255' : '0, 0, 0',
            '--accent-color': '#8a2be2',
          } as any
        }
      >
        {/* 背景动态光晕 */}
        <div className="glow-orb glow-1" />
        <div className="glow-orb glow-2" />

        <div className="login-content">
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
          <div className="login-card-wrapper">
            <div className={`login-card ${isDark ? 'dark-card' : 'light-card'}`}>
              <button onClick={toggleTheme} className="theme-toggle">
                {isDark ? <SunOutlined /> : <MoonOutlined />}
              </button>
              <div className="login-card-inner">
                {step === 'login' ? (
                  <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Title
                      level={2}
                      style={{ fontFamily: "'Noto Serif SC', serif", marginBottom: '2.5rem' }}
                    >
                      管理员登录
                    </Title>
                    <Form.Item name="username">
                      <Input
                        size="large"
                        placeholder="管理账号"
                        prefix={<UserOutlined style={{ opacity: 0.3 }} />}
                        style={{ height: '50px' }}
                      />
                    </Form.Item>
                    <Form.Item name="password">
                      <Input.Password
                        size="large"
                        placeholder="安全密钥"
                        prefix={<LockOutlined style={{ opacity: 0.3 }} />}
                        style={{ height: '50px' }}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      className="elite-btn"
                    >
                      登入系统 <ArrowRightOutlined />
                    </Button>
                  </Form>
                ) : (
                  <Form form={twoFactorForm} onFinish={handle2FASubmit} layout="vertical">
                    <Title
                      level={2}
                      style={{ fontFamily: "'Noto Serif SC', serif", marginBottom: '1rem' }}
                    >
                      双重认证
                    </Title>
                    <Text
                      type="secondary"
                      style={{ display: 'block', marginBottom: '2.5rem', fontSize: '0.85rem' }}
                    >
                      请输入 TOTP App 提供的 6 位动态验证码
                    </Text>

                    <Form.Item name="token" style={{ marginBottom: 0 }}>
                      <DigitInput />
                    </Form.Item>

                    <Space direction="vertical" style={{ width: '100%', marginTop: '1rem' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        className="elite-btn"
                      >
                        确认并登入
                      </Button>
                      <Button
                        type="link"
                        block
                        onClick={() => setStep('login')}
                        icon={<ArrowLeftOutlined />}
                        style={{ color: 'inherit', opacity: 0.5, marginTop: '1rem' }}
                      >
                        返回常规登录
                      </Button>
                    </Space>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
