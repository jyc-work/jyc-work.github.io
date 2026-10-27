export type LearningStage = { name: string; duration: string; focus: string[]; deliverable: string; acceptance: string };
export type LearningRepo = { name: string; url: string; purpose: string; task: string; level: string };
export type LearningPath = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  audience: string;
  prerequisite: string;
  stages: LearningStage[];
  repositories: LearningRepo[];
  outcome: string;
};
export const learningPaths: LearningPath[] = [
  {
    slug:'agent-engineering',title:'Agent Engineering',subtitle:'Agent / Harness / Evals',
    summary:'从最小 Tool Loop 到事件流、状态恢复、评测和可控的多步执行，理解模型与 Harness 的职责边界。',
    audience:'有编程经验，准备深入 Agent 工程与源码。',
    prerequisite:'能运行 Python 或 TypeScript 项目，具备 HTTP、JSON 和 Git 基础。',
    stages:[
      {name:'最小 Agent Loop',duration:'阶段 01',focus:['消息协议、Tool Calling 与模型输出解析','工具 Schema、请求关联 ID、终止条件'],deliverable:'一个含 2 个模拟只读工具的运行循环',acceptance:'成功、非法参数、未知工具和最大轮数均有确定结果'},
      {name:'Context 与记忆',duration:'阶段 02',focus:['会话、摘要、检索和 Checkpoint 的差异','文件式状态持久化与恢复'],deliverable:'长任务的上下文管理与状态快照',acceptance:'中断重启后仍能追踪步骤且不会丢失已确认状态'},
      {name:'Harness 可靠性',duration:'阶段 03',focus:['事件流、超时、取消和重试策略','权限门禁、幂等、错误预算'],deliverable:'结构化 trace 与 8 个故障注入用例',acceptance:'故障不会无限循环；重复的写操作被规则约束'},
      {name:'源码与系统评估',duration:'阶段 04',focus:['对比 learn-claude-code 的教学结构与 Pi 的可扩展 Harness','测试集、延迟、token 成本和失败归因'],deliverable:'源码地图 + 架构决策记录 + 回归测试',acceptance:'所有结论能链接到源码位置或复现实验'}
    ],
    repositories:[
      {name:'shareAI-lab/learn-claude-code',url:'https://github.com/shareAI-lab/learn-claude-code',purpose:'循序学习 Agent Loop 与 Harness 组成方式',task:'拆出最小 Tool Loop 并自己实现异常路径',level:'基础 → 中级'},
      {name:'earendil-works/pi',url:'https://github.com/earendil-works/pi',purpose:'阅读可扩展的 Coding Agent、工具与会话设计',task:'定位 agent core、工具回调、Session 与扩展点，写源码阅读地图',level:'中级 → 深入'}
    ],
    outcome:'交付可运行的单 Agent Harness、结构化事件日志和一套故障回归测试。'
  },
  {
    slug:'java-backend',title:'Java 后端工程',subtitle:'Java / Spring Boot / Reliability',
    summary:'从 JVM、并发、数据库事务走向可观测的 Spring Boot 服务，重点是工程正确性和故障诊断。',
    audience:'希望强化后端基础和生产问题处理能力的工程师。',
    prerequisite:'熟悉 Java 语法、REST API 和基本 SQL。',
    stages:[
      {name:'Java 核心',duration:'阶段 01',focus:['集合、泛型、异常和 JMM','线程池、锁与并发数据结构'],deliverable:'含线程安全与非线程安全对照的小实验',acceptance:'能复现竞态并通过同步策略消除'},
      {name:'服务与数据',duration:'阶段 02',focus:['Spring Boot 生命周期与依赖注入','数据库事务、隔离级别、连接池'],deliverable:'具有鉴权、校验和事务的 REST 服务',acceptance:'事务异常回滚和非法输入有自动化测试'},
      {name:'生产可靠性',duration:'阶段 03',focus:['幂等、重试、超时与限流','日志、指标、Trace 与慢 SQL 分析'],deliverable:'模拟外部接口故障的服务',acceptance:'可证明重复请求不产生重复副作用'},
      {name:'部署与复盘',duration:'阶段 04',focus:['容器化、CI、配置与密钥治理','压测基线和故障定位报告'],deliverable:'可一键运行的 demo 与故障复盘',acceptance:'README 有启动命令、测试指令和已知限制'}
    ],
    repositories:[
      {name:'Snailclimb/JavaGuide',url:'https://github.com/Snailclimb/JavaGuide',purpose:'系统梳理 Java、JVM、并发、数据库和后端面试知识',task:'每周做一个并发或事务可复现样例',level:'基础 → 中级'},
    ],
    outcome:'交付带数据库事务、幂等保障、可观测性和 CI 的 Spring Boot 示例服务。'
  },
  {
    slug:'data-engineering',title:'数据工程与实时计算',subtitle:'Kafka / Flink / ClickHouse',
    summary:'理解采集、消息队列、状态计算与查询服务；以故障注入、指标观察和恢复验证代替只背理论。',
    audience:'具备 Java、SQL 基础的数据开发与平台工程师。',
    prerequisite:'会运行 Docker、编写基本 SQL，知道生产者与消费者模型。',
    stages:[
      {name:'消息与存储',duration:'阶段 01',focus:['Kafka Topic、Partition、Offset、Consumer Group','事件 Schema、延迟、重试与死信数据'],deliverable:'多分区生产者与消费者 demo',acceptance:'可观察消费进度及分区不均的影响'},
      {name:'流处理与状态',duration:'阶段 02',focus:['Flink 时间语义、Window、Watermark','State、Checkpoint、背压与恢复'],deliverable:'带状态的 Flink 流处理任务',acceptance:'人工触发失败后可检查恢复行为和输出边界'},
      {name:'查询与性能',duration:'阶段 03',focus:['ClickHouse 列式存储、分区与排序键','EXPLAIN、查询剖析和数据分布'],deliverable:'一份可重复运行的查询优化实验',acceptance:'提供查询 SQL、样本规模与前后对照指标'},
      {name:'端到端运维',duration:'阶段 04',focus:['端到端延迟与数据质量检查','故障注入、根因归纳、告警与回归'],deliverable:'Kafka → Flink → ClickHouse 的小型流水线',acceptance:'记录可验证的输入输出、失败路径与运行指标'}
    ],
    repositories:[
      {name:'apache/kafka',url:'https://github.com/apache/kafka',purpose:'阅读消费者组、分区分配和日志存储机制',task:'搭建消费者实例失效与分区倾斜实验',level:'中级 → 深入'},
    ],
    outcome:'交付一套可重放输入、故障注入、指标解释和恢复验证的数据管道样例。'
  },
  {
    slug:'fullstack',title:'前端与全栈开发',subtitle:'TypeScript / React / API / UX',
    summary:'从页面排版到 TypeScript、组件状态、API 接口，再到部署完整产品；兼顾科技感审美和实际可用性。',
    audience:'后端工程师转向全栈，以及希望快速制作完整项目的人。',
    prerequisite:'HTML、CSS、JavaScript 的基本语法；不会也可以从第一阶段补齐。',
    stages:[
      {name:'视觉和基础',duration:'阶段 01',focus:['HTML 语义、CSS 布局、响应式与可访问性','配色、字阶、信息层级和交互动效'],deliverable:'一张响应式个人项目展示页',acceptance:'桌面与手机都可阅读；支持键盘导航和减少动效偏好'},
      {name:'TypeScript 与 React',duration:'阶段 02',focus:['类型建模、组件拆分、状态与表单','路由、数据请求、加载与错误反馈'],deliverable:'带筛选和表单校验的项目管理界面',acceptance:'类型检查、基础交互测试通过'},
      {name:'后端接口集成',duration:'阶段 03',focus:['鉴权、API 约定、分页与缓存','前后端分离的部署与安全边界'],deliverable:'React + Spring Boot 的小型全栈应用',acceptance:'覆盖正常、401/403、超时、空结果和异常响应'},
      {name:'产品交付',duration:'阶段 04',focus:['构建、SEO、性能与 Core Web Vitals','CI、静态资源和项目公开文档'],deliverable:'一个可上线且可维护的产品 Demo',acceptance:'部署链接、演示视频或截图、测试和结构说明齐全'}
    ],
    repositories:[
      {name:'fullstack-hy2020/fullstack-hy2020.github.io',url:'https://github.com/fullstack-hy2020/fullstack-hy2020.github.io',purpose:'以课程练习覆盖 React、API、测试和现代全栈开发',task:'完成一个含数据读取、表单和服务端错误处理的练习',level:'基础 → 中级'}
    ],
    outcome:'交付可公开演示的响应式全栈应用，带自动化构建和基本测试。'
  },
  {
    slug:'software-architecture',title:'系统设计与工程质量',subtitle:'Architecture / Testing / Observability',
    summary:'将系统设计落到约束、容量、数据库、缓存、异步系统、故障模式与可观测性，不以记忆名词代替方案取舍。',
    audience:'想提升架构决策、技术文档和面试系统设计能力的开发者。',
    prerequisite:'已经开发过至少一个服务或完整前端应用。',
    stages:[
      {name:'需求与模型',duration:'阶段 01',focus:['非功能需求、SLO、吞吐、延迟与可用性','容量估算、读写路径及状态边界'],deliverable:'一页系统设计约束与架构图',acceptance:'假设、负载及瓶颈能够被质疑和修订'},
      {name:'可靠性组件',duration:'阶段 02',focus:['缓存、异步消息、数据库副本和事务','超时、幂等、降级、限流与死信处理'],deliverable:'同一场景的两种备选架构',acceptance:'说明成本、复杂度、性能和恢复取舍'},
      {name:'可观测与测试',duration:'阶段 03',focus:['结构化日志、Tracing、Metrics 与告警','负载测试、故障注入和回归测试'],deliverable:'一套监控与故障演练清单',acceptance:'每个核心故障有可观察信号及验证动作'},
      {name:'架构评审',duration:'阶段 04',focus:['ADR、威胁建模和变更风险','以测试证据支撑系统设计面试表达'],deliverable:'完整 ADR 与回滚预案',acceptance:'另一位工程师可依文档复现关键结论'}
    ],
    repositories:[
      {name:'donnemartin/system-design-primer',url:'https://github.com/donnemartin/system-design-primer',purpose:'系统学习大规模服务的架构概念和设计练习',task:'选择一个服务写容量估算、三类故障和替代方案',level:'基础 → 深入'}
    ],
    outcome:'交付可审查的系统架构设计文档、风险清单和验证计划。'
  },
  {
    slug:'llm-engineering',title:'LLM 原理与工程',subtitle:'CS336 / Transformer / Training / Inference',
    summary:'用最小可运行实验理解 Tokenizer、Transformer、训练系统、评估和推理，将模型机制与 Agent 工程联系起来。',
    audience:'有 Python 编程能力，希望理解大模型底层原理的工程师。',
    prerequisite:'Python、矩阵乘法和概率基础；最好先熟悉 PyTorch 张量与自动求导。',
    stages:[
      {name:'分词与模型结构',duration:'阶段 01',focus:['BPE、词表、Unicode 与编码边界','Embedding、自注意力、位置编码与因果掩码'],deliverable:'玩具 Tokenizer + 因果 Attention 单元测试',acceptance:'相同文本能编码与解码；未来 Token 不泄漏'},
      {name:'最小训练与调试',duration:'阶段 02',focus:['交叉熵、Teacher Forcing、优化器和训练循环','训练/验证切分、梯度、过拟合单 batch'],deliverable:'小语料 next-token 训练脚本',acceptance:'能记录 loss 并证明可复现的训练过程，无验证集泄漏'},
      {name:'资源与系统效率',duration:'阶段 03',focus:['显存核算、FLOPs、混合精度与梯度累积','KV Cache、吞吐与延迟、实验性能基线'],deliverable:'资源预算表与推理对照实验',acceptance:'标明 batch、sequence、dtype、硬件和测量方法'},
      {name:'数据、评估与对齐',duration:'阶段 04',focus:['数据去重、PII、污染与语料切分','基准评估、统计波动、SFT/DPO/RLVR 基本思路'],deliverable:'固定测试集的评估报告和局限说明',acceptance:'区分样本内结果与泛化能力，能说明质量与成本权衡'}
    ],
    repositories:[
      {name:'datawhalechina/diy-llm',url:'https://github.com/datawhalechina/diy-llm',purpose:'按中文章节与六项作业系统学习 Stanford CS336 相关主题',task:'从 BPE、架构开始，逐章完成自己的最小实现并对照项目材料',level:'进阶'},
      {name:'weiruihhh/cs336_note_and_hw',url:'https://github.com/weiruihhh/cs336_note_and_hw',purpose:'参考独立课程笔记及作业实现过程，注意作者自述的未完善部分',task:'为同一道实验独立设计测试，不直接照搬解答',level:'进阶'}
    ],
    outcome:'能独立解释核心模型组件，并交付玩具模型、训练日志、资源预算与最小评估。'
  }
];
export const featuredRepositories = learningPaths.flatMap(path=>path.repositories.map(repo=>({...repo,domain:path.title})));
