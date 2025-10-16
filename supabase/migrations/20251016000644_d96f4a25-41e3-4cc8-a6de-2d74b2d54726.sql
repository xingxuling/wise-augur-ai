-- 创建订阅计划枚举
CREATE TYPE public.subscription_plan AS ENUM ('basic', 'advanced', 'premium');

-- 更新subscriptions表结构
ALTER TABLE public.subscriptions 
  DROP COLUMN IF EXISTS plan_type,
  ADD COLUMN plan subscription_plan NOT NULL DEFAULT 'basic',
  ADD COLUMN auto_renew BOOLEAN DEFAULT true,
  ADD COLUMN payment_method TEXT,
  ADD COLUMN region TEXT,
  ADD COLUMN currency TEXT DEFAULT 'CNY';

-- 创建支付记录表
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 支付记录RLS策略
CREATE POLICY "Users can view own payment records"
ON public.payment_records
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment records"
ON public.payment_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE TRIGGER update_payment_records_updated_at
BEFORE UPDATE ON public.payment_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();