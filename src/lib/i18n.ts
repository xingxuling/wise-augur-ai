export type Language = 'zh-CN' | 'zh-TW' | 'en';

export const translations = {
  'zh-CN': {
    // General
    'app.title': '通胜AI',
    'app.subtitle': '智能八字命理分析',
    'loading': '加载中...',
    'submit': '提交',
    'cancel': '取消',
    'save': '保存',
    'delete': '删除',
    'edit': '编辑',
    'back': '返回首页',
    'confirm': '确认',
    'close': '关闭',
    
    // Navigation
    'nav.home': '首页',
    'nav.bazi': '八字测算',
    'nav.fengshui': '风水分析',
    'nav.learning': '学习中心',
    'nav.chat': 'AI教练',
    'nav.membership': '会员中心',
    'nav.pricing': '会员方案',
    'nav.login': '登录',
    'nav.logout': '退出登录',
    
    // Hero
    'hero.title': '探索命运密码',
    'hero.subtitle': '基于古法智慧与现代AI的深度解析',
    'hero.cta': '开始测算',
    
    // Features
    'features.title': '核心功能',
    'features.bazi.title': '八字排盘',
    'features.bazi.desc': '基于《三命通会》精准算法，深度解析您的命理格局',
    'features.fengshui.title': '风水测算',
    'features.fengshui.desc': '家居、办公风水布局指导，助力运势提升',
    'features.ai.title': 'AI命理解读',
    'features.ai.desc': 'Google Gemini 2.5 Flash 驱动的智能分析，提供个性化建议',
    
    // Membership
    'membership.title': '会员中心',
    'membership.current': '当前方案',
    'membership.free': '免费版',
    'membership.basic': '基础版',
    'membership.premium': '进阶版',
    'membership.vip': '尊享版',
    'membership.upgrade': '升级会员',
    'membership.expires': '到期时间',
    'membership.benefits': '会员权益',
    'membership.manage': '订阅管理',
    
    // Subscription
    'subscription.title': '订阅管理',
    'subscription.cancel': '取消订阅',
    'subscription.cancel.confirm': '确定要取消订阅吗？',
    'subscription.cancel.desc': '取消后，您的会员权益将在当前计费周期结束时失效',
    'subscription.cancel.success': '订阅已取消，将在当前周期结束时失效',
    'subscription.renew': '续费订阅',
    'subscription.expired': '已过期',
    'subscription.expiring': '即将到期',
    
    // Pricing
    'pricing.title': '选择适合您的方案',
    'pricing.monthly': '/月',
    'pricing.subscribe': '立即订阅',
    'pricing.popular': '最受欢迎',
    'pricing.secure': '安全支付',
    'pricing.cancel_anytime': '随时可取消',
    
    // Learning
    'learning.title': '命理学习中心',
    'learning.subtitle': '系统学习八字命理，从入门到精通',
    'learning.beginner': '入门',
    'learning.advanced': '进阶',
    'learning.continue': '继续学习',
    'learning.start': '开始学习',
    'learning.completed': '已完成',
    'learning.progress': '学习进度',
    'learning.minutes': '分钟',
    'learning.lessons': '节课',
    
    // Bazi
    'bazi.title': '智能八字解析',
    'bazi.subtitle': '输入您的出生信息，获取精准命理分析',
    'bazi.year': '出生年份',
    'bazi.month': '月份',
    'bazi.day': '日期',
    'bazi.hour': '出生时辰',
    'bazi.gender': '性别',
    'bazi.male': '男',
    'bazi.female': '女',
    'bazi.calculate': '开始计算',
    'bazi.calculating': '计算中...',
    
    // Footer
    'footer.services': '产品服务',
    'footer.about': '关于我们',
    'footer.help': '帮助中心',
    'footer.company': '公司介绍',
    'footer.contact': '联系我们',
    'footer.terms': '服务条款',
    'footer.privacy': '隐私政策',
    'footer.copyright': '© 2025 通胜AI. 数据加密保护用户隐私',
  },
  'zh-TW': {
    // General
    'app.title': '通勝AI',
    'app.subtitle': '智能八字命理分析',
    'loading': '載入中...',
    'submit': '提交',
    'cancel': '取消',
    'save': '儲存',
    'delete': '刪除',
    'edit': '編輯',
    'back': '返回首頁',
    'confirm': '確認',
    'close': '關閉',
    
    // Navigation
    'nav.home': '首頁',
    'nav.bazi': '八字測算',
    'nav.fengshui': '風水分析',
    'nav.learning': '學習中心',
    'nav.chat': 'AI教練',
    'nav.membership': '會員中心',
    'nav.pricing': '會員方案',
    'nav.login': '登入',
    'nav.logout': '登出',
    
    // Hero
    'hero.title': '探索命運密碼',
    'hero.subtitle': '基於古法智慧與現代AI的深度解析',
    'hero.cta': '開始測算',
    
    // Features
    'features.title': '核心功能',
    'features.bazi.title': '八字排盤',
    'features.bazi.desc': '基於《三命通會》精準算法，深度解析您的命理格局',
    'features.fengshui.title': '風水測算',
    'features.fengshui.desc': '家居、辦公風水佈局指導，助力運勢提升',
    'features.ai.title': 'AI命理解讀',
    'features.ai.desc': 'Google Gemini 2.5 Flash 驅動的智能分析，提供個性化建議',
    
    // Membership
    'membership.title': '會員中心',
    'membership.current': '當前方案',
    'membership.free': '免費版',
    'membership.basic': '基礎版',
    'membership.premium': '進階版',
    'membership.vip': '尊享版',
    'membership.upgrade': '升級會員',
    'membership.expires': '到期時間',
    'membership.benefits': '會員權益',
    'membership.manage': '訂閱管理',
    
    // Subscription
    'subscription.title': '訂閱管理',
    'subscription.cancel': '取消訂閱',
    'subscription.cancel.confirm': '確定要取消訂閱嗎？',
    'subscription.cancel.desc': '取消後，您的會員權益將在當前計費週期結束時失效',
    'subscription.cancel.success': '訂閱已取消，將在當前週期結束時失效',
    'subscription.renew': '續費訂閱',
    'subscription.expired': '已過期',
    'subscription.expiring': '即將到期',
    
    // Pricing
    'pricing.title': '選擇適合您的方案',
    'pricing.monthly': '/月',
    'pricing.subscribe': '立即訂閱',
    'pricing.popular': '最受歡迎',
    'pricing.secure': '安全支付',
    'pricing.cancel_anytime': '隨時可取消',
    
    // Learning
    'learning.title': '命理學習中心',
    'learning.subtitle': '系統學習八字命理，從入門到精通',
    'learning.beginner': '入門',
    'learning.advanced': '進階',
    'learning.continue': '繼續學習',
    'learning.start': '開始學習',
    'learning.completed': '已完成',
    'learning.progress': '學習進度',
    'learning.minutes': '分鐘',
    'learning.lessons': '節課',
    
    // Bazi
    'bazi.title': '智能八字解析',
    'bazi.subtitle': '輸入您的出生資訊，獲取精準命理分析',
    'bazi.year': '出生年份',
    'bazi.month': '月份',
    'bazi.day': '日期',
    'bazi.hour': '出生時辰',
    'bazi.gender': '性別',
    'bazi.male': '男',
    'bazi.female': '女',
    'bazi.calculate': '開始計算',
    'bazi.calculating': '計算中...',
    
    // Footer
    'footer.services': '產品服務',
    'footer.about': '關於我們',
    'footer.help': '幫助中心',
    'footer.company': '公司介紹',
    'footer.contact': '聯繫我們',
    'footer.terms': '服務條款',
    'footer.privacy': '隱私政策',
    'footer.copyright': '© 2025 通勝AI. 數據加密保護用戶隱私',
  },
  'en': {
    // General
    'app.title': 'TongSheng AI',
    'app.subtitle': 'Intelligent BaZi Analysis',
    'loading': 'Loading...',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'back': 'Back to Home',
    'confirm': 'Confirm',
    'close': 'Close',
    
    // Navigation
    'nav.home': 'Home',
    'nav.bazi': 'BaZi Analysis',
    'nav.fengshui': 'Feng Shui',
    'nav.learning': 'Learning Center',
    'nav.chat': 'AI Coach',
    'nav.membership': 'Membership',
    'nav.pricing': 'Plans',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.title': 'Discover Your Destiny',
    'hero.subtitle': 'Deep insights powered by ancient wisdom and modern AI',
    'hero.cta': 'Start Analysis',
    
    // Features
    'features.title': 'Core Features',
    'features.bazi.title': 'BaZi Chart',
    'features.bazi.desc': 'Precise algorithm based on San Ming Tong Hui for deep destiny analysis',
    'features.fengshui.title': 'Feng Shui Analysis',
    'features.fengshui.desc': 'Home and office layout guidance to enhance your fortune',
    'features.ai.title': 'AI Interpretation',
    'features.ai.desc': 'Powered by Google Gemini 2.5 Flash for personalized insights',
    
    // Membership
    'membership.title': 'Membership Center',
    'membership.current': 'Current Plan',
    'membership.free': 'Free',
    'membership.basic': 'Basic',
    'membership.premium': 'Premium',
    'membership.vip': 'VIP',
    'membership.upgrade': 'Upgrade',
    'membership.expires': 'Expires At',
    'membership.benefits': 'Benefits',
    'membership.manage': 'Manage Subscription',
    
    // Subscription
    'subscription.title': 'Manage Subscription',
    'subscription.cancel': 'Cancel Subscription',
    'subscription.cancel.confirm': 'Are you sure you want to cancel your subscription?',
    'subscription.cancel.desc': 'Your membership benefits will expire at the end of the current billing period',
    'subscription.cancel.success': 'Subscription cancelled, will expire at the end of current period',
    'subscription.renew': 'Renew Subscription',
    'subscription.expired': 'Expired',
    'subscription.expiring': 'Expiring Soon',
    
    // Pricing
    'pricing.title': 'Choose Your Plan',
    'pricing.monthly': '/month',
    'pricing.subscribe': 'Subscribe Now',
    'pricing.popular': 'Most Popular',
    'pricing.secure': 'Secure Payment',
    'pricing.cancel_anytime': 'Cancel Anytime',
    
    // Learning
    'learning.title': 'Astrology Learning Center',
    'learning.subtitle': 'Master BaZi from beginner to advanced',
    'learning.beginner': 'Beginner',
    'learning.advanced': 'Advanced',
    'learning.continue': 'Continue Learning',
    'learning.start': 'Start Learning',
    'learning.completed': 'Completed',
    'learning.progress': 'Progress',
    'learning.minutes': 'minutes',
    'learning.lessons': 'lessons',
    
    // Bazi
    'bazi.title': 'Intelligent BaZi Analysis',
    'bazi.subtitle': 'Enter your birth information for accurate destiny analysis',
    'bazi.year': 'Birth Year',
    'bazi.month': 'Month',
    'bazi.day': 'Day',
    'bazi.hour': 'Birth Hour',
    'bazi.gender': 'Gender',
    'bazi.male': 'Male',
    'bazi.female': 'Female',
    'bazi.calculate': 'Calculate',
    'bazi.calculating': 'Calculating...',
    
    // Footer
    'footer.services': 'Services',
    'footer.about': 'About Us',
    'footer.help': 'Help Center',
    'footer.company': 'Company',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.copyright': '© 2025 TongSheng AI. User privacy protected with data encryption',
  },
};

export const t = (key: string, lang: Language = 'zh-CN'): string => {
  return (translations[lang] as any)[key] || key;
};