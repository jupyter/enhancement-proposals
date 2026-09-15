/**
 * Filter DOM items on a page with a user query.
 *
 * This provides a {searchfilter} directive that you call with a DOM query selector.
 * It provides a search box for users.
 * When users type in it, anything that matched your query will be filtered.
 * 
 * SVG search icon from Lucide (https://lucide.dev), licensed under the ISC License.
 */

const PLUGIN_PATH = new URL(import.meta.url).pathname;

// Compute a POSIX relative path from `fromDir` to `toFile`.
// This is a little hack to avoid using node:path because we kept hitting
// sync/async bugs with that. There are a bunch of assumptions baked into this
// Simple function but I think it should be safe for MyST purposes.
function relativePath(fromDir, toFile) {
  const from = fromDir.split('/').filter(Boolean);
  const to = toFile.split('/').filter(Boolean);
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  const ups = Array(from.length - i).fill('..');
  return [...ups, ...to.slice(i)].join('/') || '.';
}

// --- Widget (run by the browser) ---

/** Run cleanup when the widget leaves the DOM. Usually because either:
 * 1. React clobbered it
 * 2. We've navigated pages w/ myst server active
 */
function onWidgetUnload(el, cleanup) {
  let called = false;
  function runOnce() {
    if (called) return;
    called = true;
    watcher.disconnect();
    window.removeEventListener('beforeunload', runOnce);
    cleanup();
  }
  window.addEventListener('beforeunload', runOnce);
  const watcher = new MutationObserver(() => {
    if (!el.isConnected) runOnce();
  });
  watcher.observe(document.body, { childList: true, subtree: true });
}

const PARAM_KEY = 'searchfilter';

/** Sync the current filter value to the URL so users can share/bookmark a filtered view. */
function updateUrl(value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(PARAM_KEY, value);
  } else {
    url.searchParams.delete(PARAM_KEY);
  }
  history.replaceState(null, '', url);
}

/** Build the search input and wire up filtering. This is what anywidget calls. */
function render({ model, el }) {
  const selector = model.get('selector');
  // We're scoping the whole document! That is to try and be unopinionated about the
  // structure of the page, but it does mean users might shoot themselves in the foot.
  // So we try to document this danger in the example.
  const scope = document;

  // Create the search box
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;max-width:24rem;margin-bottom:1rem;';

  // From Lucide (https://lucide.dev)
  const icon = document.createElement('span');
  icon.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  icon.style.cssText =
    'position:absolute;left:0.6rem;top:50%;transform:translateY(-50%);pointer-events:none;line-height:0;';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Filter items...';
  input.style.cssText =
    'width:100%;padding:0.5rem 2rem 0.5rem 2rem;font-size:0.9rem;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;background:transparent;color:inherit;-webkit-appearance:none;appearance:none;';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = '\u00d7';
  clearBtn.title = 'Clear search';
  clearBtn.style.cssText =
    'position:absolute;right:0.4rem;top:50%;transform:translateY(-50%);border:none;background:none;font-size:1.2rem;cursor:pointer;color:#888;padding:0 0.25rem;line-height:1;';
  clearBtn.style.display = 'none';

  const noResults = document.createElement('div');
  noResults.textContent = '\u274c No items match search...';
  noResults.style.cssText = 'display:none;margin-top:0.5rem;font-size:0.9rem;color:#888;';

  /** Hide/show elements matching `selector` based on the current input value. */
  function applyFilter() {
    const query = input.value.toLowerCase();
    clearBtn.style.display = query ? '' : 'none';
    // Loop through the items we've matched and trigger them on/off
    let visible = 0;
    scope.querySelectorAll(selector).forEach((item) => {
      // This is just a simple content text search, we could definitely make it fancier...
      const show = !query || item.textContent.toLowerCase().includes(query);
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    // If we filter out all items, then show a little "no results" message
    noResults.style.display = query && visible === 0 ? '' : 'none';
    updateUrl(input.value);
  }

  input.addEventListener('input', applyFilter);

  clearBtn.addEventListener('click', () => {
    input.value = '';
    applyFilter();
  });

  // Read from the URL if the parameter exists so we can restore/share a filtered view
  const initial = new URL(window.location).searchParams.get(PARAM_KEY);
  if (initial) {
    input.value = initial;
    applyFilter();
  }

  // Clean up if we've moved pages via React so URL params and scripts don't persist
  onWidgetUnload(el, () => {
    const url = new URL(window.location);
    if (url.searchParams.has(PARAM_KEY)) {
      url.searchParams.delete(PARAM_KEY);
      history.replaceState(null, '', url);
    }
    scope.querySelectorAll(selector).forEach((item) => {
      item.style.display = '';
    });
  });

  wrapper.appendChild(icon);
  wrapper.appendChild(input);
  wrapper.appendChild(clearBtn);
  el.appendChild(wrapper);
  el.appendChild(noResults);
}

// --- Directive (aren't used in browser, just when the plugin builds locally w/ myst) ---

const searchfilterDirective = {
  name: 'searchfilter',
  doc: 'Adds a search bar that filters page elements matching a CSS selector by their text content.',
  arg: {
    type: String,
    doc: 'A CSS selector for the elements to filter (e.g. .myst-card)',
  },
  run(data, vfile) {
    const selector = (data.arg ?? '').trim();
    const fromDir = vfile.path.replace(/\/[^/]*$/, '');
    const esm = relativePath(fromDir, PLUGIN_PATH);
    return [
      {
        type: 'anywidget',
        esm,
        model: { selector },
        id: Math.random().toString(36).slice(2),
      },
    ];
  },
};

// We export *both* the directive definition *and* the render function
export default {
  name: 'searchfilter',
  directives: [searchfilterDirective],
  render,
};
