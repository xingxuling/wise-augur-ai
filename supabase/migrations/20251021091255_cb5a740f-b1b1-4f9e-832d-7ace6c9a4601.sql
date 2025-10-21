-- 创建会员权益配置表
CREATE TABLE IF NOT EXISTS public.membership_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'premium', 'vip')),
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_value TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tier, feature_key)
);

-- 启用RLS
ALTER TABLE public.membership_features ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看权益配置
CREATE POLICY "Anyone can view membership features"
  ON public.membership_features FOR SELECT
  USING (true);

-- 只有管理员可以修改权益配置
CREATE POLICY "Only admins can modify membership features"
  ON public.membership_features FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 创建更新时间触发器
CREATE TRIGGER update_membership_features_updated_at
  BEFORE UPDATE ON public.membership_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 插入默认权益配置
INSERT INTO public.membership_features (tier, feature_key, feature_name, feature_value, description, display_order) VALUES
-- Free tier
('free', 'ai_readings', 'AI解读次数', '3', '每月可使用AI解读的次数', 1),
('free', 'bazi_records', '测算记录', '1', '可保存的八字测算记录数量', 2),
('free', 'export_pdf', '导出PDF', 'false', '是否可以导出PDF报告', 3),
('free', 'export_image', '导出图片', 'true', '是否可以导出图片', 4),
('free', 'custom_reading', '自定义解读', 'false', '是否可以进行自定义场景解读', 5),
('free', 'fengshui', '风水测算', 'false', '是否可以使用风水测算功能', 6),
('free', 'learning_courses', '学习课程', '前3节', '可学习的课程内容', 7),

-- Basic tier
('basic', 'ai_readings', 'AI解读次数', '20', '每月可使用AI解读的次数', 1),
('basic', 'bazi_records', '测算记录', '10', '可保存的八字测算记录数量', 2),
('basic', 'export_pdf', '导出PDF', 'true', '是否可以导出PDF报告', 3),
('basic', 'export_image', '导出图片', 'true', '是否可以导出图片', 4),
('basic', 'custom_reading', '自定义解读', 'false', '是否可以进行自定义场景解读', 5),
('basic', 'fengshui', '风水测算', 'true', '是否可以使用风水测算功能', 6),
('basic', 'learning_courses', '学习课程', '入门课程全部', '可学习的课程内容', 7),
('basic', 'dayun_analysis', '大运分析', 'true', '是否可以查看大运分析', 8),

-- Premium tier
('premium', 'ai_readings', 'AI解读次数', '100', '每月可使用AI解读的次数', 1),
('premium', 'bazi_records', '测算记录', '50', '可保存的八字测算记录数量', 2),
('premium', 'export_pdf', '导出PDF', 'true', '是否可以导出PDF报告', 3),
('premium', 'export_image', '导出图片', 'true', '是否可以导出图片', 4),
('premium', 'custom_reading', '自定义解读', 'true', '是否可以进行自定义场景解读', 5),
('premium', 'fengshui', '风水测算', 'true', '是否可以使用风水测算功能', 6),
('premium', 'learning_courses', '学习课程', '全部课程', '可学习的课程内容', 7),
('premium', 'dayun_analysis', '大运分析', 'true', '是否可以查看大运分析', 8),
('premium', 'ai_coach', 'AI命理教练', 'true', '每日命理指导', 9),
('premium', 'classic_references', '古籍参考', 'true', '查看古籍经典原文', 10),

-- VIP tier
('vip', 'ai_readings', 'AI解读次数', '无限', '无限制使用AI解读', 1),
('vip', 'bazi_records', '测算记录', '无限', '可保存无限测算记录', 2),
('vip', 'export_pdf', '导出PDF', 'true', '是否可以导出PDF报告', 3),
('vip', 'export_image', '导出图片', 'true', '是否可以导出图片', 4),
('vip', 'custom_reading', '自定义解读', 'true', '是否可以进行自定义场景解读', 5),
('vip', 'fengshui', '风水测算', 'true', '是否可以使用风水测算功能', 6),
('vip', 'learning_courses', '学习课程', '全部课程', '可学习的课程内容', 7),
('vip', 'dayun_analysis', '大运分析', 'true', '是否可以查看大运分析', 8),
('vip', 'ai_coach', 'AI命理教练', 'true', '每日命理指导', 9),
('vip', 'classic_references', '古籍参考', 'true', '查看古籍经典原文', 10),
('vip', 'master_consultation', '大师咨询', '1次/月', '专业命理师一对一咨询', 11),
('vip', 'priority_support', '优先客服', 'true', '优先获得客服支持', 12);