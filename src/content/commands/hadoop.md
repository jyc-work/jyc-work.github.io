---
title: "Hadoop｜HDFS 与 YARN 运维"
description: "HDFS 文件查询、容量检查、NameNode 与 YARN 应用状态定位。"
category: "大数据组件"
order: 30
keywords: ["Hadoop","HDFS","hdfs dfs","hdfs dfsadmin","yarn application","YARN"]
updated: 2026-10-22
source: "https://hadoop.apache.org/docs/current/"
---


> Hadoop 的 HDFS、YARN 与 MapReduce 是不同组件；命令适用性受发行版、Kerberos、HA 和集群权限影响。

## HDFS 文件与目录

~~~bash
hdfs dfs -ls /
hdfs dfs -ls /user/demo/
hdfs dfs -du -h /user/demo/
hdfs dfs -count /user/demo/
~~~

ls、du 与 count 分别用于目录查看、路径占用估计和文件/目录计数。

## 文件预览与本地下载

~~~bash
hdfs dfs -cat /user/demo/sample.txt | head -n 20
hdfs dfs -get /user/demo/sample.txt ./sample.txt
~~~

**风险：** 示例路径可能存放真实数据。下载到本地会创建额外数据副本，不要上传公开 GitHub 仓库。

## HDFS 容量与健康

~~~bash
hdfs dfsadmin -report
hdfs getconf -namenodes
hdfs getconf -confKey fs.defaultFS
~~~

dfsadmin 通常需要管理权限；别将单个 DataNode 的数据占用直接当成全局逻辑数据量。

## YARN 应用

~~~bash
yarn application -list
yarn application -list -appStates RUNNING
~~~

定位某个应用前先确定实际 Application ID、Queue 和用户，再到 ResourceManager UI 或聚合日志核对失败原因。

## 不推荐盲目操作

hdfs dfs -rm -r、hdfs balancer、yarn application -kill 以及权限更改都可能影响集群服务；先确认授权、HA 状态、目标路径和业务影响。

## 官方参考

- [命令文档](https://hadoop.apache.org/docs/current/)

*命令需根据实际系统版本、授权和部署方式确认。*
