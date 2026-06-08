# Jira Copy

A lightweight Chrome extension that lets you copy Jira ticket key, summary, and URL with a single right-click. No build step required.

## Features

- **Right-click context menu** on any configured Jira page with 6 format options

| Format                | Example Output                                         |
| --------------------- | ------------------------------------------------------ |
| `<Key>`               | `PROJ-123`                                             |
| `<Key> Summary`       | `PROJ-123 Fix login bug`                               |
| `<Key> Summary Url`   | `PROJ-123 Fix login bug https://your-domain.atlassian.net/browse/PROJ-123` |
| `[<Key>]`             | `[PROJ-123]`                                           |
| `[<Key>] Summary`     | `[PROJ-123] Fix login bug`                             |
| `[<Key>] Summary Url` | `[PROJ-123] Fix login bug https://your-domain.atlassian.net/browse/PROJ-123` |

- **Configurable base URLs** — choose which Jira instances the extension activates on
- **Visual toast notification** on copy (blue bar, auto-fades after 2 seconds)
- **Automatic extraction** of ticket key (from URL) and summary (from DOM)

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/konaspr/chrome-jira-copy.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the extension folder
5. Click the extension icon, add your Jira instance URL(s), and you're done

## Usage

1. Open the extension popup and add your Jira base URL (e.g. `https://your-domain.atlassian.net`)
2. Navigate to any Jira ticket page
3. Right-click → **Jira Copy** → choose your format
4. Paste the copied text wherever you need it

## Permissions

| Permission      | Reason                                         |
| --------------- | ---------------------------------------------- |
| `clipboardWrite`| Copy formatted text to clipboard               |
| `storage`       | Persist configured Jira URLs                   |
| `contextMenus`  | Add right-click context menu items             |
| `activeTab`     | Read current tab URL and page content          |
| `scripting`     | Inject script for summary extraction and copy  |

## Files

```
├── manifest.json    # Extension manifest (v3)
├── background.js    # Service worker — context menus, extraction, copy
├── popup.html       # Popup UI
├── popup.js         # Popup logic — manage Jira URLs
├── styles.css       # Popup styling
└── icons/           # Extension icons (16, 48, 128 px)
```

## License

MIT
