-- 创建风水记录表
CREATE TABLE IF NOT EXISTS public.fengshui_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  house_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  floor INTEGER,
  build_year INTEGER,
  description TEXT,
  analysis_result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.fengshui_records ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "用户可查看自己的风水记录"
  ON public.fengshui_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可创建自己的风水记录"
  ON public.fengshui_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的风水记录"
  ON public.fengshui_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- 创建更新触发器
CREATE TRIGGER update_fengshui_records_updated_at
  BEFORE UPDATE ON public.fengshui_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建索引
CREATE INDEX idx_fengshui_records_user_id ON public.fengshui_records(user_id);
CREATE INDEX idx_fengshui_records_created_at ON public.fengshui_records(created_at DESC);