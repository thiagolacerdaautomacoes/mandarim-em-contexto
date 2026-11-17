export function openStudyPage() {
  void chrome.tabs.create({
    url: chrome.runtime.getURL("tabs/study.html")
  })
}
