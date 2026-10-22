---
title: "Git｜日常协作与变更排查"
description: "Git 状态、提交历史、diff、分支、远端以及冲突前的安全检查。"
category: "版本控制"
order: 40
keywords: ["git status","git diff","git log","git branch","git fetch","git reflog"]
updated: 2026-10-22
source: "https://git-scm.com/docs"
---


> 先使用只读命令看状态和差异，再进行合并、重置或提交。不在仓库里提交密钥与受限文件。

## 改动与提交记录

~~~bash
git status --short
git diff
git diff --staged
git diff --check
git log --oneline --decorate -10
~~~

diff --check 能发现部分尾随空格和空白错误，不能替代静态检查和测试。

## 分支与远端

~~~bash
git branch -vv
git remote -v
git show --stat HEAD
git merge-base main feature/my-work
~~~

检查分支的上游和真正的共同祖先，避免合并错误分支。

## 审查文件改动

~~~bash
git diff --name-status main...HEAD
git log --oneline --all --graph --decorate -20
git blame -L 10,30 src/main/java/App.java
~~~

blame 的作用是定位演化历史，不是确认责任归属。

## 安全恢复建议

~~~bash
git reflog --date=local -10
git stash list
~~~

reflog 可帮助定位意外移动的本地引用，但恢复前应新建备份分支、保留当前工作区。

**高风险提示：** git reset --hard、git clean -fd、强推和覆写远端分支可能造成数据丢失；不要直接照着网络文章执行。

## 官方参考

- [命令文档](https://git-scm.com/docs)

*命令需根据实际系统版本、授权和部署方式确认。*
