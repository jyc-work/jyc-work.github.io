---
title: "Redis｜Key、TTL、内存与慢命令"
description: "Redis 常用 redis-cli、SCAN、TTL、INFO、SLOWLOG 和缓存问题定位。"
category: "数据库与 SQL"
order: 94
keywords: ["Redis","redis-cli","SCAN","TTL","SLOWLOG","INFO memory","MEMORY USAGE","DBSIZE"]
updated: 2026-10-22
source: "https://redis.io/docs/latest/commands/"
---


> **环境：** 常见 Redis 服务端与 redis-cli。Redis Cluster、ACL 和托管版可能限制命令能力。用 app:demo:* 演示键空间。

## 客户端连接与连通性

~~~bash
redis-cli -h 127.0.0.1 -p 6379 --user readonly_user --askpass
~~~

不在 shell 命令行直接粘贴真实凭据；生产集群需确认节点和代理层路由。

~~~text
PING
INFO server
INFO clients
~~~

INFO 的内容可能包含部署信息，对外共享前先脱敏。

## Key 相关排查

~~~text
TYPE app:demo:1001
TTL app:demo:1001
MEMORY USAGE app:demo:1001
~~~

先判断类型，再使用匹配的数据类型命令；TTL 的 -1 与 -2 含义不同。

~~~text
SCAN 0 MATCH app:demo:* COUNT 100
~~~

SCAN 返回游标，必须继续使用返回值分页直到游标为 0；COUNT 是工作量提示，不保证返回数量。

**风险：** 在生产避免使用 KEYS * 阻塞扫描全库。SCAN 也应控制频率和批量，不能无限扫。

## 性能与内存

~~~text
SLOWLOG GET 10
SLOWLOG LEN
INFO memory
INFO stats
DBSIZE
~~~

SLOWLOG 只统计服务端命令执行耗时，不包含完整的网络和客户端等待时间。

~~~text
CLIENT LIST
~~~

可能暴露连接地址和用户信息，日志截图应脱敏。

## 破坏性命令警示

FLUSHALL/FLUSHDB 会删除键，不能当成普通缓存排障命令；本手册不提供可以复制执行的清库示例。

## 官方资料

- [参考文档](https://redis.io/docs/latest/commands/)

*编辑日期：2026-10-22；必须按实际版本验证。*
