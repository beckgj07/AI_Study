'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface UploadedFile {
  id: string;
  name: string;
  subject: string;
  grade: number;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  uploadedAt: string;
}

const mockFiles: UploadedFile[] = [
  { id: '1', name: '三年级数学上册.pdf', subject: '数学', grade: 3, status: 'completed', progress: 100, uploadedAt: '2024-03-20' },
  { id: '2', name: '语文教材第三单元.docx', subject: '语文', grade: 3, status: 'completed', progress: 100, uploadedAt: '2024-03-19' },
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>(mockFiles);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Handle file upload
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const handleFileUpload = (newFiles: File[]) => {
    setUploading(true);
    // Simulate upload
    const uploadedFiles: UploadedFile[] = newFiles.map((f) => ({
      id: Date.now().toString() + Math.random(),
      name: f.name,
      subject: '数学',
      grade: 3,
      status: 'processing',
      progress: 0,
      uploadedAt: new Date().toISOString().split('T')[0],
    }));

    setFiles([...uploadedFiles, ...files]);

    // Simulate progress
    uploadedFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: 100, status: 'completed' as const } : f
            )
          );
          setUploading(false);
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress } : f
            )
          );
        }
      }, 500);
    });
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">教材上传</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-sm text-blue-500 hover:text-blue-700">返回首页</Link>
              <Badge variant="accent">{files.length} 个文件</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="上传学习资料" subtitle="支持PDF、Word文档，AI将自动分析并生成练习题" />

        {/* Upload Area */}
        <div
          className={`mb-6 p-8 bg-white rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] border-2 border-dashed transition-all ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📤</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">拖拽文件到此处</h3>
            <p className="text-gray-500 mb-4">或者</p>
            <label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
              <span className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold rounded-[20px] shadow-[4px_4px_8px_rgba(37,99,235,0.3)] cursor-pointer">
                选择文件
              </span>
            </label>
            <p className="text-sm text-gray-400 mt-4">
              支持 PDF、Word 文档，单个文件不超过 20MB
            </p>
          </div>
        </div>

        {/* Supported Formats */}
        <ClayCard className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
          <div className="flex items-start gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">上传说明</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 上传教材PDF或Word文档，AI将自动分析内容</li>
                <li>• 根据教材内容生成针对性练习题</li>
                <li>• 支持人教版、北师大版、苏教版等多种教材</li>
                <li>• 上传后可在"我的教材"中查看和管理</li>
              </ul>
            </div>
          </div>
        </ClayCard>

        {/* File List */}
        <ClayCard>
          <h3 className="font-bold text-gray-800 mb-4">已上传文件</h3>

          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📁</div>
              <p>还没有上传任何文件</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="clay-inset p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">📄</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.subject} · {file.grade}年级 · {file.uploadedAt}
                      </p>
                      {file.status === 'processing' && (
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">处理中... {file.progress}%</p>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <p className="text-sm text-green-500 mt-1">✓ 处理完成</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <Badge variant="success">已完成</Badge>
                      )}
                      {file.status === 'processing' && (
                        <Badge variant="primary">处理中</Badge>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ClayCard>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Link href="/question-bank">
            <ClayCard className="cursor-pointer hover:bg-gray-50 transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📚</div>
                <div>
                  <h4 className="font-bold text-gray-800">查看题库</h4>
                  <p className="text-sm text-gray-500">管理已生成的题目</p>
                </div>
              </div>
            </ClayCard>
          </Link>

          <ClayCard className="cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🔄</div>
              <div>
                <h4 className="font-bold text-gray-800">重新分析</h4>
                <p className="text-sm text-gray-500">重新处理已有文件</p>
              </div>
            </div>
          </ClayCard>
        </div>
      </main>
    </div>
  );
}
