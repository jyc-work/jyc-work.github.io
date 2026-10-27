---
title: "前端状态机与 API 错误处理：写出可验收的数据页面"
description: "从 loading、success、empty、error 四种状态设计页面，并验证失败和取消路径。"
date: 2026-10-27
track: fullstack
order: 1
level: 进阶
duration: "60–90 分钟"
tags: ["TypeScript", "Frontend", "API"]
source: "https://github.com/fullstack-hy2020/fullstack-hy2020.github.io"
---

## 页面不只有“加载出来”与“加载不出来”

在可维护的全栈产品中，页面至少应区分：尚未请求、请求中、成功有数据、成功但为空、失败。这些状态决定视觉反馈、重试按钮、无数据提示和后端故障排查路径。

把所有状态塞进一个 `isLoading` 布尔值，很容易产生“加载结束但仍然一片空白”的不确定 UI。

## 用 TypeScript 判别联合建模

```typescript
type Item = { id: string; title: string };
type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; items: Item[] }
  | { kind: 'error'; message: string };

function describe(state: LoadState): string {
  switch (state.kind) {
    case 'idle': return '等待请求';
    case 'loading': return '正在加载';
    case 'error': return '错误：' + state.message;
    case 'success':
      return state.items.length === 0 ? '暂无数据' :
        '已获得 ' + state.items.length + ' 条记录';
  }
}
console.assert(describe({kind:'success',items:[]})==='暂无数据');
```

可以把 `LoadState` 放进 React `useState`，但这个类型建模不依赖 React：它用于强制所有分支拿到正确字段，减少在加载中读取 `items.length` 的错误。

## 网络请求与取消

调用 `fetch` 时必须区分 HTTP 非 2xx 与网络异常。可使用 `AbortController` 在组件卸载或输入条件变化时取消过时请求，并避免旧结果覆盖新结果。

```typescript
async function loadItems(signal: AbortSignal): Promise<Item[]> {
  const response = await fetch('/api/items', { signal });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error('invalid payload');
  return payload.map((x: any) => {
    if (!x || typeof x.id !== 'string' || typeof x.title !== 'string')
      throw new Error('invalid item');
    return {id:x.id,title:x.title};
  });
}
```

教学代码为简洁起见使用了临时 `any` 来读取 JSON；真实项目推荐使用 Zod 或显式类型守卫校验不可信响应。若要上线，应还要处理分页、鉴权以及可观测性事件。

## 响应式和可访问性

页面应设置语义标题，并使用 `role="status"` 或 `aria-live` 告知异步状态。失败按钮要可键盘操作；布局需要在 320px、390px 等宽度检查溢出；遵从系统的减少动画偏好。

## 实践与验收

选择一个本地 mock API，分别模拟：200 + 3 条、200 + 空数组、500、连接超时、延迟响应与两次连续查询。在 Playwright 中断言每种情形的页面文本和按钮可用性。

**验收**：组件状态图、独立的 API 客户端、六个自动化测试和移动端截图。参考 [Full Stack Open](https://github.com/fullstack-hy2020/fullstack-hy2020.github.io)，不依赖复制课程答案。
