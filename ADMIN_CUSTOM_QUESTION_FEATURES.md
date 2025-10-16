# 管理员权限 & 自定义问题功能

## 🔐 管理员权限系统

### 功能说明
实现了基于角色的权限控制系统（RBAC），支持三种角色：
- **user**: 普通用户（默认）
- **vip**: VIP用户
- **admin**: 管理员（最高权限）

### 数据库设计

#### 角色枚举
```sql
CREATE TYPE public.app_role AS ENUM ('user', 'vip', 'admin');
```

#### user_roles 表
```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp,
  updated_at timestamp,
  UNIQUE (user_id, role)
);
```

### 安全函数

#### has_role() - 检查用户角色
```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
```

#### is_admin() - 检查是否为管理员
```sql
CREATE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
```

### 前端集成

#### useUserRole Hook
```typescript
// src/hooks/useUserRole.ts
const { role, isAdmin, isVip } = useUserRole();
```

**返回值：**
- `role`: 当前用户角色
- `isAdmin`: 是否为管理员
- `isVip`: 是否为VIP或管理员
- `loading`: 加载状态
- `refetch`: 刷新角色

#### AdminBadge 组件
```typescript
// src/components/AdminBadge.tsx
<AdminBadge />
```

显示管理员或VIP徽章（普通用户不显示）

### 已授予权限

✅ **ryan599884@gmail.com** 已被授予 **管理员权限**

### 管理员特权

当前管理员可以：
- ✅ 查看所有用户的自定义问题
- ✅ 更新所有用户的自定义问题
- ✅ 在页面显示管理员徽章

### 添加新管理员

```sql
-- 通过邮箱添加管理员
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = '新管理员邮箱@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

或使用后台管理工具：
<lov-actions>
  <lov-open-backend>打开后台管理</lov-open-backend>
</lov-actions>

---

## 💬 自定义问题解答功能

### 功能说明
允许用户根据自己的八字，提出任何命理相关的问题，AI会结合八字信息给出专业建议。

### 数据库设计

#### custom_questions 表
```sql
CREATE TABLE public.custom_questions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  bazi_record_id uuid NOT NULL,
  question text NOT NULL,
  answer text,
  status text DEFAULT 'pending',
  created_at timestamp,
  updated_at timestamp,
  answered_at timestamp
);
```

**字段说明：**
- `question`: 用户提出的问题
- `answer`: AI生成的解答
- `status`: 状态（pending/processing/answered）
- `answered_at`: 解答时间

### 会员权限限制

| 会员等级 | 是否可用 |
|---------|---------|
| Free | ❌ 不可用 |
| Basic | ✅ 可用 |
| Premium | ✅ 可用 |
| VIP | ✅ 可用 |

### 使用流程

1. **完成八字排盘**
2. **滚动到"自定义问题咨询"卡片**
3. **输入问题**（例如：我适合从事什么行业？）
4. **点击"提交问题"**
5. **AI解答**（基于您的八字信息）

### 问题示例

#### 事业类
- "我适合从事什么行业？"
- "今年适合创业吗？"
- "我的职场优势是什么？"

#### 感情类
- "今年感情运势如何？"
- "什么时候容易遇到正缘？"
- "我适合什么性格的伴侣？"

#### 财运类
- "我的财运走向如何？"
- "适合投资理财吗？"
- "何时财运最旺？"

#### 健康类
- "需要注意哪些健康问题？"
- "如何调理身体？"
- "什么季节需要特别注意？"

### AI解答特点

- ✅ **结合八字**：基于您的四柱、格局、用神进行分析
- ✅ **专业准确**：采用传统命理体系
- ✅ **通俗易懂**：避免过多术语，提供实用建议
- ✅ **字数适中**：200-400字精准解答
- ✅ **理性引导**：避免绝对化表述，注重建设性建议

### Edge Function

#### custom-question-answer
**路径**: `supabase/functions/custom-question-answer/index.ts`

**功能**:
1. 接收用户问题和八字数据
2. 构建专业提示词
3. 调用 Lovable AI (gemini-2.5-flash)
4. 保存解答到数据库
5. 记录AI使用次数

**请求参数**:
```typescript
{
  questionId: string,
  question: string,
  baziData: object
}
```

**响应**:
```typescript
{
  success: boolean,
  answer: string
}
```

### 使用次数统计

自定义问题解答会计入AI使用次数：
- 每次提问消耗1次AI解读配额
- 遵循会员等级限制（Basic: 20次/月，Premium: 100次/月，VIP: 无限）
- 使用记录存储在 `ai_usage_records` 表

### RLS 安全策略

```sql
-- 用户只能查看和创建自己的问题
CREATE POLICY "Users can view own questions"
ON custom_questions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own questions"
ON custom_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看和更新所有问题
CREATE POLICY "Admins can view all questions"
ON custom_questions FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all questions"
ON custom_questions FOR UPDATE
USING (public.is_admin(auth.uid()));
```

### 组件实现

#### CustomQuestion 组件
**位置**: `src/components/reading/CustomQuestion.tsx`

**Props**:
```typescript
interface CustomQuestionProps {
  baziRecordId: string;
  baziData: any;
}
```

**功能**:
- ✅ 问题输入框（多行文本）
- ✅ 会员权限检查
- ✅ AI使用次数检查
- ✅ 提交问题到后端
- ✅ 显示AI解答结果
- ✅ 加载状态提示

### 页面集成

**位置**: `src/pages/Bazi.tsx`

自定义问题卡片显示在：
1. 八字排盘结果之后
2. 大运流年图表之后
3. 流年分析之后
4. "重新测算"按钮之前

```typescript
<CustomQuestion
  baziRecordId={recordId}
  baziData={result}
/>
```

### 性能优化

- ✅ 使用索引优化查询
- ✅ 问题状态管理（pending/processing/answered）
- ✅ 错误处理和友好提示
- ✅ 异步处理，不阻塞UI

### 数据库索引

```sql
CREATE INDEX idx_custom_questions_user 
ON custom_questions(user_id, created_at DESC);

CREATE INDEX idx_custom_questions_status 
ON custom_questions(status);

CREATE INDEX idx_custom_questions_bazi 
ON custom_questions(bazi_record_id);
```

---

## 🔒 安全考虑

### RLS 策略
- ✅ 所有表启用 RLS
- ✅ 用户只能访问自己的数据
- ✅ 管理员使用 SECURITY DEFINER 函数验证
- ✅ 防止权限提升攻击

### 输入验证
- ✅ 前端：问题内容非空检查
- ✅ 后端：参数完整性验证
- ✅ 字数限制：问题最长1000字
- ✅ SQL注入防护：使用参数化查询

### API 安全
- ✅ JWT 令牌验证
- ✅ CORS 配置正确
- ✅ 敏感信息不记录到日志
- ✅ 错误信息不泄露内部细节

---

## 📊 监控与调试

### 查看用户角色
```sql
SELECT u.email, ur.role, ur.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
ORDER BY ur.created_at DESC;
```

### 查看自定义问题
```sql
SELECT 
  u.email,
  cq.question,
  cq.status,
  cq.created_at,
  cq.answered_at
FROM custom_questions cq
JOIN auth.users u ON cq.user_id = u.id
ORDER BY cq.created_at DESC
LIMIT 20;
```

### Edge Function 日志
使用后台查看 `custom-question-answer` 函数日志：
<lov-actions>
  <lov-open-backend>查看函数日志</lov-open-backend>
</lov-actions>

---

## ✅ 测试清单

### 管理员权限
- [x] ryan599884@gmail.com 已授予管理员权限
- [x] 管理员徽章正确显示
- [x] 管理员可查看所有问题
- [x] 普通用户无法访问管理功能

### 自定义问题
- [x] 会员权限正确验证
- [x] AI使用次数正确扣除
- [x] 问题提交成功
- [x] AI解答正确返回
- [x] 答案格式美观
- [x] 错误提示友好

### 安全测试
- [x] RLS 策略正确生效
- [x] 无法访问他人问题
- [x] 无法绕过会员限制
- [x] Edge Function 权限验证

---

## 🚀 部署状态

- ✅ 数据库迁移已执行
- ✅ Edge Function 已部署
- ✅ 前端组件已集成
- ✅ 管理员权限已授予
- ✅ 所有功能可用

---

## 📝 后续优化建议

### 短期
- [ ] 添加问题历史记录查看
- [ ] 支持追问功能
- [ ] 添加问题模板

### 中期
- [ ] 管理员后台界面
- [ ] 问题质量评分
- [ ] 高频问题统计

### 长期
- [ ] 多轮对话支持
- [ ] 语音问答
- [ ] 问题分类标签

---

**更新日期**: 2025-01-16
**版本**: v2.1.0
**状态**: ✅ 已完成并上线
