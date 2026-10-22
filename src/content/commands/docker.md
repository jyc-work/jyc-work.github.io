---
title: "Docker｜容器、日志、镜像与 Compose"
description: "Docker 日常开发与故障诊断命令：状态、日志、资源、网络、服务。"
category: "容器与编排"
order: 20
keywords: ["docker ps","docker logs","docker exec","docker inspect","docker stats","docker compose"]
updated: 2026-10-22
source: "https://docs.docker.com/reference/cli/docker/"
---


> 连接到正确的 Docker Engine 后再操作。命令中的 my-container、my-service 均为示例。

## 容器状态与日志

~~~bash
docker version
docker info
docker ps -a
docker logs --tail 100 --timestamps my-container
docker logs --since 10m -f my-container
~~~

logs -f 会持续跟随日志，按 Ctrl+C 结束客户端跟随，并不会停止容器。日志中可能包含 Token 或个人信息。

## 容器排障

~~~bash
docker inspect my-container
docker stats --no-stream
docker exec -it my-container sh
docker port my-container
~~~

部分镜像没有 bash，优先尝试 sh；exec 命令只会在容器主进程正常运行期间执行。

## 镜像、磁盘与网络

~~~bash
docker image ls
docker system df
docker network ls
docker network inspect bridge
~~~

注意 Docker 网络名称可能不是 bridge，Compose 会创建独立网络。

## Compose 运行状态

~~~bash
docker compose ps
docker compose logs --tail=100 my-service
docker compose config
~~~

compose config 会展开环境变量并可能把敏感配置信息打印到终端，保存或分享前务必审查。

## 风险操作

不要在生产环境随手执行 docker system prune -a --volumes；删除镜像、容器或持久卷可能破坏数据。运行、重启、停止容器前也要确认依赖、维护窗口与回滚方案。

## 官方参考

- [命令文档](https://docs.docker.com/reference/cli/docker/)

*需根据实际系统版本、权限和运行环境验证。*
