// 全地区数据（国内+港澳台）
export const REGIONS = [
  // 华北地区
  { value: 'beijing', label: '北京市', longitude: 116.4074, currency: 'CNY', displayCurrency: '¥' },
  { value: 'tianjin', label: '天津市', longitude: 117.2008, currency: 'CNY', displayCurrency: '¥' },
  { value: 'hebei', label: '河北省', longitude: 114.5024, currency: 'CNY', displayCurrency: '¥' },
  { value: 'shanxi', label: '山西省', longitude: 112.5492, currency: 'CNY', displayCurrency: '¥' },
  { value: 'neimenggu', label: '内蒙古自治区', longitude: 111.6708, currency: 'CNY', displayCurrency: '¥' },
  
  // 东北地区
  { value: 'liaoning', label: '辽宁省', longitude: 123.4328, currency: 'CNY', displayCurrency: '¥' },
  { value: 'jilin', label: '吉林省', longitude: 125.3245, currency: 'CNY', displayCurrency: '¥' },
  { value: 'heilongjiang', label: '黑龙江省', longitude: 126.6433, currency: 'CNY', displayCurrency: '¥' },
  
  // 华东地区
  { value: 'shanghai', label: '上海市', longitude: 121.4737, currency: 'CNY', displayCurrency: '¥' },
  { value: 'jiangsu', label: '江苏省', longitude: 118.7969, currency: 'CNY', displayCurrency: '¥' },
  { value: 'zhejiang', label: '浙江省', longitude: 120.1536, currency: 'CNY', displayCurrency: '¥' },
  { value: 'anhui', label: '安徽省', longitude: 117.2272, currency: 'CNY', displayCurrency: '¥' },
  { value: 'fujian', label: '福建省', longitude: 119.2965, currency: 'CNY', displayCurrency: '¥' },
  { value: 'jiangxi', label: '江西省', longitude: 115.8581, currency: 'CNY', displayCurrency: '¥' },
  { value: 'shandong', label: '山东省', longitude: 117.0208, currency: 'CNY', displayCurrency: '¥' },
  
  // 华中地区
  { value: 'henan', label: '河南省', longitude: 113.6254, currency: 'CNY', displayCurrency: '¥' },
  { value: 'hubei', label: '湖北省', longitude: 114.3055, currency: 'CNY', displayCurrency: '¥' },
  { value: 'hunan', label: '湖南省', longitude: 112.9388, currency: 'CNY', displayCurrency: '¥' },
  
  // 华南地区
  { value: 'guangdong', label: '广东省', longitude: 113.2644, currency: 'CNY', displayCurrency: '¥' },
  { value: 'guangxi', label: '广西壮族自治区', longitude: 108.3661, currency: 'CNY', displayCurrency: '¥' },
  { value: 'hainan', label: '海南省', longitude: 110.3312, currency: 'CNY', displayCurrency: '¥' },
  
  // 西南地区
  { value: 'chongqing', label: '重庆市', longitude: 106.5516, currency: 'CNY', displayCurrency: '¥' },
  { value: 'sichuan', label: '四川省', longitude: 104.0657, currency: 'CNY', displayCurrency: '¥' },
  { value: 'guizhou', label: '贵州省', longitude: 106.7073, currency: 'CNY', displayCurrency: '¥' },
  { value: 'yunnan', label: '云南省', longitude: 102.7103, currency: 'CNY', displayCurrency: '¥' },
  { value: 'xizang', label: '西藏自治区', longitude: 91.1174, currency: 'CNY', displayCurrency: '¥' },
  
  // 西北地区
  { value: 'shaanxi', label: '陕西省', longitude: 108.9540, currency: 'CNY', displayCurrency: '¥' },
  { value: 'gansu', label: '甘肃省', longitude: 103.8236, currency: 'CNY', displayCurrency: '¥' },
  { value: 'qinghai', label: '青海省', longitude: 101.7782, currency: 'CNY', displayCurrency: '¥' },
  { value: 'ningxia', label: '宁夏回族自治区', longitude: 106.2586, currency: 'CNY', displayCurrency: '¥' },
  { value: 'xinjiang', label: '新疆维吾尔自治区', longitude: 87.6278, currency: 'CNY', displayCurrency: '¥' },
  
  // 港澳台地区
  { value: 'hongkong', label: '香港特别行政区', longitude: 114.1694, currency: 'HKD', displayCurrency: 'HK$' },
  { value: 'macau', label: '澳门特别行政区', longitude: 113.5439, currency: 'MOP', displayCurrency: 'MOP' },
  { value: 'taiwan', label: '台湾地区', longitude: 121.5654, currency: 'TWD', displayCurrency: 'NT$' },
] as const;

export type RegionValue = typeof REGIONS[number]['value'];

export const getRegionByValue = (value: string) => {
  return REGIONS.find(r => r.value === value) || REGIONS[0];
};

// 支付方式配置（按地区）
export const PAYMENT_METHODS = {
  CNY: [
    { value: 'wechat', label: '微信支付', icon: '💬' },
    { value: 'alipay', label: '支付宝', icon: '💳' },
    { value: 'unionpay', label: '银联支付', icon: '🏦' },
  ],
  HKD: [
    { value: 'wechat_hk', label: '微信支付（港币）', icon: '💬' },
    { value: 'alipay_hk', label: '支付宝（国际版）', icon: '💳' },
    { value: 'unionpay', label: '银联卡', icon: '🏦' },
  ],
  MOP: [
    { value: 'wechat_mo', label: '微信支付（澳门元）', icon: '💬' },
    { value: 'alipay_mo', label: '支付宝（国际版）', icon: '💳' },
    { value: 'unionpay', label: '银联卡', icon: '🏦' },
  ],
  TWD: [
    { value: 'alipay_tw', label: '支付宝（台湾）', icon: '💳' },
    { value: 'unionpay', label: '银联卡', icon: '🏦' },
  ],
} as const;