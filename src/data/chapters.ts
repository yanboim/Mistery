export const chapters = [
  { number: 1, numeral: '一', title: '交易基础认知', role: '道', summary: '从趋势、风险与交易本质开始，建立进入市场前必须具备的基础认知。' },
  { number: 2, numeral: '二', title: '交易技术指标', role: '术', summary: '理解量价、均线、筹码、MACD 与缠论等常见分析工具。' },
  { number: 3, numeral: '三', title: '交易策略方法', role: '法', summary: '把零散判断组织为可执行、可复盘的交易策略。' },
  { number: 4, numeral: '四', title: '交易技巧认知', role: '用', summary: '聚焦仓位、做 T、解套、抄底与筹码博弈等实战问题。' },
  { number: 5, numeral: '五', title: '宏观经济认知', role: '势', summary: '从流动性、产业周期与全球格局理解市场所处的大环境。' },
  { number: 6, numeral: '六', title: 'Mi 姐谜语', role: '心', summary: '以市场观察、行业线索和投资心法拓展长期判断力。' },
] as const;

export const chapterByNumber = new Map(chapters.map((chapter) => [chapter.number, chapter]));
