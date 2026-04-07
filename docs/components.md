# AI_Study 组件库文档

## 概述

组件库采用 Claymorphism（软陶风格）设计语言，具有柔和阴影、3D凸起/凹陷效果。

## 基础组件

### ClayCard

卡片组件，支持三种变体。

```tsx
import { ClayCard } from '@/components/ClayCard';

<ClayCard>默认凸起卡片</ClayCard>
<ClayCard variant="raised">凸起效果</ClayCard>
<ClayCard variant="inset">凹陷效果</ClayCard>
<ClayCard variant="flat">扁平效果</ClayCard>
```

**属性：**
- `variant`: 'raised' | 'inset' | 'flat'（默认 'raised'）
- `className`: 自定义类名
- `onClick`: 点击事件（设置后会显示手型光标）

---

### ClayButton

按钮组件，支持多种变体和尺寸。

```tsx
import { ClayButton } from '@/components/ClayCard';

<ClayButton>主要按钮</ClayButton>
<ClayButton variant="secondary">次要按钮</ClayButton>
<ClayButton variant="ghost">幽灵按钮</ClayButton>
```

**属性：**
- `variant`: 'primary' | 'secondary' | 'ghost'（默认 'primary'）
- `size`: 'sm' | 'md' | 'lg'（默认 'md'）
- `disabled`: 是否禁用
- `className`: 自定义类名
- `onClick`: 点击事件
- `type`: 'button' | 'submit' | 'reset'

---

### ClayInput

输入框组件。

```tsx
import { ClayInput } from '@/components/ClayCard';

<ClayInput placeholder="请输入内容" />
<ClayInput type="password" placeholder="密码" />
```

**属性：**
- `type`: input 类型（默认 'text'）
- `placeholder`: 占位文本
- `value`: 值
- `onChange`: 变更事件
- `disabled`: 是否禁用
- `className`: 自定义类名

---

### Badge

徽章组件。

```tsx
import { Badge } from '@/components/ClayCard';

<Badge variant="primary">主要</Badge>
<Badge variant="success">成功</Badge>
<Badge variant="error">错误</Badge>
<Badge variant="accent">强调</Badge>
<Badge variant="muted">灰色</Badge>
```

**属性：**
- `variant`: 'primary' | 'success' | 'error' | 'accent' | 'muted'
- `className`: 自定义类名

---

### ProgressBar

进度条组件。

```tsx
import { ProgressBar } from '@/components/ClayCard';

<ProgressBar value={70} max={100} />
<ProgressBar value={70} max={100} showLabel />
```

**属性：**
- `value`: 当前值
- `max`: 最大值（默认 100）
- `showLabel`: 是否显示标签
- `className`: 自定义类名

---

### Avatar

头像组件。

```tsx
import { Avatar } from '@/components/ClayCard';

<Avatar name="小明" />
<Avatar name="小红" size="sm" />
<Avatar name="小华" size="lg" />
```

**属性：**
- `name`: 显示名称（取首字）
- `size`: 'sm' | 'md' | 'lg'（默认 'md'）
- `className`: 自定义类名

---

## 题目组件

### QuizChoice

选择题组件。

```tsx
import { QuizChoice } from '@/components/QuizOption';

<QuizChoice
  content="25 × 17 = ?"
  options={['325', '425', '525', '625']}
  selectedIndex={1}
  correctIndex={1}
  showResult={true}
  onSelect={(index) => handleSelect(index)}
/>
```

**属性：**
- `content`: 题目内容
- `options`: 选项数组
- `selectedIndex`: 已选索引
- `correctIndex`: 正确答案索引（显示结果时使用）
- `showResult`: 是否显示结果
- `onSelect`: 选择回调
- `disabled`: 是否禁用

---

### QuizFill

填空题组件。

```tsx
import { QuizFill } from '@/components/QuizOption';

<QuizFill
  content="25 + 17 = ?"
  value={answer}
  onChange={(val) => setAnswer(val)}
/>
```

**属性：**
- `content`: 题目内容
- `value`: 输入值
- `onChange`: 变更回调
- `placeholder`: 占位文本
- `disabled`: 是否禁用

---

## 布局组件

### Sidebar

桌面端侧边栏导航。

```tsx
import { Sidebar } from '@/components/Layout';

<Sidebar>
  {children}
</Sidebar>
```

包含：
- Logo
- 用户信息卡片
- 导航菜单（高亮当前页）
- 统计信息（连续天数、积分、正确率）

---

### MobileNav

移动端导航。

```tsx
import { MobileNav } from '@/components/Layout';

<MobileNav>
  {children}
</MobileNav>
```

包含：
- 顶部导航栏（Logo、连续天数、头像）
- 底部标签导航（首页、地图、闯关、错题、设置）

---

### PageHeader

页面标题组件。

```tsx
import { PageHeader } from '@/components/Layout';

<PageHeader
  title="页面标题"
  subtitle="副标题说明"
  action={<Button>操作按钮</Button>}
/>
```

**属性：**
- `title`: 主标题
- `subtitle`: 副标题
- `action`: 右侧操作区

---

## 设计规范

### 颜色

| 用途 | 颜色代码 | CSS 变量 |
|------|----------|----------|
| 主色 | #2563EB | --primary |
| 辅色 | #3B82F6 | --primary-light |
| 强调色 | #F97316 | --accent |
| 成功色 | #22C55E | --success |
| 错误色 | #EF4444 | --error |
| 背景色 | #F8FAFC | --background |
| 文字色 | #1E293B | --text-primary |

### 圆角

| 元素 | 圆角 |
|------|------|
| 大卡片 | 32px (--radius-lg) |
| 小卡片/按钮 | 20px (--radius-md) |
| 输入框 | 12px (--radius-sm) |

### 阴影

```css
/* 凸起效果 */
box-shadow: 8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8);

/* 小阴影 */
box-shadow: 4px 4px 8px rgba(0,0,0,0.08), -4px -4px 8px rgba(255,255,255,0.7);

/* 凹陷效果 */
box-shadow: inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8);
```

### 字体

- 中文字体：STKaiti / Noto Sans SC
- 英文/数字字体：Nunito
- 基础字号：18px（移动端 16px）
