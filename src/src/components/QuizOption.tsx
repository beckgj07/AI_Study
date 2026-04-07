'use client';

import { useState } from 'react';

interface QuizOptionProps {
  label: string;
  value: string;
  options: { key: string; text: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QuizOption({ label, value, options, onChange, disabled = false }: QuizOptionProps) {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleSelect = (optValue: string) => {
    if (disabled) return;
    setSelectedValue(optValue);
    onChange(optValue);
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-base font-medium text-gray-700">{label}</label>}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleSelect(opt.key)}
            disabled={disabled}
            className={`
              p-4 rounded-xl border-2 text-left font-medium transition-all duration-200
              ${
                selectedValue === opt.key
                  ? 'border-orange-400 bg-orange-50 shadow-[4px_4px_8px_rgba(249,115,22,0.15)]'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }
              ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
            `}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold mr-3">
              {opt.key}
            </span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

interface QuizChoiceProps {
  content: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex?: number;
  showResult?: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function QuizChoice({
  content,
  options,
  selectedIndex,
  correctIndex,
  showResult = false,
  onSelect,
  disabled = false,
}: QuizChoiceProps) {
  const getOptionClass = (index: number) => {
    const baseClass = 'p-4 rounded-xl border-2 text-left font-medium transition-all duration-200';

    if (showResult && correctIndex !== undefined) {
      if (index === correctIndex) {
        return `${baseClass} border-green-500 bg-green-50 text-green-700`;
      }
      if (index === selectedIndex && index !== correctIndex) {
        return `${baseClass} border-red-500 bg-red-50 text-red-700`;
      }
    }

    if (index === selectedIndex) {
      return `${baseClass} border-orange-400 bg-orange-50 shadow-[4px_4px_8px_rgba(249,115,22,0.15)]`;
    }

    return `${baseClass} border-gray-200 bg-white hover:border-blue-300`;
  };

  return (
    <div className="space-y-4">
      <div className="clay-card text-center py-6">
        <p className="text-xl font-semibold text-gray-800">{content}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, index) => (
          <button
            key={index}
            type="button"
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            className={getOptionClass(index)}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

interface QuizFillProps {
  content: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QuizFill({ content, placeholder = '请输入答案', value, onChange, disabled = false }: QuizFillProps) {
  return (
    <div className="space-y-4">
      <div className="clay-card text-center py-6">
        <p className="text-xl font-semibold text-gray-800">{content}</p>
      </div>
      <div className="clay-inset">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent text-lg outline-none text-center"
        />
      </div>
    </div>
  );
}
