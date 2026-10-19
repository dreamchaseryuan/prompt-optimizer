const messages = {
  "batch": {
    "title": "批次優化",
    "subtitle": "一次優化多條提示詞，逐條檢視結果",
    "back": "返回工作區",
    "configTitle": "優化設定",
    "modeLabel": "優化對象",
    "mode": {
      "system": "系統提示詞",
      "user": "使用者提示詞"
    },
    "templateLabel": "優化範本",
    "modelLabel": "優化模型",
    "modelPlaceholder": "選擇模型",
    "inputTitle": "提示詞清單",
    "inputPlaceholder": "每條提示詞之間用空行分隔（單條可多行）\n\n例如：\n幫我寫一個排序函式\n\n幫我把這段介紹改得更專業",
    "entryCount": "{count} 條",
    "maxEntriesHint": "單批最多 {max} 條，超出部分將被忽略",
    "clearInput": "清空輸入",
    "loadExample": "填入範例",
    "example": {
      "line1": "幫我寫一個快速排序函式，附上時間複雜度說明",
      "line2": "把這段產品介紹改寫得更專業：這款軟體很好用，功能很全。",
      "line3": "為新手寫一份 Git 入門指南，重點講清楚分支與合併"
    },
    "start": "開始批次優化",
    "running": "優化中…",
    "stop": "停止（目前條完成後）",
    "summary": "完成 {done} · 失敗 {failed} · 共 {total}",
    "doneToast": "批次優化完成：成功 {done} 條，失敗 {failed} 條",
    "noEntries": "請先輸入至少一條提示詞",
    "resultsTitle": "結果",
    "copyAll": "複製全部",
    "exportJson": "匯出 JSON",
    "clearResults": "清空結果",
    "copy": "複製",
    "copied": "已複製到剪貼簿",
    "copyFailed": "複製失敗",
    "noOutputYet": "尚未產生輸出",
    "emptyResults": "點擊「開始批次優化」後，結果將逐條顯示在這裡"
  }
} as const;

export default messages;
