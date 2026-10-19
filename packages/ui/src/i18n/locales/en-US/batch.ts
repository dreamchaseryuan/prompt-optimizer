const messages = {
  "batch": {
    "title": "Batch Optimization",
    "subtitle": "Optimize multiple prompts in one run and review results item by item",
    "back": "Back to workspace",
    "configTitle": "Optimization settings",
    "modeLabel": "Target",
    "mode": {
      "system": "System prompt",
      "user": "User prompt"
    },
    "templateLabel": "Optimize template",
    "modelLabel": "Optimize model",
    "modelPlaceholder": "Select a model",
    "inputTitle": "Prompt list",
    "inputPlaceholder": "Separate prompts with a blank line (each prompt may span multiple lines)\n\nExample:\nWrite a sorting function\n\nMake this intro sound more professional",
    "entryCount": "{count} entries",
    "maxEntriesHint": "At most {max} entries per batch; extras will be ignored",
    "clearInput": "Clear input",
    "loadExample": "Load example",
    "example": {
      "line1": "Write a quicksort function with a time-complexity explanation",
      "line2": "Rewrite this product intro professionally: this software is nice and full-featured.",
      "line3": "Write a Git beginner guide focusing on branching and merging"
    },
    "start": "Start batch",
    "running": "Optimizing…",
    "stop": "Stop (after current item)",
    "summary": "Done {done} · Failed {failed} · Total {total}",
    "doneToast": "Batch finished: {done} succeeded, {failed} failed",
    "noEntries": "Enter at least one prompt first",
    "resultsTitle": "Results",
    "copyAll": "Copy all",
    "exportJson": "Export JSON",
    "clearResults": "Clear results",
    "copy": "Copy",
    "copied": "Copied to clipboard",
    "copyFailed": "Copy failed",
    "noOutputYet": "No output yet",
    "emptyResults": "Results will appear here item by item once you start a batch"
  }
} as const;

export default messages;
