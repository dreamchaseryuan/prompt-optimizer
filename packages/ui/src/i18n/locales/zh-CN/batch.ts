const messages = {
  "batch": {
    "title": "批量优化",
    "subtitle": "一次优化多条提示词，逐条查看结果",
    "back": "返回工作区",
    "configTitle": "优化配置",
    "modeLabel": "优化对象",
    "mode": {
      "system": "系统提示词",
      "user": "用户提示词"
    },
    "templateLabel": "优化模板",
    "modelLabel": "优化模型",
    "modelPlaceholder": "选择模型",
    "inputTitle": "提示词列表",
    "inputPlaceholder": "每条提示词之间用空行分隔（单条可多行）\n\n例如：\n帮我写一个排序函数\n\n帮我把这段介绍改得更专业",
    "entryCount": "{count} 条",
    "maxEntriesHint": "单批最多 {max} 条，超出部分将被忽略",
    "clearInput": "清空输入",
    "loadExample": "填入示例",
    "example": {
      "line1": "帮我写一个快速排序函数，附上时间复杂度说明",
      "line2": "把这段产品介绍改写得更专业：这款软件很好用，功能很全。",
      "line3": "为新手写一份 Git 入门指南，重点讲清楚分支与合并"
    },
    "start": "开始批量优化",
    "running": "优化中…",
    "stop": "停止（当前条完成后）",
    "summary": "完成 {done} · 失败 {failed} · 共 {total}",
    "doneToast": "批量优化完成：成功 {done} 条，失败 {failed} 条",
    "noEntries": "请先输入至少一条提示词",
    "resultsTitle": "结果",
    "copyAll": "复制全部",
    "exportJson": "导出 JSON",
    "clearResults": "清空结果",
    "copy": "复制",
    "copied": "已复制到剪贴板",
    "copyFailed": "复制失败",
    "noOutputYet": "尚未产生输出",
    "emptyResults": "点击「开始批量优化」后，结果将逐条显示在这里"
  }
} as const;

export default messages;
