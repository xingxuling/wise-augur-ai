-- 任务一：用户场景偏好记录表
CREATE TABLE IF NOT EXISTS public.user_scene_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scene_type TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scene_type)
);

-- 启用RLS
ALTER TABLE public.user_scene_preferences ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "用户可查看自己的场景偏好"
  ON public.user_scene_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可创建自己的场景偏好"
  ON public.user_scene_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的场景偏好"
  ON public.user_scene_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 任务三：推导过程缓存表
CREATE TABLE IF NOT EXISTS public.bazi_derivation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bazi_record_id UUID REFERENCES public.bazi_records(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_index INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  calculation_data JSONB NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bazi_record_id, step_index)
);

-- 启用RLS
ALTER TABLE public.bazi_derivation_cache ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "用户可查看自己的推导缓存"
  ON public.bazi_derivation_cache
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可创建自己的推导缓存"
  ON public.bazi_derivation_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建索引优化查询
CREATE INDEX idx_user_scene_preferences_user_id ON public.user_scene_preferences(user_id);
CREATE INDEX idx_user_scene_preferences_last_used ON public.user_scene_preferences(last_used_at DESC);
CREATE INDEX idx_bazi_derivation_cache_record_id ON public.bazi_derivation_cache(bazi_record_id);
CREATE INDEX idx_bazi_derivation_cache_user_id ON public.bazi_derivation_cache(user_id);