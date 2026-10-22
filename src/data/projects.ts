export type Project = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  status: string;
  visibility: string;
  stack: string[];
  challenge: string;
  approach: string;
  evidence: string[];
  limitations: string[];
  source?: string;
  kind: 'original' | 'study';
};

export const projects: Project[] = [
  {
    slug: 'dataops-copilot',
    name: 'DataOps Copilot V1',
    category: 'Agent × Data Engineering',
    summary: '面向数据平台故障诊断的证据驱动 Copilot：从采集运行信号，到故障定位和恢复前后核验。',
    status: '验证记录整理中',
    visibility: '源码未公开',
    stack: ['Java', 'Kafka', 'Flink', 'ClickHouse', 'Spring AI'],
    challenge: '如何降低基于大语言模型的故障诊断产生无证据结论的风险？',
    approach: '将采集、规则判断与模型解释分离；以故障注入、恢复测试和记录证据建立可回归诊断流程。',
    evidence: [
      '原有工程具备针对消费者实例损失、分区倾斜及处理退化等场景的验证记录',
      '公开展示前将补充脱敏架构图、测试环境与可复现操作说明'
    ],
    limitations: ['当前公开页面不是可独立复现的证明', '内部或受限环境代码与日志不会直接公开'],
    kind: 'original'
  },
  {
    slug: 'quant-lab',
    name: 'Quant Lab',
    category: 'Research Engineering',
    summary: '多市场研究、数据治理和可复现回测实验环境；重视负结果记录与研究边界。',
    status: '研究观察中',
    visibility: '核心研究仓库非公开',
    stack: ['Python', 'Data Pipelines', 'Research', 'Testing'],
    challenge: '如何减少研究过程中的幸存者偏差、数据质量问题与事后挑选结果？',
    approach: '对数据来源、研究假设、样本区间、验收门槛和负结果建立可追踪记录。',
    evidence: ['研究基线与数据来源核验记录存在于私有工程', '公开版本将只分享脱敏的方法论和允许发布的样本'],
    limitations: ['不是投资建议或策略收益承诺', '私有数据及券商接口凭据不公开'],
    kind: 'original'
  },
  {
    slug: 'codebase-doc-generator',
    name: 'Codebase Doc Generator',
    category: 'Developer Tooling',
    summary: '探索用 Agent 对代码仓库进行结构化理解、文档生成和差异校验。',
    status: '工程实验中',
    visibility: '源码未公开',
    stack: ['Agent', 'Code Analysis', 'Evaluation', 'Git'],
    challenge: '自动生成的架构说明如何避免遗漏调用关系和凭空推断？',
    approach: '先定位源码证据，再生成结构化说明；通过固定 Commit、引用定位和回归场景验证。',
    evidence: ['规划使用固定输入与测试场景来校验结构提取', '后续发布可公开的测试夹具和结果摘要'],
    limitations: ['自动生成的文字不等同于完整的代码审计'],
    kind: 'original'
  },
  {
    slug: 'deepseek-harness-study',
    name: 'Harness Source Study',
    category: 'Open Source Learning',
    summary: '通过阅读开源 Harness 实现，梳理 Agent Loop、工具边界和运行时可靠性。',
    status: '源码研究',
    visibility: '公开研究仓库',
    stack: ['Agent Runtime', 'Harness', 'Testing'],
    challenge: '如何将教程里的 Agent 模式对应到真实代码位置和可运行实验？',
    approach: '标注版本、代码证据与尚未确认的结论；优先用小型复现实验确认机制。',
    evidence: ['提供公开 GitHub 仓库作为阅读入口；不将所研究仓库的实现视为个人原创'],
    limitations: ['所指向的工程可能包含第三方代码，请遵守各自许可证'],
    source: 'https://github.com/jyc-work/deepseek-harness',
    kind: 'study'
  }
];
