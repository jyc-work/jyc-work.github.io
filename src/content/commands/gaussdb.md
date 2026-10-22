---
title: "GaussDB｜兼容模式与常见检查"
description: "识别 GaussDB 产品型号、兼容模式、元数据与 SQL 计划；避免误用其他数据库语法。"
category: "数据库与 SQL"
order: 95
keywords: ["GaussDB","gsql","GaussDB M","GaussDB PG","SHOW TABLES","EXPLAIN","兼容模式"]
updated: 2026-10-22
source: "https://support.huaweicloud.com/gaussdb/"
---


> **先确认产品版本。** GaussDB 有集中式与分布式产品、不同兼容模式及 GaussDB(DWS) 等不同体系；不能把 MySQL/PostgreSQL 的语法直接当成所有 GaussDB 版本通用。

## 诊断第一步：版本与兼容模式

~~~sql
SELECT version();
~~~

先结合产品控制台和部署文档核对实际版本、兼容模式、SQL 语法能力和账号权限。

## M 兼容模式：元数据示例

部分 M 兼容版本支持以下 MySQL 风格语法：

~~~sql
SHOW DATABASES;
SHOW TABLES;
SHOW CREATE TABLE demo_orders;
~~~

**版本限制：** 是否支持及具体语法以当前产品版本的官方文档为准。

## PG 兼容模式：元数据示例

某些 PG 兼容版本可能支持：

~~~sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
LIMIT 30;
~~~

部分系统视图字段及权限未必与 PostgreSQL 完全一致。

## 查询计划与慢 SQL

~~~sql
EXPLAIN SELECT * FROM demo_orders WHERE id = 1001;
~~~

该 SQL 仅是条件语法兼容时的示例。对慢查询依次检查：版本 → 表与索引结构 → 计划 → 锁等待 → 资源瓶颈 → 查询和数据分布。

## 重要的差异边界

- 不要默认 InnoDB 状态、Performance Schema 在 GaussDB 中存在。
- 不要默认 pg_stat_activity、pg_locks 在所有 GaussDB 产品中完全兼容。
- 不要在未确认事务语义与执行计划语法时随意使用 EXPLAIN ANALYZE。
- 变更参数、DDL、取消会话及服务端管理操作必须以生产变更流程为前提。

建议保存实际版本号、SQL 模式和复现样本后再扩展这份速查。

## 官方资料

- [参考文档](https://support.huaweicloud.com/gaussdb/)

*编辑日期：2026-10-22；必须按实际版本验证。*
