import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Avatar,
  Typography,
  Space,
  Badge,
  Divider,
  Tooltip,
  Spin,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CopyOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  QrcodeOutlined,
  UnlockOutlined,
  CheckCircleFilled,
  KeyOutlined,
} from '@ant-design/icons';
import { useModel, request } from '@umijs/max';
import './SecurityModal.scss';

const { Title, Text } = Typography;

/**
 * 6 位分体式验证码组件
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
    const combined = newDigits.join('');
    onChange?.(combined);
    if (newVal && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  return (
    <div className="elite-digit-container">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          value={d}
          placeholder="·"
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          maxLength={1}
          className="elite-digit-box"
        />
      ))}
    </div>
  );
};

interface SecurityModalProps {
  visible: boolean;
  avatar: any;
  onCancel: () => void;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ visible, avatar, onCancel }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const user = initialState?.currentUser;

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showSecret, setShowSecret] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [loading, setLoading] = useState(false);

  // 三个独立的表单实例，解决嵌套问题
  const [profileForm] = Form.useForm();
  const [disableForm] = Form.useForm();
  const [enableForm] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      setMode('view');
      setShowConfig(false);
      setIsEnabling(false);
      setIsDisabling(false);
      setTwoFactorData(null);
    }
  }, [visible]);

  const fetch2FAData = async () => {
    setLoading(true);
    try {
      const res = await request('/auth/2fa/generate', {
        method: 'POST',
        data: { userId: user?.id },
      });
      setTwoFactorData(res);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setLoading(true);
      const updatedUser = await request('/auth/update-profile', { method: 'POST', data: values });
      await setInitialState((s: any) => ({ ...s, currentUser: updatedUser }));
      message.success('档案信息已同步更新');
      setMode('view');
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const { token } = await enableForm.validateFields();
      if (!twoFactorData) return;
      setLoading(true);
      await request('/auth/2fa/enable', {
        method: 'POST',
        data: { userId: user?.id, secret: twoFactorData.secret, token },
      });
      message.success('双重认证已锁定');
      setIsEnabling(false);
      setTwoFactorData(null);
      enableForm.resetFields();
      await setInitialState((s: any) => ({
        ...s,
        currentUser: { ...user!, isTwoFactorEnabled: true },
      }));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const { token } = await disableForm.validateFields();
      setLoading(true);
      await request('/auth/2fa/disable', {
        method: 'POST',
        data: { userId: user?.id, token },
      });
      message.success('双重认证已安全停用');
      setIsDisabling(false);
      disableForm.resetFields();
      await setInitialState((s: any) => ({
        ...s,
        currentUser: { ...user!, isTwoFactorEnabled: false },
      }));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      className="elite-glass-modal"
      destroyOnHidden
      maskClosable={false}
      keyboard={false}
    >
      <div className="security-modal-body">
        {mode === 'view' ? (
          <div className="view-content animate-fade-in">
            <div className="profile-header">
              <div className="avatar-orbit">
                <Avatar size={110} src={user?.avatar || avatar} className="avatar-core" />
                {user?.isTwoFactorEnabled && (
                  <div className="shield-icon">
                    <SafetyCertificateOutlined />
                  </div>
                )}
              </div>
              <div className="text-section">
                <Title level={2} className="username-serif">
                  {user?.username}
                </Title>
                <Text className="role-tag">{user?.role || 'Elite Administrator'}</Text>
              </div>
            </div>

            <div className="security-dashboard">
              {/* <div className="score-row">
                <div className="score-label">
                  <Text strong>安全评分</Text>
                  <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>实时监测您的账户防护等级</Text>
                </div>
                <div className={`score-value ${user?.isTwoFactorEnabled ? 'high' : 'medium'}`}>
                  {user?.isTwoFactorEnabled ? 'PROTECTED' : 'AT RISK'}
                </div>
              </div> */}
              {/* <Divider style={{ margin: '1.5rem 0', opacity: 0.06 }} /> */}

              <div className="action-stack">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => setMode('edit')}
                >
                  进入管理中心
                </Button>
                {user?.isTwoFactorEnabled ? (
                  <Button
                    className="show-qrcode"
                    block
                    size="large"
                    icon={<QrcodeOutlined />}
                    onClick={() => {
                      setShowConfig(!showConfig);
                      if (!twoFactorData) fetch2FAData();
                    }}
                  >
                    {showConfig ? '隐藏凭证卡片' : '查看安全凭证'}
                  </Button>
                ) : (
                  <Button
                    className="show-qrcode"
                    type="dashed"
                    block
                    size="large"
                    danger
                    icon={<UnlockOutlined />}
                    onClick={() => {
                      setIsEnabling(true);
                      fetch2FAData();
                      setMode('edit');
                    }}
                  >
                    开启 2FA 锁定账户
                  </Button>
                )}
              </div>

              {showConfig && (
                <div className="credential-card animate-slide-up">
                  {loading ? (
                    <Spin />
                  ) : (
                    twoFactorData && (
                      <>
                        <img src={twoFactorData.qrCodeDataUrl} alt="2fa" className="qr-img" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Text code>
                            {showSecret ? twoFactorData.secret : '•••• •••• •••• ••••'}
                          </Text>
                          <Space size={4}>
                            <Button
                              size="small"
                              type="text"
                              icon={showSecret ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                              onClick={() => setShowSecret(!showSecret)}
                            />
                            <Tooltip title="复制密钥">
                              <Button
                                size="small"
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  navigator.clipboard.writeText(twoFactorData.secret);
                                  message.success('密钥已复制');
                                }}
                              />
                            </Tooltip>
                          </Space>
                        </div>
                      </>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="edit-content animate-fade-in">
            <div className="nav-header">
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setMode('view')}>
                返回
              </Button>
              <Title level={4} className="nav-title">
                账户编辑与安全中心
              </Title>
            </div>

            <div className="elite-form-container">
              {/* 模块 1：个人资料 */}
              <Form
                form={profileForm}
                layout="vertical"
                initialValues={{ username: user?.username }}
              >
                <div className="form-glass-card">
                  <div className="card-header">
                    <UserOutlined /> 基本资料
                  </div>
                  <Form.Item label="管理员账号名称" name="username">
                    <Input size="large" className="elite-input" />
                  </Form.Item>
                  <Form.Item label="重置登录密钥" name="password" style={{ marginBottom: 0 }}>
                    <Input.Password
                      size="large"
                      placeholder="若不修改请留空"
                      className="elite-input"
                    />
                  </Form.Item>
                </div>
              </Form>

              <div className="footer-action-bar">
                <Space size={16}>
                  {/* <Button size="large" onClick={() => setMode('view')}>取消同步</Button> */}
                  <Button
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handleUpdateProfile}
                    className="btn-save"
                  >
                    同步更新档案
                  </Button>
                </Space>
              </div>

              {/* 模块 2：2FA 管理 (不再嵌套 Form 标签) */}
              <div className="form-glass-card">
                <div className="card-header">
                  <KeyOutlined /> 双重认证 (2FA) 管理
                </div>

                {user?.isTwoFactorEnabled ? (
                  <div className="tfa-status-active">
                    {!isDisabling ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Space>
                          <CheckCircleFilled style={{ color: '#52c41a' }} />{' '}
                          <Text strong>2FA 已锁定</Text>
                        </Space>
                        <Button type="link" danger onClick={() => setIsDisabling(true)}>
                          移除保护
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-slide-up">
                        <Text
                          type="secondary"
                          style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem' }}
                        >
                          请键入 App 提供的 6 位安全码以解除：
                        </Text>
                        <Form form={disableForm} component={false}>
                          <Form.Item name="token" required>
                            <DigitInput />
                          </Form.Item>
                          <Space
                            style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
                            size={16}
                          >
                            <Button
                              type="primary"
                              danger
                              loading={loading}
                              onClick={handleDisable2FA}
                            >
                              确认解除
                            </Button>
                            <Button type="text" onClick={() => setIsDisabling(false)}>
                              取消
                            </Button>
                          </Space>
                        </Form>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {!isEnabling ? (
                      <Button
                        type="primary"
                        ghost
                        block
                        onClick={() => {
                          setIsEnabling(true);
                          fetch2FAData();
                        }}
                      >
                        初始化 2FA 绑定流程
                      </Button>
                    ) : (
                      <div className="animate-slide-up">
                        {loading ? (
                          <Spin />
                        ) : (
                          twoFactorData && (
                            <div className="setup-layout">
                              <div className="qr-preview">
                                <img src={twoFactorData.qrCodeDataUrl} alt="qr" />
                              </div>
                              <div style={{ width: '100%' }}>
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: '0.8rem',
                                    display: 'block',
                                    marginBottom: '1rem',
                                    textAlign: 'center',
                                  }}
                                >
                                  扫码后输入验证码激活：
                                </Text>
                                <Form form={enableForm} component={false}>
                                  <Form.Item name="token" required>
                                    <DigitInput />
                                  </Form.Item>
                                  <Space
                                    style={{
                                      width: '100%',
                                      justifyContent: 'center',
                                      marginTop: '1.5rem',
                                    }}
                                    size={16}
                                  >
                                    <Button onClick={() => setIsEnabling(false)}>放弃</Button>
                                    <Button
                                      type="primary"
                                      loading={loading}
                                      onClick={handleEnable2FA}
                                    >
                                      验证并激活
                                    </Button>
                                  </Space>
                                </Form>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SecurityModal;
