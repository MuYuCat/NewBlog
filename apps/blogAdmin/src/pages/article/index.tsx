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
  SyncOutlined,
  TagOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { request } from '@umijs/max';
import { gsap } from 'gsap';
import dayjs from 'dayjs';
import './article.scss';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ArticleItem {
  id: number;
  type: string;
  title?: string;
  content: string;
  slug: string;
  status: number;
  clicks: number;
  mood?: string;
  location?: string;
  category?: { name: string };
  createdAt: string;
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
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
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
        categoryId,
      };
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      const res = await request('/article', { params });
      setArticles(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      message.error('内容空间数据同步失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, categoryId, dateRange]);

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
  }, [page, pageSize, keyword, categoryId, dateRange, fetchArticles]);

  const handleDelete = async (id: number) => {
    await request(`/article/${id}`, { method: 'DELETE' });
    message.success('内容镜像已从轨道销毁');
    fetchArticles();
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
              onClick={() => message.info('编辑器正在部署...')}
              className="elite-launch-btn"
              style={{ borderRadius: '16px', height: '52px', padding: '0 24px' }}
            >
              发射新内容
            </Button>
          </div>
        </div>

        <div className="search-ribbon">
          <Select
            placeholder="维度过滤"
            allowClear
            className="filter-item"
            variant="borderless"
            value={categoryId}
            onChange={setCategoryId}
            prefix={<TagOutlined style={{ opacity: 0.4 }} />}
            style={{ width: '180px' }}
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
          <span>类型 / ID</span>
          <span>核心内容摘要</span>
          <span>关联维度</span>
          <span>状态</span>
          <span>发布时间</span>
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
              const dt = dayjs(item.createdAt);
              return (
                <div key={item.id} className={`article-row type-${item.type}`}>
                  <div className="type-col">
                    <div className="type-tag">{item.type}</div>
                    <div className="sub-id">ID: {item.id}</div>
                  </div>

                  <div className="content-col">
                    <div className="main-text">
                      {item.type === 'KNOWLEDGE'
                        ? item.title
                        : item.content.replace(/<[^>]+>/g, '')}
                    </div>
                    <div className="sub-text">
                      {item.type === 'KNOWLEDGE'
                        ? `slug: ${item.slug}`
                        : `mood: ${item.mood || 'normal'}`}
                    </div>
                  </div>

                  <div className="dim-col">
                    <Tag bordered={false} color="blue">
                      {item.category?.name || '未定义'}
                    </Tag>
                  </div>

                  <div className="status-col">{getStatusTag(item.status)}</div>

                  <div className="time-group">
                    <span className="t-time">{dt.format('HH:mm:ss')}</span>
                    <span className="t-date">{dt.format('YYYY-MM-DD')}</span>
                  </div>

                  <div className="item-actions">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => message.info('正在对接编辑器...')}
                    />
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
