---
title: "Linux｜文件、进程、网络与日志"
description: "Linux 巡检、文本处理、服务状态、网络诊断及磁盘占用。"
category: "系统与终端"
order: 10
keywords: ["linux","journalctl","systemctl","ss","df","du","find","grep","tail","curl"]
updated: 2026-10-22
source: "https://man7.org/linux/man-pages/"
---


> 示例主要适用于 Linux 服务器和 WSL2 Ubuntu。涉及 /var/log、systemd 等命令时需考虑容器环境差异和用户权限。

## 主机与资源

~~~bash
uname -a
cat /etc/os-release
uptime
free -h
df -hT
~~~

磁盘空间、文件系统类型、内存和平均负载用于建立排障基线。

~~~bash
du -sh /var/log/*
ps aux --sort=-%mem | head -n 15
top
~~~

du 对大量小文件目录可能产生较高 IO；先缩小路径。ps 与 top 的进程权限和容器可见性可能不同。

## 日志与进程

~~~bash
journalctl -u docker --since "1 hour ago" --no-pager
systemctl status docker
tail -n 100 /var/log/syslog
~~~

WSL2 和容器中不一定有 syslog；journalctl 需要 systemd 及对应权限。不要把含个人信息的日志原样发布。

## 文本与文件

~~~bash
find /var/log -type f -name "*.log" -mtime -2
grep -RIn --include="*.log" "ERROR" ./logs
sed -n '1,80p' ./app.log
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head
~~~

对大型日志避免无边界 grep -R；使用具体目录、文件名与时间窗口。

## 网络与 HTTP

~~~bash
ip -br addr
ip route
ss -lntp
curl -I --max-time 5 https://example.com
getent hosts example.com
~~~

ss -p 显示进程信息可能需要权限。GET/POST 的请求语义不同，curl -I 仅查询响应头。

## 危险操作提醒

不要把 rm -rf、chmod -R 777、kill -9 或覆盖系统文件当成常规排障动作；删除和权限更改需要先确认路径、影响与备份。

## 官方参考

- [命令文档](https://man7.org/linux/man-pages/)

*需根据实际系统版本、权限和运行环境验证。*
