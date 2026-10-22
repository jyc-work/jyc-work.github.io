---
title: "containerd｜ctr、nerdctl、crictl"
description: "区分 containerd 调试工具、Docker 兼容 CLI 与 Kubernetes CRI 排查命令。"
category: "容器与编排"
order: 22
keywords: ["containerd","ctr","nerdctl","crictl","k8s.io","namespace"]
updated: 2026-10-22
source: "https://github.com/containerd/nerdctl/blob/main/docs/command-reference.md"
---


> containerd、Docker Engine 和 K8s CRI 不是同一层接口。ctr 更偏底层调试；nerdctl 接近 docker UX；crictl 操作 CRI。具体命令需与 containerd/CRI 版本匹配。

## containerd 命名空间

~~~bash
ctr namespaces list
ctr -n k8s.io images list
ctr -n k8s.io containers list
ctr -n k8s.io tasks list
~~~

Kubernetes 容器常出现在 k8s.io namespace，Docker/containerd 安装方式不同则可能不是这个值。

## nerdctl：面向开发者

~~~bash
nerdctl namespace ls
nerdctl -n k8s.io ps -a
nerdctl -n k8s.io images
nerdctl info
~~~

不是所有 Docker CLI 参数都已在 nerdctl 实现，使用前检查对应版本说明。

## crictl：Kubernetes CRI

~~~bash
crictl info
crictl ps -a
crictl pods
crictl images
~~~

crictl 需要正确的 runtime-endpoint（例如 containerd.sock）；使用系统默认端点前先核对它连到的实例。

## 三者选择

- 容器引擎底层调试：ctr。
- Docker 风格容器操作：nerdctl。
- K8s CRI 故障定位：crictl + kubectl。

生产上不要随意使用底层工具强制删除 Kubernetes 管理中的任务；这可能与 kubelet 的状态管理冲突。

## 官方参考

- [命令文档](https://github.com/containerd/nerdctl/blob/main/docs/command-reference.md)

*需根据实际系统版本、权限和运行环境验证。*
