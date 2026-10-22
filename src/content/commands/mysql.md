---
title: "MySQL｜连接、索引、事务、慢查询"
description: "MySQL 8.x 工作速查：客户端、元数据、连接检查、InnoDB、执行计划与备份。"
category: "数据库与 SQL"
order: 91
keywords: ["MySQL","SHOW FULL PROCESSLIST","SHOW INDEX","EXPLAIN ANALYZE","mysqldump","innodb_trx"]
updated: 2026-10-22
source: "https://dev.mysql.com/doc/refman/8.4/en/"
---


> **适用：** 主要参考 MySQL 8.0/8.4。以下实例地址、账号、表均为测试示意。连接前确认环境和权限。

## 连接与对象结构

~~~bash
mysql -h 127.0.0.1 -P 3307 -u readonly_user -p demo_db
~~~

用交互密码输入，避免命令行明文密码或粘贴真实账号到公开日志。

~~~sql
SELECT VERSION(), DATABASE(), CURRENT_USER();
SHOW DATABASES;
SHOW TABLES;
SHOW CREATE TABLE orders;
SHOW INDEX FROM orders;
~~~

SHOW CREATE TABLE 用于核对引擎、字段、索引和字符集；SHOW INDEX 用于了解索引顺序与唯一性。

## 连接数与运行状态

~~~sql
SHOW FULL PROCESSLIST;
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW VARIABLES LIKE 'max_connections';
SHOW ENGINE INNODB STATUS;
~~~

查看全部线程与引擎状态需要相应权限。SHOW PROCESSLIST 的部分实现具有版本差异，长期监控可考虑 Performance Schema。

## 执行计划与慢查询

~~~sql
EXPLAIN FORMAT=TREE
SELECT id, amount FROM orders WHERE customer_id = 1001;

EXPLAIN ANALYZE
SELECT id FROM orders WHERE customer_id = 1001 LIMIT 20;
~~~

**风险：** EXPLAIN ANALYZE 会实际执行查询；复杂 SQL 先在测试环境运行，避免生产系统额外负载。

~~~sql
SELECT trx_id, trx_state, trx_started
FROM information_schema.innodb_trx
ORDER BY trx_started LIMIT 20;
~~~

长事务不一定意味着死锁，但可能与锁等待、历史版本膨胀或连接异常有关；需结合事件时间检查。

## 表统计

~~~sql
SELECT table_name, table_rows, data_length, index_length
FROM information_schema.tables
WHERE table_schema = 'demo_db'
ORDER BY data_length DESC
LIMIT 20;
~~~

InnoDB 的 table_rows 可能是估计值，不应当精确记录数。

## 逻辑备份与复制

~~~bash
mysqldump -h 127.0.0.1 -P 3307 -u backup_user -p \
  --single-transaction --routines --triggers demo_db > demo_db.sql
~~~

**高风险提示：** 备份包含真实业务数据，必须安全存储并验证恢复；这里仅示例 InnoDB 场景下的逻辑备份参数。

~~~sql
SHOW REPLICA STATUS;
~~~

复制状态检查需要实际配置复制及相应权限。旧版本语法不同，按目标版本官方手册操作。

## 官方资料

- [原始文档](https://dev.mysql.com/doc/refman/8.4/en/)

*编辑日期：2026-10-22；需按目标版本复核命令与权限。*
