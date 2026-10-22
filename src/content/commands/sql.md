---
title: "通用 SQL｜查询、窗口函数与事务"
description: "常用关系型 SQL、JOIN、CTE、窗口函数、NULL 语义、事务与执行计划。"
category: "数据库与 SQL"
order: 90
keywords: ["SQL","JOIN","GROUP BY","HAVING","WITH","CTE","ROW_NUMBER","EXPLAIN","事务"]
updated: 2026-10-22
source: "https://www.postgresql.org/docs/current/sql.html"
---


> **环境：** 下列示例以独立的测试库及 orders、customers 等演示表为前提。关系型 SQL 的通用思路可以复用，但具体语法、函数与事务行为以数据库方言为准。

## 查询与聚合

### 条件过滤、排序与分页

~~~sql
SELECT id, customer_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 20;
~~~

给排序加唯一键避免相同时间顺序不稳定，先使用 WHERE 限定范围。

### 聚合：GROUP BY 与 HAVING

~~~sql
SELECT customer_id, COUNT(*) AS order_count, SUM(amount) AS total
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 2
ORDER BY total DESC;
~~~

WHERE 过滤原始行，HAVING 过滤分组后的结果。

### 内连接与缺失关联

~~~sql
SELECT o.id, c.name
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
WHERE o.id = 1001;

SELECT c.id
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.id IS NULL;
~~~

JOIN 前检查关联键唯一性，避免一对多关联意外扩大数据量。

## 复杂查询

### CTE 拆解

~~~sql
WITH paid AS (
  SELECT customer_id, amount FROM orders WHERE status = 'paid'
)
SELECT customer_id, SUM(amount) AS total
FROM paid
GROUP BY customer_id;
~~~

CTE 用于提高可读性，不保证一定物化，也不保证更快。

### 窗口函数：每个客户最近一单

~~~sql
WITH ranked AS (
  SELECT id, customer_id, created_at,
         ROW_NUMBER() OVER (
           PARTITION BY customer_id
           ORDER BY created_at DESC, id DESC
         ) AS rn
  FROM orders
)
SELECT * FROM ranked WHERE rn = 1;
~~~

ROW_NUMBER、RANK、DENSE_RANK 的并列排名语义不同；这里选 ROW_NUMBER。

### NULL 与三值逻辑

~~~sql
SELECT id FROM orders WHERE deleted_at IS NULL;
~~~

不要用 = NULL；涉及 NOT IN 和 NULL 的混合条件尤其需要单独测试。

## 事务与执行计划

~~~sql
BEGIN;
-- 这里仅为事务边界示例，不包含修改语句
ROLLBACK;
~~~

**风险：** MySQL、PostgreSQL 等在 DDL 事务、隔离级别、自动提交上的行为不同。操作前核对目标库及业务变更窗口。

~~~sql
-- PostgreSQL
EXPLAIN SELECT * FROM orders WHERE customer_id = 1001;
-- MySQL
EXPLAIN FORMAT=TREE SELECT * FROM orders WHERE customer_id = 1001;
-- ClickHouse
EXPLAIN indexes = 1 SELECT count() FROM demo.events;
~~~

**注意：** EXPLAIN ANALYZE 在 MySQL 和 PostgreSQL 中会真正执行所分析语句，不能无差别视为只读计划。

## 推荐排查路径

从数据规模和过滤条件开始，检查 JOIN 基数、统计信息、执行计划、索引选择、运行成本，最后用固定输入对比优化前后效果。

## 官方资料

- [原始文档](https://www.postgresql.org/docs/current/sql.html)

*编辑日期：2026-10-22；需按目标版本复核命令与权限。*
