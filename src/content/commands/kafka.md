---
title: "Kafka｜Topic、Consumer Group 与延迟"
description: "Kafka CLI 查看 Topic、分区副本、消费组 Lag、消息读取与版本信息。"
category: "大数据组件"
order: 31
keywords: ["Kafka","kafka-topics.sh","kafka-consumer-groups.sh","lag","topic","partition"]
updated: 2026-10-22
source: "https://kafka.apache.org/documentation/"
---


> 示例适用于 Kafka CLI 常见版本。Kafka 4.x KRaft 与旧 ZooKeeper 模式在管理方式上不同。命令需在已安装 Kafka CLI 的目录执行，端点为测试 Broker。

## Topic 与 Broker 概览

~~~bash
bin/kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --list

bin/kafka-topics.sh --bootstrap-server 127.0.0.1:9092 \
  --describe --topic demo.events

bin/kafka-broker-api-versions.sh --bootstrap-server 127.0.0.1:9092
~~~

检查分区、Leader、ISR 和 API 能力；注意元数据状态随集群变化。

## Consumer Group 与 Lag

~~~bash
bin/kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 \
  --list

bin/kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 \
  --describe --group demo-group
~~~

Lag 是消费位置差距，不等于延迟秒数。判断根因需要结合消费速率、分区分布、实例数、重平衡与下游耗时。

## 只在测试 Topic 中预览数据

~~~bash
bin/kafka-console-consumer.sh --bootstrap-server 127.0.0.1:9092 \
  --topic demo.events --from-beginning --max-messages 5
~~~

**数据风险：** 真实 Topic 的消息可能包含个人信息和密钥。--from-beginning 在高吞吐 Topic 上读历史还可能增加系统负载。

## 排障场景

- Lag 集中在少数分区：检查热 Key 与分区倾斜。
- Group 频繁重平衡：检查成员增减、心跳、消费超时和部署变化。
- Lag 增长但成员稳定：检查生产速率、消息处理耗时和下游依赖。
- 消费器无输出：检查 Topic、组偏移、ACL、网络、序列化格式。

不要在生产环境未经审批执行 offset reset、Topic 删除或配置改写。

## 官方参考

- [命令文档](https://kafka.apache.org/documentation/)

*命令需根据实际系统版本、授权和部署方式确认。*
