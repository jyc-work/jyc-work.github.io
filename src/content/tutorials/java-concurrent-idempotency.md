---
title: "Java 并发与接口幂等：从竞态条件到数据库唯一约束"
description: "复现共享计数器竞态，理解为什么前端去重不等于后端幂等，以及如何设计事务验收。"
date: 2026-10-27
track: java-backend
order: 1
level: 进阶
duration: "60–90 分钟"
tags: ["Java", "Concurrency", "Idempotency"]
source: "https://github.com/Snailclimb/JavaGuide"
---

## 两种容易混淆的问题

线程安全关注**多个执行线程共享状态**时的正确性；幂等关注**同一业务意图被重复提交**时是否产生重复副作用。一个加了 `synchronized` 的服务方法，仍可能在多实例部署时被重复执行；一个有数据库唯一约束的幂等接口，也不意味着其所有内存操作线程安全。

## 先重现竞态

Java 17+ 即可执行，保存为 `CounterDemo.java`：

```java
import java.util.concurrent.*;

public class CounterDemo {
    static int unsafe = 0;
    static final java.util.concurrent.atomic.AtomicInteger safe =
        new java.util.concurrent.atomic.AtomicInteger();

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        CountDownLatch done = new CountDownLatch(8);
        for (int worker = 0; worker < 8; worker++) {
            pool.submit(() -> {
                for (int i = 0; i < 100_000; i++) {
                    unsafe++;
                    safe.incrementAndGet();
                }
                done.countDown();
            });
        }
        done.await();
        pool.shutdown();
        System.out.println("unsafe=" + unsafe);
        System.out.println("atomic=" + safe.get());
        if (safe.get() != 800_000) throw new AssertionError("atomic wrong");
    }
}
```

运行 `javac CounterDemo.java && java CounterDemo`。`unsafe++` 是读取、加法、写回三个逻辑步骤，不构成原子操作；常见情况下其结果低于预期，但**不能保证每次都能观察到失败**。要稳定检验竞态，需要控制交错或使用更专门的并发测试方式。

## 接口的幂等事务草图

数据库侧设计一张幂等表：`(tenant_id, idempotency_key)` 为唯一索引，另存请求体 Hash、执行状态及成功响应引用。请求到达时，原子尝试占用键；同键异参返回冲突；同键同参的已完成请求返回历史结果。

只要存在支付、发消息或跨服务副作用，单个本地事务就不够。可以采用 Outbox/可靠消息/回执对账等模式，并分析“外部成功、本地写入失败”的崩溃窗口。不要直接把重试次数设置很大来掩盖问题。

## 手动设计故障矩阵

- 两个请求同时提交同一幂等键。
- 第一个请求数据库已提交，但 HTTP 响应丢失。
- 请求键相同，参数却不一致。
- 服务重启后重复请求。
- 幂等记录过期后收到老请求。

验收时断言**数据库最终行数和外部副作用次数**，不要只断言 HTTP 状态码。

## 验收题

1. `volatile` 能让 `unsafe++` 原子化吗？为什么？
2. 为什么数据库唯一索引比单机锁更适合多实例服务？
3. 同键异参为何应拒绝？

**验收**：并发运行输出、幂等请求状态机、两个并发集成测试与跨服务副作用设计图。
