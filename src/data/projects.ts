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
    summary: '通过采集运行证据、规则判断与模型辅助解释，支持数据平台故障诊断与恢复核验。',
    status: '内部验证记录整理中',
    visibility: '源码尚未公开',
    stack: ['Java', 'Kafka', 'Flink', 'ClickHouse', 'Spring AI'],
    challenge: '如何避免故障诊断助手输出缺乏证据的结论？',
    approach: '分离指标与日志采集、规则判断、模型解释；通过故障注入和恢复核验约束诊断输出。',
    evidence: [
      '工程记录包含消费者实例丢失、分区倾斜和 Flink 处理退化等测试场景',
      '公开展示仍需补充脱敏日志、复现脚本与固定环境说明'
    ],
    limitations: ['目前页面没有提供第三方可独立复现的完整材料', '不发布雇主私有代码或生产环境数据'],
    kind: 'original'
  },
  {
    slug: 'codebase-doc-generator',
    name: 'Codebase Doc Generator',
    category: 'Developer Tooling',
    summary: '面向源码结构理解、架构文档生成和引用校验的 Agent 工程实验。',
    status: '迭代与验证中',
    visibility: '源码未公开',
    stack: ['Agent', 'Code Analysis', 'Git', 'Evaluation'],
    challenge: '如何避免自动文档对调用链和模块职责的臆测？',
    approach: '建立源文件定位与引用证据，再生成结构化说明；尝试固定提交、测试集与差异检查。',
    evidence: ['计划将示例仓库与评测用例公开为可检查的测试夹具', '评测与工程验证材料待公开整理'],
    limitations: ['生成的技术说明不等于人工或安全审计报告'],
    kind: 'original'
  },
  {
    slug: 'deepseek-harness-study',
    name: 'Agent Harness Source Study',
    category: 'Open Source Study',
    summary: '从真实代码理解 Agent Loop、工具系统、状态管理和运行时的可靠性设计。',
    status: '源码学习',
    visibility: '公共研究仓库',
    stack: ['Agent Runtime', 'Harness', 'TypeScript', 'Testing'],
    challenge: '如何把 Agent 教材里的架构模式与真实源码、测试行为对应起来？',
    approach: '固定研究版本，逐步记录代码定位、运行日志和可重现实验，而非只阅读二手总结。',
    evidence: ['公开研究仓库可用于后续源码阅读和实验对照'],
    limitations: ['公开仓库可能包含第三方内容，使用时应遵守原始许可证', '当前页面未声称已完成全量源码验证'],
    source: 'https://github.com/jyc-work/deepseek-harness',
    kind: 'study'
  }
];
