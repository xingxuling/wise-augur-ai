-- 1. 创建角色枚举类型
CREATE TYPE public.app_role AS ENUM ('user', 'vip', 'admin');

-- 2. 创建用户角色表
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 启用 RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以查看角色（用于检查权限）
CREATE POLICY "Anyone can view user roles"
ON public.user_roles
FOR SELECT
USING (true);

-- 只有管理员可以修改角色
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. 创建安全检查函数
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 4. 给指定邮箱添加管理员权限
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'ryan599884@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. 创建自定义问题表
CREATE TABLE public.custom_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bazi_record_id uuid NOT NULL REFERENCES public.bazi_records(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  answered_at timestamp with time zone
);

-- 启用 RLS
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own questions"
ON public.custom_questions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own questions"
ON public.custom_questions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
ON public.custom_questions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all questions"
ON public.custom_questions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all questions"
ON public.custom_questions
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 添加更新时间触发器
CREATE TRIGGER update_custom_questions_updated_at
BEFORE UPDATE ON public.custom_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 添加索引
CREATE INDEX idx_custom_questions_user ON public.custom_questions(user_id, created_at DESC);
CREATE INDEX idx_custom_questions_status ON public.custom_questions(status);
CREATE INDEX idx_custom_questions_bazi ON public.custom_questions(bazi_record_id);