-- 1. 给 ryan599884@gmail.com 添加 VIP 会员权限
INSERT INTO public.user_memberships (user_id, tier)
SELECT id, 'vip'::membership_tier
FROM auth.users
WHERE email = 'ryan599884@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  tier = 'vip'::membership_tier,
  updated_at = now();

-- 2. 创建问题历史记录视图增强
CREATE INDEX IF NOT EXISTS idx_custom_questions_user_created 
ON public.custom_questions(user_id, created_at DESC);

-- 3. 创建分享记录表
CREATE TABLE public.reading_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bazi_record_id uuid NOT NULL REFERENCES public.bazi_records(id) ON DELETE CASCADE,
  share_code text NOT NULL UNIQUE,
  reading_type text NOT NULL,
  content jsonb NOT NULL,
  views_count integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.reading_shares ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own shares"
ON public.reading_shares
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shares"
ON public.reading_shares
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view valid shares"
ON public.reading_shares
FOR SELECT
TO anon
USING (
  (expires_at IS NULL OR expires_at > now())
);

CREATE POLICY "Users can delete own shares"
ON public.reading_shares
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 添加触发器
CREATE TRIGGER update_reading_shares_updated_at
BEFORE UPDATE ON public.reading_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 添加索引
CREATE INDEX idx_reading_shares_code ON public.reading_shares(share_code);
CREATE INDEX idx_reading_shares_user ON public.reading_shares(user_id, created_at DESC);
CREATE INDEX idx_reading_shares_expires ON public.reading_shares(expires_at) WHERE expires_at IS NOT NULL;