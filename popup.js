const render = (baseUrls) => {
  const list = document.getElementById('urlList');
  list.innerHTML = '';
  for (const url of baseUrls) {
    const item = document.createElement('div');
    item.className = 'url-item';
    item.innerHTML = `<span>${url}</span><button class="remove-btn" data-url="${url}">&times;</button>`;
    list.appendChild(item);
  }
  document.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const urls = baseUrls.filter((u) => u !== btn.dataset.url);
      chrome.storage.sync.set({ baseUrls: urls }, () => render(urls));
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const newUrl = document.getElementById('newUrl');
  const addBtn = document.getElementById('addBtn');

  chrome.storage.sync.get('baseUrls', (items) => {
    render(items.baseUrls || []);
  });

  addBtn.addEventListener('click', () => {
    const url = newUrl.value.trim();
    if (!url) return;
    chrome.storage.sync.get('baseUrls', (items) => {
      const urls = items.baseUrls || [];
      if (urls.includes(url)) return;
      urls.push(url);
      chrome.storage.sync.set({ baseUrls: urls }, () => {
        render(urls);
        newUrl.value = '';
      });
    });
  });

  newUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });
});
