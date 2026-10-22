---
title: "Kubernetes｜kubectl 故障排查"
description: "K8s 上下文、Pod、Deployment、事件、日志、指标及服务连通性检查。"
category: "容器与编排"
order: 21
keywords: ["kubectl","kubectl logs","kubectl describe","kubectl get pods","K8s","deployment","events"]
updated: 2026-10-22
source: "https://kubernetes.io/docs/reference/kubectl/quick-reference/"
---


> **先确认集群与 namespace。** kubectl 使用当前 kubeconfig 上下文，误连生产环境的代价可能很高。以下 demo 为测试 namespace。

## 确认环境与资源

~~~bash
kubectl config current-context
kubectl config get-contexts
kubectl get namespaces
kubectl get pods -n demo -o wide
kubectl get deployments -n demo
~~~

使用 -n 显式指定命名空间，减少跨环境误操作。

## Pod 无法运行

~~~bash
kubectl describe pod my-pod -n demo
kubectl logs my-pod -n demo --tail=100
kubectl logs my-pod -n demo --previous --tail=100
kubectl get events -n demo --sort-by=.metadata.creationTimestamp
~~~

previous 适用于重启过的容器实例；多容器 Pod 需加 -c 指定容器。describe 事件可以辅助区分调度、镜像、探针和资源问题。

## 服务与 Deployment

~~~bash
kubectl get svc -n demo
kubectl get endpointslices -n demo
kubectl rollout status deployment/my-app -n demo
kubectl get deployment my-app -n demo -o yaml
~~~

yaml 可能包含环境变量与敏感配置，不要把原始输出粘贴到公开站点。

## 资源观察

~~~bash
kubectl top pods -n demo
kubectl top nodes
kubectl get pod my-pod -n demo -o jsonpath='{.status.phase}'
~~~

kubectl top 依赖 metrics-server 等指标 API；无指标不代表资源消耗为零。

## 权限与安全

~~~bash
kubectl auth can-i get pods -n demo
kubectl auth can-i update deployments -n demo
~~~

这是当前身份的权限自查。kubectl delete、rollout restart、scale 等变更操作需单独审批。

## 官方参考

- [命令文档](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

*需根据实际系统版本、权限和运行环境验证。*
