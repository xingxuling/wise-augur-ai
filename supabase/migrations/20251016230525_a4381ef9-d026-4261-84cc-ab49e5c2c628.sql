-- 学习课程系统表结构
CREATE TABLE public.learning_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'advanced')),
  order_index INTEGER NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.learning_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.learning_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'text')),
  media_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  classic_text_refs UUID[] DEFAULT '{}',
  case_refs UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lesson_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_position INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE public.user_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

-- 邀请码系统表结构
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('custom_reading', 'case_view')),
  reward_count INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 定制解读场景扩展（使用现有custom_questions表，添加场景字段）
ALTER TABLE public.custom_questions ADD COLUMN IF NOT EXISTS scene_type TEXT;
ALTER TABLE public.custom_questions ADD COLUMN IF NOT EXISTS scene_category TEXT;

-- 创建索引
CREATE INDEX idx_learning_lessons_course_id ON public.learning_lessons(course_id);
CREATE INDEX idx_lesson_quizzes_lesson_id ON public.lesson_quizzes(lesson_id);
CREATE INDEX idx_user_learning_progress_user_id ON public.user_learning_progress(user_id);
CREATE INDEX idx_user_learning_progress_lesson_id ON public.user_learning_progress(lesson_id);
CREATE INDEX idx_user_quiz_results_user_id ON public.user_quiz_results(user_id);
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_rewards_referrer_id ON public.referral_rewards(referrer_id);
CREATE INDEX idx_referral_rewards_referred_user_id ON public.referral_rewards(referred_user_id);

-- 启用RLS
ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS策略：学习课程（所有人可查看已发布课程）
CREATE POLICY "Anyone can view published courses"
ON public.learning_courses FOR SELECT
USING (is_published = true);

CREATE POLICY "Only admins can modify courses"
ON public.learning_courses FOR ALL
USING (is_admin(auth.uid()));

-- RLS策略：课节
CREATE POLICY "Anyone can view lessons of published courses"
ON public.learning_lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.learning_courses
    WHERE id = learning_lessons.course_id
    AND is_published = true
  )
);

CREATE POLICY "Only admins can modify lessons"
ON public.learning_lessons FOR ALL
USING (is_admin(auth.uid()));

-- RLS策略：测试题
CREATE POLICY "Anyone can view quizzes"
ON public.lesson_quizzes FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify quizzes"
ON public.lesson_quizzes FOR ALL
USING (is_admin(auth.uid()));

-- RLS策略：学习进度
CREATE POLICY "Users can view own progress"
ON public.user_learning_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
ON public.user_learning_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.user_learning_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS策略：答题结果
CREATE POLICY "Users can view own quiz results"
ON public.user_quiz_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz results"
ON public.user_quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS策略：邀请码
CREATE POLICY "Users can view own referral codes"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active referral codes by code"
ON public.referral_codes FOR SELECT
USING (
  (expires_at IS NULL OR expires_at > now())
  AND (max_uses IS NULL OR uses_count < max_uses)
);

-- RLS策略：邀请奖励
CREATE POLICY "Users can view own referral rewards"
ON public.referral_rewards FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can create referral rewards"
ON public.referral_rewards FOR INSERT
WITH CHECK (true);

-- 更新时间触发器
CREATE TRIGGER update_learning_courses_updated_at
BEFORE UPDATE ON public.learning_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_lessons_updated_at
BEFORE UPDATE ON public.learning_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at
BEFORE UPDATE ON public.user_learning_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_codes_updated_at
BEFORE UPDATE ON public.referral_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_rewards_updated_at
BEFORE UPDATE ON public.referral_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 插入示例课程数据
INSERT INTO public.learning_courses (title, description, level, order_index) VALUES
('八字入门基础', '从零开始了解八字命理的基本概念，掌握五行、十神、排盘等核心知识', 'beginner', 1),
('八字进阶实战', '深入学习八字旺衰判断、格局分析、实战断盘技巧', 'advanced', 2);

-- 插入示例课节数据（入门课程）
WITH course AS (SELECT id FROM public.learning_courses WHERE level = 'beginner' LIMIT 1)
INSERT INTO public.learning_lessons (course_id, title, content, media_type, duration_minutes, order_index) 
SELECT 
  course.id,
  title,
  content,
  media_type,
  duration_minutes,
  order_index
FROM course, (VALUES
  ('五行基础：怎么看自己缺什么', '五行是八字命理的基础。金、木、水、火、土五种元素相互生克，决定了一个人的性格特质和运势走向。本节课将教你如何从八字中识别五行分布，理解"缺什么补什么"的真正含义。', 'audio', 8, 1),
  ('十神白话：正财≠偏财', '十神是八字中的十种关系，代表了人生中的不同方面。正财代表工资收入，偏财代表意外之财；正官代表稳定工作，七杀代表挑战压力。本节课用白话解释十神含义，并结合真实案例帮你理解。', 'audio', 9, 2),
  ('八字排盘入门：年月日时柱怎么来', '八字由年、月、日、时四柱组成，每柱包含天干和地支。本节课将演示系统排盘的完整过程，让你了解自己的八字是如何计算出来的，以及每一柱代表的人生阶段。', 'text', 7, 3),
  ('特殊格局入门：专旺格是什么', '除了普通格局，八字中还有专旺格、从格等特殊格局。这些格局的人往往有独特的性格和命运走向。本节课重点讲解专旺格的特征、优势与注意事项。', 'audio', 8, 4),
  ('流年基础：怎么看今年运势', '流年就是每一年的运势变化。通过分析流年天干地支与本命八字的关系，可以预测该年的吉凶祸福。本节课教你如何快速判断流年对自己的影响。', 'audio', 9, 5)
) AS lessons(title, content, media_type, duration_minutes, order_index);

-- 插入示例测试题
WITH lesson AS (SELECT id FROM public.learning_lessons WHERE title = '十神白话：正财≠偏财' LIMIT 1)
INSERT INTO public.lesson_quizzes (lesson_id, question, options, correct_answer, explanation, order_index)
SELECT 
  lesson.id,
  '正财在八字中主要代表什么？',
  '{"A": "工资收入", "B": "彩票中奖", "C": "股票投资", "D": "副业收入"}'::jsonb,
  'A',
  '正财代表稳定的工资收入，是通过正当劳动获得的财富。而彩票、股票等属于偏财的范畴。',
  1
FROM lesson;