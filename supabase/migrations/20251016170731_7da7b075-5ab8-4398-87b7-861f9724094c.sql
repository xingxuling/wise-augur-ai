-- 添加用户删除自己问题的权限
CREATE POLICY "Users can delete own questions"
ON public.custom_questions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);