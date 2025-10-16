-- 创建经典典籍表
CREATE TABLE public.classic_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_name text NOT NULL,
  book_author text,
  chapter text,
  keyword text NOT NULL,
  original_text text NOT NULL,
  modern_interpretation text NOT NULL,
  application_scenario text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 创建案例库表
CREATE TABLE public.bazi_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_code text UNIQUE NOT NULL,
  gender text NOT NULL,
  age_range text NOT NULL,
  region text NOT NULL,
  identity text NOT NULL,
  bazi_data jsonb NOT NULL,
  pattern_type text NOT NULL,
  wuxing_analysis jsonb,
  consultation_question text NOT NULL,
  system_reading text NOT NULL,
  user_feedback text,
  feedback_time timestamp with time zone,
  scenario_tags text[] NOT NULL,
  is_verified boolean DEFAULT false,
  helpful_votes integer DEFAULT 0,
  unhelpful_votes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 创建案例反馈表
CREATE TABLE public.case_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  case_id uuid REFERENCES public.bazi_cases(id) ON DELETE CASCADE NOT NULL,
  is_helpful boolean NOT NULL,
  feedback_note text,
  created_at timestamp with time zone DEFAULT now()
);

-- 创建索引优化查询性能
CREATE INDEX idx_classic_texts_keyword ON public.classic_texts(keyword);
CREATE INDEX idx_classic_texts_scenario ON public.classic_texts(application_scenario);
CREATE INDEX idx_bazi_cases_pattern ON public.bazi_cases(pattern_type);
CREATE INDEX idx_bazi_cases_tags ON public.bazi_cases USING GIN(scenario_tags);
CREATE INDEX idx_case_feedbacks_case ON public.case_feedbacks(case_id);
CREATE INDEX idx_case_feedbacks_user ON public.case_feedbacks(user_id);

-- 启用RLS
ALTER TABLE public.classic_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazi_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_feedbacks ENABLE ROW LEVEL SECURITY;

-- 典籍表RLS策略（所有人可查看，仅管理员可修改）
CREATE POLICY "Anyone can view classic texts"
ON public.classic_texts
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Only admins can modify classic texts"
ON public.classic_texts
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 案例库RLS策略（所有人可查看已验证案例）
CREATE POLICY "Anyone can view verified cases"
ON public.bazi_cases
FOR SELECT
TO authenticated, anon
USING (is_verified = true);

CREATE POLICY "Only admins can modify cases"
ON public.bazi_cases
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 案例反馈RLS策略
CREATE POLICY "Users can create feedbacks"
ON public.case_feedbacks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedbacks"
ON public.case_feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE TRIGGER update_classic_texts_updated_at
BEFORE UPDATE ON public.classic_texts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bazi_cases_updated_at
BEFORE UPDATE ON public.bazi_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 插入示例典籍数据（三命通会）
INSERT INTO public.classic_texts (book_name, book_author, chapter, keyword, original_text, modern_interpretation, application_scenario) VALUES
('三命通会', '万民英', '卷六', '专旺格', '专旺者，五行独旺而无克泄，顺其旺势则吉，逆之则凶。', '专旺格是指某一五行特别强旺，没有明显的克制或泄耗。应顺应这种旺势发展，不要违逆。', '特殊格局判定'),
('三命通会', '万民英', '卷三', '五行生克', '五行相生相克，生我者为印绶，我生者为食伤，克我者为官杀，我克者为财星，比肩劫财为同类。', '五行之间存在相生相克的关系，这是命理分析的基础。了解五行关系有助于判断命局平衡。', '五行旺衰解读'),
('三命通会', '万民英', '卷十', '大运流年', '大运十年一换，流年岁岁更替，二者交互作用，决定吉凶祸福。', '大运代表十年的大趋势，流年代表每年的具体变化，两者结合分析可预测运势。', '大运流年分析');

INSERT INTO public.classic_texts (book_name, book_author, chapter, keyword, original_text, modern_interpretation, application_scenario) VALUES
('滴天髓', '刘基', '上篇', '体用精神', '体者，日主之本体也；用者，格局之所用也。体用相合,方为上命。', '体是指日主自身的强弱，用是指命局的格局和用神。两者协调配合才是好命。', '格局本质解读'),
('滴天髓', '刘基', '下篇', '从格真义', '从势者，弃命而从人，不可执一己之见，当顺大势而行。', '从格是指放弃自身日主的独立性，顺从命局中最强的五行势力。要顺势而为，不要固执己见。', '从格/专旺格深度分析'),
('滴天髓', '刘基', '下篇', '流年应期', '流年应期，需观岁运交战，五行生克，方知吉凶何时应验。', '预测流年事件的具体时间，需要综合分析流年与大运的相互作用以及五行生克关系。', '流年事件预判');

INSERT INTO public.classic_texts (book_name, book_author, chapter, keyword, original_text, modern_interpretation, application_scenario) VALUES
('子平真诠', '沈孝瞻', '卷四', '化气格', '化气者，日主与月令天干五合而化，需化神得令有力，方为真化。', '化气格是日主天干与月干相合而化成另一种五行。需要化出的五行在月令旺相，才能成立。', '化气格识别'),
('子平真诠', '沈孝瞻', '卷七', '十神互动', '偏财为意外之财，适合副业拓展；正财为正当经营，宜守成创业。', '偏财代表额外收入、投资等，正财代表工资、生意等固定收入。根据十神强弱选择发展方向。', '职场/感情场景中十神影响分析');

INSERT INTO public.classic_texts (book_name, book_author, chapter, keyword, original_text, modern_interpretation, application_scenario) VALUES
('渊海子平', '徐子平', '卷二', '魁罡格', '魁罡叠叠掌大权，性刚果断，不怒自威，宜武职军警。', '魁罡格的人性格刚毅果断，有天然的威严，适合从事需要决断力的工作如管理、执法等。', '魁罡格/日贵格解读'),
('渊海子平', '徐子平', '卷五', '日贵格', '日贵者，日主坐贵人，一生多得贵人相助，遇事逢凶化吉。', '日贵格的人天生容易得到他人帮助，在困难时期往往能化险为夷。', '性格特质分析');

-- 插入示例案例数据
INSERT INTO public.bazi_cases (case_code, gender, age_range, region, identity, bazi_data, pattern_type, consultation_question, system_reading, user_feedback, feedback_time, scenario_tags, is_verified) VALUES
('CASE2024001', '女', '25-30岁', '广东深圳', '跨境电商创业者', 
'{"year": "癸卯", "month": "甲寅", "day": "甲子", "hour": "己巳", "pattern": "从财格"}',
'从财格',
'2023年是否适合开展跨境电商业务？',
'您的八字为从财格（据《滴天髓》"从势者弃命从人"），2023癸卯年木旺生财，非常适合拓展财源。建议顺应财势，大胆开展跨境电商等轻资产业务。',
'2023年3月按建议启动亚马逊店铺，到年底营收增长40%，确实是好年份！',
'2024-01-15'::timestamp with time zone,
ARRAY['创业', '从财格', '流年适配'],
true);

INSERT INTO public.bazi_cases (case_code, gender, age_range, region, identity, bazi_data, pattern_type, consultation_question, system_reading, user_feedback, feedback_time, scenario_tags, is_verified) VALUES
('CASE2024002', '男', '30-35岁', '北京', '互联网产品经理',
'{"year": "庚辰", "month": "戊寅", "day": "庚辰", "hour": "丁丑", "pattern": "专旺格（稼穑）"}',
'专旺格',
'2024年能否获得晋升机会？',
'您的八字为稼穑格（专旺格），庚金日主坐辰土，土旺生金。2024甲辰年虽木克土，但土势强旺，反能激发您的领导才能。建议在上半年主动争取项目负责机会。',
'2024年6月成功晋升为高级产品经理，解读很准！',
'2024-07-01'::timestamp with time zone,
ARRAY['职场', '专旺格', '晋升'],
true);

INSERT INTO public.bazi_cases (case_code, gender, age_range, region, identity, bazi_data, pattern_type, consultation_question, system_reading, user_feedback, feedback_time, scenario_tags, is_verified) VALUES
('CASE2024003', '女', '28-32岁', '上海', '金融分析师',
'{"year": "辛酉", "month": "庚子", "day": "辛卯", "hour": "癸巳", "pattern": "从儿格"}',
'从儿格',
'感情方面何时能遇到合适对象？',
'您的八字为从儿格，食伤旺盛，聪明伶俐但对感情要求较高。2025乙巳年，巳火为桃花，且食神得令，适合通过兴趣社交圈认识对象。建议参加读书会、艺术活动等高质量社交场合。',
NULL,
NULL,
ARRAY['感情', '从儿格', '桃花运'],
true);