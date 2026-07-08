const FORMATS = [
  { id: 'jira-copy-key-lower', title: '<key>' },
  { id: 'jira-copy-key', title: '<Key>' },
  { id: 'jira-copy-key-summary', title: '<Key> Summary' },
  { id: 'jira-copy-key-summary-url', title: '<Key> Summary Url' },
  { id: 'jira-copy-bracket', title: '[<Key>]' },
  { id: 'jira-copy-bracket-summary', title: '[<Key>] Summary' },
  { id: 'jira-copy-bracket-summary-url', title: '[<Key>] Summary Url' },
];

const extractTicketKey = (url) => {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/browse\/([A-Z]+-\d+)/i);
    if (match) return match[1];
    const searchMatch = parsed.search.match(/[?&]issue=([A-Z]+-\d+)/i);
    if (searchMatch) return searchMatch[1];
    const globalMatch = parsed.href.match(/([A-Z]+-\d+)/);
    if (globalMatch) return globalMatch[1];
  } catch {
    return null;
  }
  return null;
};

const extractSummary = () => {
  const sel = document.querySelector(
    '[data-testid="issue.views.issue-base.foundation.summary.heading"], ' +
    '[data-testid*="issue-field-summary"], ' +
    '#summary-val'
  );
  if (sel) return sel.textContent.trim();
  const title = document.title;
  const m = title.match(/\]\s+(.+?)$/);
  if (m) return m[1].trim();
  return null;
};

const copy = (tabId, text) => {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (t) => {
      navigator.clipboard.writeText(t).then(() => {
        const el = document.createElement('div');
        el.textContent = t;
        Object.assign(el.style, {
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0052cc',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '4px',
          font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif',
          zIndex: 999999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          opacity: '0',
          transition: 'opacity 0.2s',
        });
        document.body.appendChild(el);
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        setTimeout(() => {
          el.style.opacity = '0';
          setTimeout(() => el.remove(), 200);
        }, 2000);
      }).catch(() => {});
    },
    args: [text],
  });
};

const createContextMenu = () => {
  chrome.storage.sync.get('baseUrls', (items) => {
    chrome.contextMenus.removeAll(() => {
      const urls = items.baseUrls || [];
      if (urls.length === 0) return;
      const patterns = urls.map((u) => `${u.replace(/\/+$/, '')}/*`);
      chrome.contextMenus.create({
        id: 'jira-copy-parent',
        title: 'Jira Copy',
        contexts: ['page'],
        documentUrlPatterns: patterns,
      });

      for (let i = 0; i < FORMATS.length; i++) {
        chrome.contextMenus.create({
          id: FORMATS[i].id,
          parentId: 'jira-copy-parent',
          title: FORMATS[i].title,
          contexts: ['page'],
        });

        if (i === 0) {
          chrome.contextMenus.create({
            id: 'jira-copy-sep1',
            parentId: 'jira-copy-parent',
            type: 'separator',
            contexts: ['page'],
          });
        }
        if (i === 3) {
          chrome.contextMenus.create({
            id: 'jira-copy-sep2',
            parentId: 'jira-copy-parent',
            type: 'separator',
            contexts: ['page'],
          });
        }
      }
    });
  });
};

chrome.runtime.onInstalled.addListener(createContextMenu);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.baseUrls) {
    createContextMenu();
  }
});

const handleFormatsWithSummary = async (tab, fmt, ticketKey) => {
  const needsSummary = ['jira-copy-key-summary', 'jira-copy-bracket-summary', 'jira-copy-key-summary-url', 'jira-copy-bracket-summary-url'];
  if (!needsSummary.includes(fmt.id)) return null;

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractSummary,
  });

  return results?.[0]?.result || null;
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const fmt = FORMATS.find((f) => f.id === info.menuItemId);
  if (!fmt) return;

  const ticketKey = extractTicketKey(tab.url);

  if (!ticketKey) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (msg) => alert(msg),
      args: ['Could not find a Jira ticket key in this page URL.'],
    });
    return;
  }

  handleFormatsWithSummary(tab, fmt, ticketKey).then((summary) => {
    switch (fmt.id) {
      case 'jira-copy-key-lower':
        copy(tab.id, ticketKey.toLowerCase());
        break;
      case 'jira-copy-key':
        copy(tab.id, ticketKey);
        break;
      case 'jira-copy-bracket':
        copy(tab.id, `[${ticketKey}]`);
        break;
      case 'jira-copy-key-summary':
        copy(tab.id, summary ? `${ticketKey} ${summary}` : ticketKey);
        break;
      case 'jira-copy-bracket-summary':
        copy(tab.id, summary ? `[${ticketKey}] ${summary}` : `[${ticketKey}]`);
        break;
      case 'jira-copy-key-summary-url':
        copy(tab.id, summary ? `${ticketKey} ${summary} ${tab.url}` : `${ticketKey} ${tab.url}`);
        break;
      case 'jira-copy-bracket-summary-url':
        copy(tab.id, summary ? `[${ticketKey}] ${summary} ${tab.url}` : `[${ticketKey}] ${tab.url}`);
        break;
    }
  });
});
