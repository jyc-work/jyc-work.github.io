---
title: "PostgreSQL｜psql、锁和执行计划"
description: "PostgreSQL 16–18 的 psql 元命令、监控视图、执行计划和备份。"
category: "数据库与 SQL"
order: 93
keywords: ["PostgreSQL","psql","pg_dump","pg_stat_activity","EXPLAIN ANALYZE","pg_locks","\\dt"]
updated: 2026-10-22
source: "https://www.postgresql.org/docs/current/app-psql.html"
---


> **环境：** PostgreSQL 16–18 或兼容的托管版本。云平台可能限制监控视图的字段可见性，示例用 demo_db 和 readonly_user。

## psql 基础

~~~bash
psql -h 127.0.0.1 -p 5432 -U readonly_user -d demo_db
~~~

不要在 shell 历史中写明文密码。以下反斜杠命令只在 psql 客户端内执行。

~~~text
\l
\dn
\dt
\d+ public.orders
\timing on
\x on
~~~

分别用于查看数据库、Schema、表、表结构、查询计时和扩展显示模式。

## 版本与连接

~~~sql
SELECT version(), current_database(), current_user;
~~~

## 查询计划

~~~sql
EXPLAIN
SELECT id FROM public.orders WHERE customer_id = 1001;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM public.orders WHERE customer_id = 1001 LIMIT 20;
~~~

**高风险：** ANALYZE 真正执行 SQL。对 INSERT/UPDATE/DELETE 的 EXPLAIN ANALYZE 不代表无副作用，必须按实际写操作管控。

## 运行中的事务与等待

~~~sql
SELECT pid, state, wait_event_type, wait_event,
       now() - query_start AS running_for
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY running_for DESC NULLS LAST
LIMIT 20;
~~~

权限受限制时可能只能看到部分详细信息；不要直接终止其他会话。

## 表统计

~~~sql
SELECT relname, seq_scan, idx_scan, n_live_tup
FROM pg_stat_user_tables
ORDER BY seq_scan DESC LIMIT 20;
~~~

统计信息与估算行数不能作为单次查询的精确耗时证据。

## 备份检查

~~~bash
pg_dump -h 127.0.0.1 -U backup_user -d demo_db \
  --format=custom --file=demo_db.dump
pg_restore --list demo_db.dump | head -n 30
~~~

**注意：** 实际备份含业务数据，必须加密保存、严格限制权限并定期执行恢复演练。

## 官方资料

- [参考文档](https://www.postgresql.org/docs/current/app-psql.html)

*编辑日期：2026-10-22；必须按实际版本验证。*
