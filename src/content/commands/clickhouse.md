---
title: "ClickHouse SQL｜MergeTree 与系统表排障"
description: "ClickHouse 26.x：system.parts、system.query_log、查询性能、MergeTree、EXPLAIN 与运行时状态。"
category: "数据库与 SQL"
order: 92
keywords: ["ClickHouse","MergeTree","system.parts","system.query_log","EXPLAIN","system.merges","system.processes","FORMAT"]
updated: 2026-10-22
source: "https://clickhouse.com/docs/"
---


> **适用：** 参考 ClickHouse 26.x 常见行为。Cloud、自建和多副本部署的系统表权限、日志保留以及查询范围可能不同。使用 demo 数据库，不要在生产执行演示 DDL。

## 连接、版本与表结构

~~~bash
clickhouse client --host 127.0.0.1 --port 9000 \
  --user analyst --ask-password
~~~

Native 端口、TLS 与身份验证参数需符合实际部署配置。

~~~sql
SELECT version(), currentDatabase();
SHOW DATABASES;
SHOW TABLES FROM demo;
SHOW CREATE TABLE demo.events;
~~~

核对 ENGINE、PARTITION BY、ORDER BY 和 TTL；ORDER BY 决定 MergeTree 排序键，不能照搬传统 MySQL 主键模型。

## 聚合与筛选

~~~sql
SELECT toDate(event_time) AS day, count() AS rows
FROM demo.events
WHERE event_time >= now() - INTERVAL 7 DAY
GROUP BY day
ORDER BY day;
~~~

先按时间缩小扫描范围，再结合表设计评估索引是否有效。

## 活跃 Parts 与磁盘

~~~sql
SELECT table, count() AS parts,
       formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active AND database = 'demo'
GROUP BY table
ORDER BY sum(bytes_on_disk) DESC;
~~~

检查 Part 数量与写入粒度、合并压力、分区规模的关系，避免单凭数量判定问题。

## 慢查询历史

~~~sql
SELECT event_time, query_duration_ms, read_rows,
       formatReadableSize(memory_usage) AS memory, query_id
FROM system.query_log
WHERE type = 'QueryFinish'
  AND event_time >= now() - INTERVAL 1 HOUR
ORDER BY query_duration_ms DESC
LIMIT 20;
~~~

system.query_log 可能没有开放给当前账号，也不一定包含所有集群节点。历史记录保留和采样依赖配置。

## 实时运行与 Merge 状态

~~~sql
SELECT query_id, elapsed, read_rows, memory_usage
FROM system.processes
ORDER BY elapsed DESC
LIMIT 20;

SELECT database, table, elapsed, progress
FROM system.merges
ORDER BY elapsed DESC
LIMIT 20;
~~~

不要把 system.processes 的实时数据和 query_log 的历史记录混为一谈。

## 查询计划和裁剪

~~~sql
EXPLAIN indexes = 1
SELECT count()
FROM demo.events
WHERE event_time >= now() - INTERVAL 1 DAY;
~~~

可辅助检查扫描和索引裁剪；不同版本的计划输出形式可能变化。

## 失败查询与设置

~~~sql
SELECT query_id, exception_code, exception
FROM system.query_log
WHERE type = 'ExceptionWhileProcessing'
ORDER BY event_time DESC LIMIT 10;

SELECT name, value, changed
FROM system.settings
WHERE name IN ('max_threads', 'max_memory_usage');
~~~

异常消息可能携带敏感 SQL 文本，发布复盘时应先脱敏。

**高风险提示：** 不建议在业务高峰对大表随意执行 OPTIMIZE TABLE ... FINAL，强制合并会消耗资源；先定位 Part 生成与合并的真实瓶颈。

## 官方资料

- [原始文档](https://clickhouse.com/docs/)

*编辑日期：2026-10-22；需按目标版本复核命令与权限。*
