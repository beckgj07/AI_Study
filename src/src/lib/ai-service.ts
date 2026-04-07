// AI Model Service - Supports multiple AI providers

export interface AiModelConfig {
  name: string;
  provider: 'openai' | 'zhipu' | 'qwen' | 'kimi' | 'hunyuan' | 'minimax';
  apiUrl: string;
  apiKey: string;
}

export interface QuestionRequest {
  subject: string;
  grade: number;
  chapter: string;
  difficulty: 1 | 2 | 3 | 4; // 1:基础 2:应用 3:综合 4:拓展
  count: number;
  type: 'choice' | 'multiple' | 'fill' | 'essay';
}

export interface Question {
  type: 'choice' | 'multiple' | 'fill' | 'essay';
  difficulty: number;
  content: string;
  options?: string[];
  answer: string;
  explanation?: string;
  knowledgePoint?: string;
}

export interface ExplainRequest {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
}

// System prompt templates
const QUESTION_GENERATION_PROMPT = `你是一个专业的小学数学老师，擅长根据教材内容和学生水平生成合适的练习题。
请根据以下信息生成题目：

科目：{subject}
年级：{grade}年级
章节：{chapter}
难度：{difficulty}
题目数量：{count}
题目类型：{type}

要求：
1. 题目应该符合小学生的认知水平
2. 难度{ difficultyText }
3. 如果是选择题，必须提供4个选项
4. 返回JSON格式的题目数组
5. 不要包含任何不适当的内容

返回格式：
{
  "questions": [
    {
      "type": "choice/multiple/fill/essay",
      "difficulty": 1-4,
      "content": "题目内容",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"], // 选择题必填
      "answer": "正确答案",
      "explanation": "解题思路",
      "knowledgePoint": "知识点"
    }
  ]
}`;

const EXPLANATION_PROMPT = `你是一个耐心的小学数学老师。学生刚刚回答了一道题目，需要你的帮助。

题目信息：
{questionInfo}

学生的答案：{userAnswer}
答题是否正确：{isCorrect}

请为学生提供：
1. 温和鼓励的话语
2. 正确答案的分析（如果答错了）
3. 解题思路和关键步骤
4. 相关的知识点提醒

语气要亲切友善，像朋友一样帮助学生学习。`;

const DIFFICULTY_TEXT: Record<number, string> = {
  1: '基础（直接套用公式）',
  2: '应用（需要简单分析）',
  3: '综合（需要多步推理）',
  4: '拓展（奥赛水平）',
};

export class AiService {
  private config: AiModelConfig;

  constructor(config: AiModelConfig) {
    this.config = config;
  }

  async generateQuestions(request: QuestionRequest): Promise<Question[]> {
    const prompt = QUESTION_GENERATION_PROMPT
      .replace('{subject}', request.subject)
      .replace('{grade}', request.grade.toString())
      .replace('{chapter}', request.chapter)
      .replace('{difficulty}', request.difficulty.toString())
      .replace('{difficultyText}', DIFFICULTY_TEXT[request.difficulty])
      .replace('{count}', request.count.toString())
      .replace('{type}', request.type);

    const response = await this.callApi(prompt);
    return this.parseQuestionsResponse(response);
  }

  async explainQuestion(request: ExplainRequest): Promise<string> {
    const questionInfo = `${request.question.content}${
      request.question.options
        ? '\n选项：' + request.question.options.join('\n')
        : ''
    }`;

    const prompt = EXPLANATION_PROMPT
      .replace('{questionInfo}', questionInfo)
      .replace('{userAnswer}', request.userAnswer)
      .replace('{isCorrect}', request.isCorrect ? '正确' : '错误');

    return this.callApi(prompt);
  }

  private async callApi(prompt: string): Promise<string> {
    const { apiUrl, apiKey, provider } = this.config;

    // Different API formats for different providers
    if (provider === 'zhipu') {
      return this.callZhipu(apiUrl, apiKey, prompt);
    } else if (provider === 'qwen') {
      return this.callQwen(apiUrl, apiKey, prompt);
    } else if (provider === 'kimi') {
      return this.callKimi(apiUrl, apiKey, prompt);
    } else {
      // Default to OpenAI-compatible format
      return this.callOpenAICompatible(apiUrl, apiKey, prompt);
    }
  }

  private async callZhipu(apiUrl: string, apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callQwen(apiUrl: string, apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callKimi(apiUrl: string, apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callOpenAICompatible(
    apiUrl: string,
    apiKey: string,
    prompt: string
  ): Promise<string> {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private parseQuestionsResponse(response: string): Question[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.questions || [];
      }
      return [];
    } catch {
      console.error('Failed to parse questions response');
      return [];
    }
  }
}

// Default AI service instance (will be configured by user)
let aiServiceInstance: AiService | null = null;

export function initAiService(config: AiModelConfig): void {
  aiServiceInstance = new AiService(config);
}

export function getAiService(): AiService {
  if (!aiServiceInstance) {
    // Use a placeholder config - should be replaced with actual config
    aiServiceInstance = new AiService({
      name: 'GLM',
      provider: 'zhipu',
      apiUrl: process.env.AI_API_URL || '',
      apiKey: process.env.AI_API_KEY || '',
    });
  }
  return aiServiceInstance;
}
