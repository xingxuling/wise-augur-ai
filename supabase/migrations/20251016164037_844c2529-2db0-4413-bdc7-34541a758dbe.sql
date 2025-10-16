-- 1. 修复 bazi_records 表的 RLS 策略，添加删除权限
CREATE POLICY "Users can delete own bazi records"
ON public.bazi_records
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. 创建 AI 使用记录追踪表
CREATE TABLE public.ai_usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type text NOT NULL DEFAULT 'ai_reading',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  bazi_record_id uuid REFERENCES public.bazi_records(id) ON DELETE SET NULL
);

-- 启用 RLS
ALTER TABLE public.ai_usage_records ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own usage records"
ON public.ai_usage_records
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage records"
ON public.ai_usage_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 添加索引以提高查询性能
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage_records(user_id, created_at DESC);

-- 3. 创建流年分析表
CREATE TABLE public.liunian_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bazi_record_id uuid NOT NULL REFERENCES public.bazi_records(id) ON DELETE CASCADE,
  year integer NOT NULL,
  analysis jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(bazi_record_id, year)
);

-- 启用 RLS
ALTER TABLE public.liunian_analyses ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own liunian analyses"
ON public.liunian_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own liunian analyses"
ON public.liunian_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own liunian analyses"
ON public.liunian_analyses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own liunian analyses"
ON public.liunian_analyses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 添加更新时间触发器
CREATE TRIGGER update_liunian_analyses_updated_at
BEFORE UPDATE ON public.liunian_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 添加索引
CREATE INDEX idx_liunian_user_year ON public.liunian_analyses(user_id, year);
CREATE INDEX idx_liunian_bazi_record ON public.liunian_analyses(bazi_record_id);