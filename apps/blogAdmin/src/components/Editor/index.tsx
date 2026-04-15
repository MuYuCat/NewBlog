import React from 'react';
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import breaks from '@bytemd/plugin-breaks';
import * as mammoth from 'mammoth';
import TurndownService from 'turndown';
import { FileWordOutlined } from '@ant-design/icons';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import './index.scss';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// 初始化 Turndown 转换器
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

const UniversalEditor: React.FC<Props> = ({ value, onChange }) => {
  // 核心转换逻辑：Docx ArrayBuffer -> Markdown
  const convertDocxToMarkdown = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value; // 转换后的 HTML
      return turndownService.turndown(html);
    } catch (error) {
      console.error('Word 协议解析失败:', error);
      throw error;
    }
  };

  // 自定义 Word 导入插件
  const wordImportPlugin = () => {
    return {
      toolbarItems: [
        {
          tooltip: '导入 Word (.docx)',
          icon: '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M854.6 288.7L639.4 73.5c-4.3-4.3-10.1-6.7-16.3-6.7H280c-35.3 0-64 28.7-64 64v785.4c0 35.3 28.7 64 64 64h464c35.3 0 64-28.7 64-64V305c0-6.2-2.4-12-6.7-16.3zM640 144.1l141.2 141.2H640V144.1zM744 862.7H280V130.7h296v188.7c0 17.7 14.3 32 32 32h188.7v511.3h-52.7z"></path><path d="M384 480.7h256v64H384zM384 608.7h256v64H384zM384 736.7h128v64H384z"></path></svg>',
          onClick() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.docx';
            input.onchange = async (e: any) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const buffer = event.target?.result as ArrayBuffer;
                  const markdown = await convertDocxToMarkdown(buffer);
                  onChange(value ? `${value}\n\n${markdown}` : markdown);
                };
                reader.readAsArrayBuffer(file);
              }
            };
            input.click();
          },
        },
      ],
    };
  };

  const plugins = [gfm(), highlight(), breaks(), wordImportPlugin()];

  // 拦截 Word 粘贴并转换
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (
        items[i].type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = async (event) => {
            const buffer = event.target?.result as ArrayBuffer;
            const markdown = await convertDocxToMarkdown(buffer);
            onChange(value ? `${value}\n\n${markdown}` : markdown);
          };
          reader.readAsArrayBuffer(file);
        }
      }
    }
  };

  return (
    <div className="universal-editor-wrapper" onPaste={handlePaste}>
      <Editor
        value={value}
        plugins={plugins}
        onChange={onChange}
        placeholder="在此注入您的意识碎片或深度协议..."
        locale={
          {
            write: '编辑',
            preview: '预览',
            help: '帮助',
            toc: '目录',
          } as any
        }
      />
    </div>
  );
};

export default UniversalEditor;
