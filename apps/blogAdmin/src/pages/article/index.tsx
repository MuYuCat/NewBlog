import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Pagination,
  Skeleton,
  Tooltip,
  Empty,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { request, history } from '@umijs/max';
import { gsap } from 'gsap';
import dayjs from 'dayjs';
import './article.scss';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ArticleItem {
  id: number;
  title?: string;
  content: string;
  summary?: string;
  status: number;
  clicks: number;
  mood?: string;
  location?: string;
  categories: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
}

const ArticleSpaceHub: React.FC = () => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);

  // 筛选状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      const res = await request('/category');
      setCategories(res.map((item: any) => ({ label: item.name, value: item.id })));
    } catch {
      /* 忽略静默失败 */
    }
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
        search: keyword || undefined,
        categoryIds: categoryIds.length > 0 ? categoryIds.join(',') : undefined,
      };
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      const res = await request('/article', { params });
      setArticles(res.items || []);
      setTotal(res.total || 0);
    } catch {
      message.error('内容空间数据同步失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, categoryIds, dateRange]);

  useEffect(() => {
    fetchCategories();
    gsap.from('.header-top', { opacity: 0, y: -20, duration: 0.8, ease: 'expo.out' });
    gsap.from('.search-ribbon', {
      opacity: 0,
      scale: 0.98,
      delay: 0.2,
      duration: 0.8,
      ease: 'expo.out',
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, pageSize, keyword, categoryIds, dateRange, fetchArticles]);

  const handleDelete = async (id: number) => {
    await request(`/article/${id}`, { method: 'DELETE' });
    message.success('内容镜像已从轨道销毁');
    fetchArticles();
  };

  const handleStatusToggle = async (id: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 2 : 1;
      await request(`/article/${id}`, {
        method: 'PATCH',
        data: { status: newStatus },
      });
      message.success(newStatus === 1 ? '内容已恢复前台展示' : '内容已转为私密隐藏');
      fetchArticles();
    } catch {
      message.error('显示状态同步异常');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await request(`/article/${id}`, {
        method: 'PATCH',
        data: { status: 1 },
      });
      message.success('内容已成功从草稿箱发射');
      fetchArticles();
    } catch {
      message.error('内容发射失败');
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag bordered={false}>草稿</Tag>;
      case 1:
        return (
          <Tag color="success" bordered={false}>
            已发布
          </Tag>
        );
      case 2:
        return (
          <Tag color="error" bordered={false}>
            私密
          </Tag>
        );
      default:
        return null;
    }
  };

  return (
    <div className="article-management-container animate-fade-in">
      <div className="article-header">
        <div className="header-top">
          <div className="title-area">
            <Title level={2}>内容空间枢纽</Title>
            <span>全栈内容资产管理与多维索引</span>
          </div>
          <div className="global-actions">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => history.push('/article/edit')}
              className="elite-launch-btn"
              style={{ borderRadius: '16px', height: '52px', padding: '0 24px' }}
            >
              发射新内容
            </Button>
          </div>
        </div>

        <div className="search-ribbon">
          <Select
            mode="multiple"
            placeholder="多维维度过滤"
            allowClear
            maxTagCount="responsive"
            className="filter-item"
            variant="borderless"
            value={categoryIds}
            onChange={setCategoryIds}
            prefix={<TagOutlined style={{ opacity: 0.4 }} />}
            style={{ width: '240px' }}
          >
            {categories.map((c) => (
              <Option key={c.value} value={c.value}>
                {c.label}
              </Option>
            ))}
          </Select>

          <div className="divider" />

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            className="filter-item date-picker"
            variant="borderless"
            placeholder={['起始时间', '结束时间']}
            style={{ width: '300px' }}
          />

          <div className="divider" />

          <Input
            prefix={<SearchOutlined style={{ opacity: 0.3 }} />}
            placeholder="检索标题或摘要..."
            className="filter-item keyword-input"
            variant="borderless"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ flex: 1 }}
          />

          <div className="divider" />
          <Tooltip title="刷新索引">
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={fetchArticles}
              className="action-btn"
            />
          </Tooltip>
        </div>
      </div>

      <div className="articles-main-content">
        <div className="table-header-row">
          <span>ID</span>
          <span>核心内容摘要 (含简介)</span>
          <span>关联维度</span>
          <span>状态</span>
          <span>更新时间</span>
          <span style={{ textAlign: 'right' }}>管理</span>
        </div>

        <div className="table-body">
          {loading ? (
            Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="article-row skeleton-row">
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                </div>
              ))
          ) : articles.length > 0 ? (
            articles.map((item) => {
              const dt = dayjs(item.updatedAt);
              return (
                <div key={item.id} className={`article-row status-${item.status}`}>
                  <div className="type-col">
                    <div className="sub-id">ID: {item.id}</div>
                  </div>

                  <div
                    className="content-col"
                    onClick={() => history.push(`/article/edit/${item.id}`)}
                  >
                    <div className="main-text">
                      {item.title || item.content.replace(/<[^>]+>/g, '').substring(0, 50)}
                    </div>
                    <div className="sub-text">{item.summary || '暂无简介描述'}</div>
                  </div>

                  <div className="dim-col">
                    <Space size={4} wrap>
                      {item.categories && item.categories.length > 0 ? (
                        item.categories.map((cat) => (
                          <Tag key={cat.id} bordered={false} color="blue">
                            {cat.name}
                          </Tag>
                        ))
                      ) : (
                        <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>未归类</span>
                      )}
                    </Space>
                  </div>

                  <div className="status-col">{getStatusTag(item.status)}</div>

                  <div className="time-group">
                    <span className="t-time">{dt.format('HH:mm:ss')}</span>
                    <span className="t-date">{dt.format('YYYY-MM-DD')}</span>
                  </div>

                  <div className="item-actions">
                    {item.status === 0 && (
                      <Tooltip title="一键发布">
                        <Button
                          type="text"
                          shape="circle"
                          icon={<RocketOutlined />}
                          onClick={() => handlePublish(item.id)}
                          style={{ color: '#1890ff' }}
                        />
                      </Tooltip>
                    )}
                    {item.status !== 0 && (
                      <Tooltip title={item.status === 1 ? '点击转为私密' : '点击恢复展示'}>
                        <Button
                          type="text"
                          shape="circle"
                          icon={item.status === 1 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          onClick={() => handleStatusToggle(item.id, item.status)}
                          style={{ color: item.status === 1 ? 'inherit' : '#faad14' }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="重构内容">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() => history.push(`/article/edit/${item.id}`)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="确定销毁此内容镜像？"
                      onConfirm={() => handleDelete(item.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button type="text" shape="circle" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '100px 0' }}>
              <Empty description="当前轨道暂无内容捕获" />
            </div>
          )}
        </div>

        <div className="pagination-footer">
          <span className="total-text">共捕获 {total} 条数据记录</span>
          <Pagination
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={(p, s) => {
              setPage(p);
              setPageSize(s);
            }}
            showSizeChanger
            pageSizeOptions={['20', '50', '100']}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleSpaceHub;
