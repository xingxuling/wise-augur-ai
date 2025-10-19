-- 创建AI聊天会话表
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bazi_record_id UUID,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建AI聊天消息表
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- 会话RLS策略
CREATE POLICY "用户可创建自己的聊天会话"
  ON public.ai_chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可查看自己的聊天会话"
  ON public.ai_chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的聊天会话"
  ON public.ai_chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的聊天会话"
  ON public.ai_chat_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 消息RLS策略
CREATE POLICY "用户可查看自己会话的消息"
  ON public.ai_chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_chat_sessions
      WHERE ai_chat_sessions.id = ai_chat_messages.session_id
      AND ai_chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "用户可创建自己会话的消息"
  ON public.ai_chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_chat_sessions
      WHERE ai_chat_sessions.id = ai_chat_messages.session_id
      AND ai_chat_sessions.user_id = auth.uid()
    )
  );

-- 创建索引
CREATE INDEX idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_bazi_record_id ON public.ai_chat_sessions(bazi_record_id);
CREATE INDEX idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);