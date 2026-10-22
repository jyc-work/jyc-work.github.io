# JYC 技术博客可复现实验

要求：Python 3.11+，只使用标准库；不需要模型 Key、Kafka Broker、Spring Boot 或外部数据库。

```bash
python -m unittest discover -s examples/tests -v
python examples/agent_loop/loop.py
python examples/kafka_lag/analyze.py examples/kafka_lag/before.txt examples/kafka_lag/after.txt --seconds 30
python examples/idempotency/store.py
```

实验边界：

- Agent：脚本化模型驱动的确定性 Tool Loop，测试工具白名单、审批、错误和步数上限；不是实际接入模型的 Agent。重放 Ledger 仅在内存中。
- Kafka：离线 Offset 快照，样本数据由人工构造，不代表连接到真实 Broker 或发现了真实故障。
- 幂等：SQLite 事务与并发演示，不是 Spring Boot + MySQL/PostgreSQL 的集成验证。

所有输出与公开源码对应；不得把模拟结果标记为生产实测。
