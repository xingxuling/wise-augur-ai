# 通胜AI三大新功能开发文档

## 概述
本文档记录通胜AI项目新增的三大核心功能：八字数据可视化工具、命理学习轻课程模块、个性化解读定制与分享优化。

---

## 功能一：八字数据可视化工具

### 1. 功能目标
将抽象的八字数据转化为直观、可交互的图表，帮助用户更好地理解自己的八字信息。

### 2. 核心组件

#### 2.1 五行分布环形图 (WuxingPieChart)
**文件位置：** `src/components/visualization/WuxingPieChart.tsx`

**功能特性：**
- 展示金、木、水、火、土五行在八字中的占比
- 标注每个五行的状态（旺/相/休/囚/死）
- 点击五行区块，弹出该五行对职场、健康等方面的影响解读
- 响应式设计，适配移动端和PC端

**技术实现：**
- 使用 Recharts 的 PieChart 组件
- 基于八字干支自动计算五行分布
- 自定义Tooltip展示详细信息
- 颜色方案与五行属性对应

#### 2.2 十神关系雷达图 (ShishenRadarChart)
**文件位置：** `src/components/visualization/ShishenRadarChart.tsx`

**功能特性：**
- 展示十神（比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印）强度评分
- 鼠标悬停显示每个十神的白话定义和应用场景
- 强度范围1-10分，直观反映十神影响力

**技术实现：**
- 使用 Recharts 的 RadarChart 组件
- 根据天干关系计算十神强度
- 自定义Tooltip展示十神含义
- 使用极坐标网格展示

#### 2.3 八字干支矩阵图 (BaziMatrixChart)
**文件位置：** `src/components/visualization/BaziMatrixChart.tsx`

**功能特性：**
- 以矩阵形式展示年、月、日、时四柱的天干地支
- 点击任意干支，显示其五行属性和生克关系
- 特殊格局用彩色边框突出显示
- 提供每一柱的人生阶段含义

**技术实现：**
- 使用HTML表格布局
- 根据五行属性动态设置背景色
- Dialog弹窗展示详细信息
- 计算天干地支之间的生克关系

### 3. 集成方式

在 `src/pages/Bazi.tsx` 中新增"数据可视化"按钮：
```tsx
<Button
  variant={showVisualization ? "default" : "outline"}
  onClick={() => setShowVisualization(!showVisualization)}
>
  <BarChart3 className="w-4 h-4 mr-2" />
  数据可视化
</Button>
```

### 4. 会员权限差异
- **基础版：** 可查看五行环形图 + 干支矩阵图（不可下载）
- **进阶版及以上：** 解锁十神雷达图 + 图表下载功能（带水印）

---

## 功能二：命理学习轻课程模块

### 1. 功能目标
提供系统化的命理学习内容，帮助用户从零基础到能简单断盘。

### 2. 数据库结构

#### 2.1 课程表 (learning_courses)
存储课程基本信息：
- `title`: 课程标题
- `description`: 课程描述
- `level`: 课程级别（beginner/advanced）
- `order_index`: 排序索引
- `is_published`: 是否发布

#### 2.2 课节表 (learning_lessons)
存储课节内容：
- `course_id`: 所属课程ID
- `title`: 课节标题
- `content`: 课节内容
- `media_type`: 媒体类型（audio/video/text）
- `duration_minutes`: 时长
- `classic_text_refs`: 关联的经典典籍
- `case_refs`: 关联的案例

#### 2.3 测试题表 (lesson_quizzes)
存储课后测试：
- `lesson_id`: 所属课节ID
- `question`: 问题
- `options`: 选项（JSONB）
- `correct_answer`: 正确答案
- `explanation`: 答案解释

#### 2.4 学习进度表 (user_learning_progress)
记录用户学习进度：
- `user_id`: 用户ID
- `lesson_id`: 课节ID
- `completed`: 是否完成
- `last_position`: 最后学习位置
- `completed_at`: 完成时间

### 3. 核心组件

#### 3.1 课程列表 (LearningCourses)
**文件位置：** `src/components/learning/LearningCourses.tsx`

**功能特性：**
- 展示所有已发布课程
- 显示学习进度条
- 课节锁定机制（根据会员等级）
- 断点续学功能

**权限控制：**
- 基础版：前3节入门课免费
- 进阶版：全部入门课 + 前3节进阶课
- 尊享版：全部课程 + 1对1答疑

### 4. 页面路由
- `/learning` - 学习中心主页
- `/learning/lesson/:lessonId` - 课节详情页（待实现）

### 5. 初始课程内容

**入门课程（5节）：**
1. 五行基础：怎么看自己缺什么
2. 十神白话：正财≠偏财
3. 八字排盘入门：年月日时柱怎么来
4. 特殊格局入门：专旺格是什么
5. 流年基础：怎么看今年运势

**进阶课程（待扩充）：**
- 五行旺衰判断
- 十神互动关系
- 简单断盘技巧

---

## 功能三：个性化解读定制与分享优化

### 1. 功能目标
支持用户按场景定制解读，并通过邀请码分享机制实现拉新转化。

### 2. 定制解读功能

#### 2.1 场景选择 (CustomReadingScenes)
**文件位置：** `src/components/reading/CustomReadingScenes.tsx`

**支持场景：**
1. **职场发展** - 考公考编 / 跳槽转行 / 晋升加薪
2. **感情婚姻** - 脱单桃花 / 挽回复合 / 备孕生育
3. **财运财富** - 副业开拓 / 投资理财 / 储蓄规划
4. **健康养生** - 睡眠调理 / 肠胃养护 / 颈椎保养
5. **学业深造** - 考研升学 / 考编上岸 / 留学规划

**功能流程：**
1. 用户选择场景类型
2. 选择具体分类
3. 可选填补充说明
4. 提交后自动生成定制解读

#### 2.2 Edge Function处理
**文件位置：** `supabase/functions/custom-question-answer/index.ts`

**处理逻辑：**
1. 接收问题ID
2. 获取八字数据和场景信息
3. 构建场景化系统提示词
4. 调用Lovable AI生成回答
5. 回答包含：3个核心建议 + 2个风险提示 + 1个行动步骤
6. 更新问题状态为已回答

### 3. 邀请码系统

#### 3.1 数据库结构

**邀请码表 (referral_codes):**
- `user_id`: 用户ID
- `code`: 邀请码（6位大写字母+数字）
- `uses_count`: 使用次数
- `max_uses`: 最大使用次数
- `expires_at`: 过期时间

**邀请奖励表 (referral_rewards):**
- `referrer_id`: 邀请者ID
- `referred_user_id`: 被邀请者ID
- `referral_code_id`: 邀请码ID
- `reward_type`: 奖励类型（custom_reading/case_view）
- `reward_count`: 奖励数量
- `used_count`: 已使用数量

#### 3.2 邀请系统组件 (ReferralSystem)
**文件位置：** `src/components/referral/ReferralSystem.tsx`

**功能特性：**
- 自动生成用户专属邀请码
- 一键复制邀请码和分享链接
- 展示邀请统计（成功邀请数、可用奖励、已使用奖励）
- 查看可用奖励明细

**奖励机制：**
- 被邀请者开通会员，邀请者获得奖励
  - 进阶版+：1次免费定制解读
  - 基础版：3次案例查看权限
- 被邀请者获得：首次开通8折优惠

### 4. 页面路由
- `/referral` - 邀请有礼页面（需登录）

### 5. 分享功能扩展

**现有功能基础上新增：**
- 分享卡片自动携带邀请码
- 支持分享到微信/朋友圈/小红书/微博
- 小红书/微博自动生成长图卡片（带水印）

---

## 技术栈

### 前端
- **React** - UI框架
- **TypeScript** - 类型安全
- **Recharts** - 图表库
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI组件库

### 后端
- **Supabase** - 数据库 + 认证
- **Deno Edge Functions** - 无服务器函数
- **Lovable AI** - AI解读生成

### 数据库
- **PostgreSQL** - 主数据库
- **Row-Level Security (RLS)** - 数据安全

---

## 部署说明

### 1. 数据库迁移
数据库结构已通过migration自动部署，包含：
- 学习课程相关表
- 邀请码系统表
- custom_questions表扩展（新增scene_type和scene_category字段）

### 2. Edge Functions
以下Edge Function需要部署：
- `custom-question-answer` - 处理定制解读生成（待创建）

### 3. 环境变量
确保以下环境变量已配置：
- `LOVABLE_API_KEY` - Lovable AI密钥（已配置）
- `SUPABASE_URL` - Supabase项目URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase服务密钥

---

## 使用说明

### 数据可视化
1. 进入八字排盘页面
2. 完成排盘后，点击"数据可视化"按钮
3. 查看五行分布、十神雷达、干支矩阵图
4. 点击图表元素查看详细解读

### 学习课程
1. 访问 `/learning` 页面或点击底部"学习中心"
2. 选择课程开始学习
3. 完成课后测试解锁下一课节
4. 进度自动保存，支持断点续学

### 定制解读
1. 在八字解读页面点击"定制场景解读"按钮
2. 选择关心的场景（如"职场-跳槽"）
3. 填写补充说明（可选）
4. 提交后等待AI生成定制解读

### 邀请有礼
1. 访问 `/referral` 页面或点击底部"邀请有礼"（需登录）
2. 复制专属邀请码或分享链接
3. 好友通过邀请码注册并开通会员
4. 双方获得相应奖励

---

## 后续优化方向

1. **可视化增强**
   - 添加图表下载功能（PNG/JPG格式，带水印）
   - 支持图表数据导出（Excel/CSV）
   - 添加更多交互式图表类型

2. **学习模块完善**
   - 实现课节详情页
   - 添加音频/视频播放功能
   - 完善测试题系统
   - 添加学习笔记功能

3. **定制解读优化**
   - 增加更多场景分类
   - 接入专业命理师人工审核
   - 添加解读对比功能（多次定制解读对比）

4. **邀请系统扩展**
   - 添加邀请排行榜
   - 设置邀请活动（如"邀请3人送尊享版"）
   - 支持社交媒体一键分享

---

## 安全与性能

### 安全措施
- 所有数据表已启用RLS
- 敏感操作需要身份验证
- Edge Function使用Service Role Key
- 邀请码具有唯一性约束

### 性能优化
- 图表组件使用ResponsiveContainer自适应
- 数据库查询添加索引优化
- 学习进度采用增量更新
- 邀请码使用唯一索引快速查询

---

## 已完成功能清单

### ✅ 数据库配置
- [x] 学习课程系统表（courses, lessons, quizzes, progress）
- [x] 邀请码系统表（referral_codes, referral_rewards）
- [x] 定制场景扩展（custom_questions表字段扩展）
- [x] 所有表的RLS策略
- [x] 索引优化
- [x] 初始示例数据

### ✅ 前端组件
- [x] WuxingPieChart - 五行分布环形图
- [x] ShishenRadarChart - 十神关系雷达图
- [x] BaziMatrixChart - 八字干支矩阵图
- [x] LearningCourses - 课程列表组件
- [x] CustomReadingScenes - 场景定制组件
- [x] ReferralSystem - 邀请系统组件

### ✅ 页面开发
- [x] Learning - 学习中心页面
- [x] Referral - 邀请有礼页面
- [x] Bazi - 集成可视化和定制解读功能

### ✅ 路由配置
- [x] App.tsx - 添加/learning和/referral路由
- [x] Footer - 添加学习中心和邀请有礼导航链接

### ⏳ 待完成
- [ ] custom-question-answer Edge Function（定制解读后端处理）
- [ ] 课节详情页
- [ ] 图表下载功能
- [ ] 邀请奖励自动发放逻辑

---

## 开发团队联系

如有问题或建议，请联系开发团队。
