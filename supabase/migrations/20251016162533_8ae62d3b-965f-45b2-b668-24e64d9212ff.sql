-- 创建用户解读收藏表
CREATE TABLE IF NOT EXISTS public.reading_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bazi_record_id UUID NOT NULL REFERENCES public.bazi_records(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,
  content TEXT NOT NULL,
  highlight_text TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reading_bookmarks_user_id ON public.reading_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_bookmarks_bazi_record ON public.reading_bookmarks(bazi_record_id);

-- 启用RLS
ALTER TABLE public.reading_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "用户可查看自己的收藏" ON public.reading_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可创建自己的收藏" ON public.reading_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的收藏" ON public.reading_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的收藏" ON public.reading_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- 创建反馈表
CREATE TABLE IF NOT EXISTS public.reading_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bazi_record_id UUID NOT NULL REFERENCES public.bazi_records(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,
  reading_content TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('术语难懂', '建议不落地', '与实际不符', '其他')),
  feedback_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reading_feedbacks_user_id ON public.reading_feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_feedbacks_status ON public.reading_feedbacks(status);

-- 启用RLS
ALTER TABLE public.reading_feedbacks ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "用户可查看自己的反馈" ON public.reading_feedbacks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可创建反馈" ON public.reading_feedbacks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建会员等级表(枚举类型)
DO $$ BEGIN
  CREATE TYPE public.membership_tier AS ENUM ('free', 'basic', 'premium', 'vip');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 创建用户会员表
CREATE TABLE IF NOT EXISTS public.user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.membership_tier NOT NULL DEFAULT 'free',
  expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_tier ON public.user_memberships(tier);

-- 启用RLS
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "用户可查看自己的会员信息" ON public.user_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- 创建用户偏好设置表
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'zh-CN' CHECK (language IN ('zh-CN', 'zh-TW', 'en')),
  region TEXT NOT NULL DEFAULT 'beijing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- 启用RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "用户可查看自己的偏好设置" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的偏好设置" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可创建自己的偏好设置" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有新表添加更新时间触发器
DROP TRIGGER IF EXISTS update_reading_bookmarks_updated_at ON public.reading_bookmarks;
CREATE TRIGGER update_reading_bookmarks_updated_at
  BEFORE UPDATE ON public.reading_bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reading_feedbacks_updated_at ON public.reading_feedbacks;
CREATE TRIGGER update_reading_feedbacks_updated_at
  BEFORE UPDATE ON public.reading_feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_memberships_updated_at ON public.user_memberships;
CREATE TRIGGER update_user_memberships_updated_at
  BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 为新用户自动创建会员记录和偏好设置
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- 创建会员记录
  INSERT INTO public.user_memberships (user_id, tier)
  VALUES (NEW.id, 'free');
  
  -- 创建偏好设置
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created_setup ON auth.users;
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();