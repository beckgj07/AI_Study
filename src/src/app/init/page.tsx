'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClayCard, ClayButton, ClayInput, Badge } from '@/components/ClayCard';

interface Subject {
  id: string;
  name: string;
  icon: string;
  isPreset: boolean;
  isRequired: boolean;
}

interface TextbookVersion {
  id: string;
  name: string;
  publisher?: string;
}

const PRESET_SUBJECTS = [
  { id: 'math', name: '数学', icon: '📐', isPreset: true, isRequired: true },
  { id: 'chinese', name: '语文', icon: '📖', isPreset: true, isRequired: true },
  { id: 'english', name: '英语', icon: '🔤', isPreset: true, isRequired: true },
];

const TEXTBOOK_VERSIONS: Record<string, TextbookVersion[]> = {
  math: [
    { id: 'pep', name: '人教版' },
    { id: 'bsd', name: '北师大版' },
    { id: 'sj', name: '苏教版' },
    { id: 'hs', name: '沪教版' },
  ],
  chinese: [
    { id: 'pep', name: '人教版' },
    { id: 'bsd', name: '北师大版' },
    { id: 'bb', name: '部编版' },
    { id: 'sj', name: '苏教版' },
  ],
  english: [
    { id: 'pep', name: '人教版(PEP)' },
    { id: 'wys', name: '外研社版' },
    { id: 'bsd', name: '北师大版' },
    { id: 'hs', name: '沪教版' },
  ],
};

export default function InitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState<number | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['math', 'chinese', 'english']);
  const [textbookVersions, setTextbookVersions] = useState<Record<string, string>>({});
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user from session (in a real app)
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleGradeSelect = (g: number) => {
    setGrade(g);
    setStep(2);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((s) => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleTextbookSelect = (subjectId: string, versionId: string) => {
    setTextbookVersions((prev) => ({ ...prev, [subjectId]: versionId }));
  };

  const handleAddCustomSubject = () => {
    if (!customSubjectName.trim()) return;
    const newId = `custom_${Date.now()}`;
    setSelectedSubjects((prev) => [...prev, newId]);
    setCustomSubjectName('');
  };

  const handleComplete = async () => {
    if (!userId || !grade) return;

    try {
      // Bind subjects to user
      for (const subjectId of selectedSubjects) {
        const isCustom = subjectId.startsWith('custom_');
        await fetch('/api/user-subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subjectId: isCustom ? subjectId : subjectId,
            grade,
            textbookVersionId: textbookVersions[subjectId] || null,
          }),
        });
      }

      // Update user grade
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return grade !== null;
      case 2:
        return selectedSubjects.length > 0;
      case 3:
        return selectedSubjects.every((s) => textbookVersions[s] || s.startsWith('custom_'));
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s <= step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 mx-2 rounded ${
                    s < step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <ClayCard>
          {/* Step 1: Select Grade */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <span className="text-4xl mb-4 block">🎓</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">选择年级</h2>
                <p className="text-gray-500">你正在上几年级？</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGradeSelect(g)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      grade === g
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'clay-inset hover:bg-gray-50'
                    }`}
                  >
                    {g}年级
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>小学1-6年级可选</p>
              </div>
            </>
          )}

          {/* Step 2: Select Subjects */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <span className="text-4xl mb-4 block">📚</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">选择科目</h2>
                <p className="text-gray-500">你想学习哪些科目？</p>
              </div>

              {/* Preset Subjects */}
              <div className="space-y-3 mb-6">
                {PRESET_SUBJECTS.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectToggle(subject.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      selectedSubjects.includes(subject.id)
                        ? 'bg-blue-50 border-2 border-blue-400'
                        : 'clay-inset'
                    }`}
                  >
                    <span className="text-2xl">{subject.icon}</span>
                    <span className="font-medium text-gray-800">{subject.name}</span>
                    {subject.isRequired && (
                      <Badge variant="primary" className="ml-auto">必选</Badge>
                    )}
                    {selectedSubjects.includes(subject.id) && (
                      <span className="text-blue-500 ml-auto text-xl">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Subjects */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-3">添加自定义科目</p>
                <div className="flex gap-2">
                  <ClayInput
                    placeholder="如：科学、编程"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                  />
                  <ClayButton onClick={handleAddCustomSubject}>+</ClayButton>
                </div>

                {selectedSubjects.filter((s) => s.startsWith('custom_')).map((s, i) => (
                  <div
                    key={s}
                    className="mt-2 flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                  >
                    <span className="text-xl">✨</span>
                    <span className="text-gray-700">自定义科目 {i + 1}</span>
                    <button
                      onClick={() => handleSubjectToggle(s)}
                      className="ml-auto text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Select Textbook Versions */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <span className="text-4xl mb-4 block">📖</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">选择教材版本</h2>
                <p className="text-gray-500">为每个科目选择教材版本</p>
              </div>

              <div className="space-y-4">
                {selectedSubjects.map((subjectId) => {
                  const subject = PRESET_SUBJECTS.find((s) => s.id === subjectId);
                  const versions = TEXTBOOK_VERSIONS[subjectId] || [];
                  const isCustom = subjectId.startsWith('custom_');

                  return (
                    <div key={subjectId} className="clay-inset">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{subject?.icon || '✨'}</span>
                        <span className="font-medium text-gray-800">
                          {subject?.name || '自定义科目'}
                        </span>
                      </div>

                      {isCustom ? (
                        <p className="text-sm text-gray-500">无需选择版本</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {versions.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => handleTextbookSelect(subjectId, v.id)}
                              className={`p-2 rounded-lg text-sm transition-all ${
                                textbookVersions[subjectId] === v.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <ClayButton variant="secondary" className="flex-1" onClick={() => setStep(step - 1)}>
                上一步
              </ClayButton>
            )}
            {step < 3 ? (
              <ClayButton className="flex-1" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                下一步
              </ClayButton>
            ) : (
              <ClayButton className="flex-1" onClick={handleComplete} disabled={!canProceed()}>
                完成设置
              </ClayButton>
            )}
          </div>
        </ClayCard>
      </div>
    </div>
  );
}
