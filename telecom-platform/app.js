function getData() {
  return window.PLATFORM_DATA;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isBlockVisible(blockId) {
  const hidden = getData().ui?.hiddenBlocks;
  return !hidden || !hidden.includes(blockId);
}

function editAttrs(path, type) {
  if (!window.EDIT_MODE) return '';
  return ` data-edit-path="${path}" data-edit-type="${type}"`;
}

const ICONS = {
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  building: 'M4 21V5a1 1 0 0 1 1-1h6v17H4Zm8 0h7V9a1 1 0 0 0-1-1h-6v13ZM7 8h2M7 12h2M7 16h2M15 12h2M15 16h2',
  user: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14Z',
  cube: 'M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 4 6.5 3.2L12 13.5 5.5 10.2 12 7Zm-6.5 5.3L11 15.6V20l-5.5-2.7v-5Zm13 0V17.3L13 20v-4.4l5.5-3.3Z',
  userPlus: 'M15 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9v-1.5C8 16 11 14 15 14s7 2 7 4.5V20M4 11h6M7 8v6',
  star: 'M12 3.5 14.6 9l6 .9-4.3 4.2 1 5.9L12 17.3 6.7 20l1-5.9L3.4 9.9 9.4 9 12 3.5Z',
  settings: 'M12 15.5A3.5 3.5 0 1 0 8.5 12 3.5 3.5 0 0 0 12 15.5ZM4.5 10.2l1.7-.3.8-1.5-1.1-1.3 1.4-1.4 1.3 1.1 1.5-.8.3-1.7h2l.3 1.7 1.5.8 1.3-1.1 1.4 1.4-1.1 1.3.8 1.5 1.7.3v2l-1.7.3-.8 1.5 1.1 1.3-1.4 1.4-1.3-1.1-1.5.8-.3 1.7h-2l-.3-1.7-1.5-.8-1.3 1.1-1.4-1.4 1.1-1.3-.8-1.5-1.7-.3v-2Z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  search: 'M11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Zm10 3-4.3-4.3',
  card: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm-1 4h18',
  spark: 'M12 3v4M12 17v4M4.9 6.3l2.8 2.8M16.3 14.9l2.8 2.8M3 12h4M17 12h4M4.9 17.7l2.8-2.8M16.3 9.1l2.8-2.8',
  cart: 'M6 7h15l-1.5 8H8L6 7Zm0 0L5 4H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  plug: 'M8 7V3M16 7V3M7 7h10v5a5 5 0 0 1-10 0V7Zm5 10v4',
  shield: 'M12 3 5 6v6c0 5 3.2 7.8 7 9 3.8-1.2 7-4 7-9V6l-7-3Z',
  wallet: 'M4 7h16v12H4V7Zm0 0 2.5-3H17L20 7M15 13h3',
  chart: 'M4 19h16M7 16v-5M12 16V8M17 16v-8',
  flask: 'M9 3h6M10 3v5L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19L14 8V3',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-8-9h16M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 16h2',
  monitor: 'M4 5h16v11H4V5Zm0 11 2 4h12l2-4',
  chat: 'M5 5h14v10H8l-3 3V5Z',
  more: 'M6 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Zm7.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM21 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z',
  shop: 'M4 8h16l-1 11H5L4 8Zm0 0 1.5-4h13L20 8M9 12v4M15 12v4',
  headset: 'M5 13v-2a7 7 0 0 1 14 0v2M5 13v5h3v-5H5Zm11 0v5h3v-5h-3Zm-6 6h4',
};

function icon(name, cls) {
  const d = ICONS[name] || ICONS.cube;
  return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

const RELATED = {
  discovery: { journeys: ['j1', 'j2'], caps: ['cat', 'nav', 'cards'], channels: ['web', 'lk'] },
  sales: { journeys: ['j3'], caps: ['cart', 'pay'], channels: ['web', 'lk'] },
};

const state = {
  selectedDomain: null,
  selectedJourney: null,
  selectedCap: null,
  selectedChannel: null,
};

function layerById(id) {
  return getData().center.layers.find((l) => l.id === id);
}

function isDimmed(kind, id) {
  if (window.EDIT_MODE) return false;
  const d = state.selectedDomain;
  if (d && RELATED[d]) {
    if (kind === 'domain') return id !== d;
    if (kind === 'journey') return !(RELATED[d].journeys || []).includes(id);
    if (kind === 'cap') return !RELATED[d].caps.includes(id);
    if (kind === 'channel') return !RELATED[d].channels.includes(id);
  }
  if (state.selectedJourney && kind === 'journey') return id !== state.selectedJourney;
  if (state.selectedCap && kind === 'cap') return id !== state.selectedCap;
  if (state.selectedChannel && kind === 'channel') return id !== state.selectedChannel;
  return false;
}

function relatedIds(kind) {
  const rel = state.selectedDomain && RELATED[state.selectedDomain];
  if (!rel || window.EDIT_MODE) return [];
  if (kind === 'journey') return rel.journeys || [];
  if (kind === 'cap') return rel.caps || [];
  if (kind === 'channel') return rel.channels || [];
  return [];
}

function itemClass(base, kind, id, extra) {
  const active = (kind === 'domain' && state.selectedDomain === id)
    || (kind === 'journey' && state.selectedJourney === id)
    || (kind === 'cap' && state.selectedCap === id)
    || (kind === 'channel' && state.selectedChannel === id)
    || relatedIds(kind).includes(id);
  return `${base} ${extra || ''} ${active ? 'active' : ''} ${isDimmed(kind, id) ? 'dimmed' : ''}`.trim();
}

function listItems(items, path, extraClass) {
  return `<ul class="${extraClass || 'bullet-list'}">${items.map((item, i) => (
    `<li${editAttrs(`${path}.${i}`, 'text')}>${escapeHtml(item)}</li>`
  )).join('')}</ul>`;
}

function renderHero(D) {
  return `
    <section class="hero" ${editAttrs('ui.blocks.hero', 'block')}>
      <div>
        <h2 class="hero-title"${editAttrs('pageTitle', 'text')}>${escapeHtml(D.pageTitle)}</h2>
        <p class="hero-sub"${editAttrs('pageSubtitle', 'text')}>${escapeHtml(D.pageSubtitle)}</p>
        <p class="hero-mission"${editAttrs('mission', 'text')}>${escapeHtml(D.mission)}</p>
      </div>
      <div class="value-box">
        <div class="value-title">${icon('target')}<span${editAttrs('value.title', 'text')}>${escapeHtml(D.value.title)}</span></div>
        <div class="value-cols">
          <div class="value-col" data-add="value.client.items">
            <h3>${icon('user')}<span${editAttrs('value.client.title', 'text')}>${escapeHtml(D.value.client.title)}</span></h3>
            ${listItems(D.value.client.items, 'value.client.items')}
          </div>
          <div class="value-col" data-add="value.business.items">
            <h3>${icon('building')}<span${editAttrs('value.business.title', 'text')}>${escapeHtml(D.value.business.title)}</span></h3>
            ${listItems(D.value.business.items, 'value.business.items')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSide(side, cls, iconName) {
  const root = side.id === 'business' ? 'left' : 'right';
  const firstKey = side.provides ? 'provides' : 'uses';
  const first = side.provides || side.uses;
  return `
    <aside class="side ${cls}" ${editAttrs(`ui.blocks.${side.id}`, 'block')}>
      <div class="side-head">
        ${icon(iconName, 'icon-lg')}
        <div>
          <h2${editAttrs(`${root}.title`, 'text')}>${escapeHtml(side.title)}</h2>
          <p${editAttrs(`${root}.subtitle`, 'text')}>${escapeHtml(side.subtitle)}</p>
        </div>
      </div>
      <div class="side-block" data-add="${root}.${firstKey}.items">
        <h3${editAttrs(`${root}.${firstKey}.title`, 'text')}>${escapeHtml(first.title)}</h3>
        ${listItems(first.items, `${root}.${firstKey}.items`)}
      </div>
      <div class="side-block" data-add="${root}.results.items">
        <h3${editAttrs(`${root}.results.title`, 'text')}>${escapeHtml(side.results.title)}</h3>
        ${listItems(side.results.items, `${root}.results.items`, 'check-list')}
      </div>
    </aside>
  `;
}

function renderDomains(layer) {
  return `
    <div class="domains">
      ${layer.items.map((item) => {
        const interactive = Boolean(RELATED[item.id]);
        const cls = itemClass('domain-card', 'domain', item.id, `tone-${item.tone || 'blue'}${interactive ? '' : ' static'}`);
        const inner = `
          ${icon(item.icon)}
          <h3${editAttrs(`center.layers.domains.items.${item.id}.title`, 'text')}>${escapeHtml(item.title)}</h3>
          <div class="sub"${editAttrs(`center.layers.domains.items.${item.id}.subtitle`, 'text')}>${escapeHtml(item.subtitle)}</div>
          <div class="detail"${editAttrs(`center.layers.domains.items.${item.id}.detail`, 'text')}>${escapeHtml(item.detail)}</div>
        `;
        if (!interactive) {
          return `<div class="${cls}"${editAttrs(`center.layers.domains.items.${item.id}`, 'domain')}>${inner}</div>`;
        }
        return `<button type="button" class="${cls}" data-domain="${item.id}"${editAttrs(`center.layers.domains.items.${item.id}`, 'domain')}>${inner}</button>`;
      }).join('')}
    </div>
  `;
}

function renderJourneys(layer) {
  return `
    <div class="journeys">
      ${layer.items.map((item, i) => `
        ${i ? '<span class="journey-arrow">→</span>' : ''}
        <button type="button" class="${itemClass('journey-step', 'journey', item.id)}" data-journey="${item.id}"${editAttrs(`center.layers.journeys.items.${item.id}`, 'journey')}>${escapeHtml(item.label)}</button>
      `).join('')}
    </div>
  `;
}

function renderCaps(layer) {
  return `
    <div class="caps">
      ${layer.items.map((item) => `
        <button type="button" class="${itemClass('cap', 'cap', item.id)}" data-cap="${item.id}"${editAttrs(`center.layers.capabilities.items.${item.id}`, 'capability')}>
          ${icon(item.icon)}<span>${escapeHtml(item.label)}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderChannels(layer) {
  return `
    <div class="channels">
      ${layer.items.map((item) => `
        <button type="button" class="${itemClass('channel', 'channel', item.id)}" data-channel="${item.id}"${editAttrs(`center.layers.channels.items.${item.id}`, 'channel')}>
          ${icon(item.icon)}<span>${escapeHtml(item.label)}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderLayerBody(layer) {
  if (layer.id === 'domains') return renderDomains(layer);
  if (layer.id === 'journeys') return renderJourneys(layer);
  if (layer.id === 'capabilities') return renderCaps(layer);
  if (layer.id === 'channels') return renderChannels(layer);
  return '';
}

function renderCore(D) {
  return `
    <section class="core" ${editAttrs('ui.blocks.center', 'block')}>
      <div class="core-head">
        ${icon('cube', 'icon-lg')}
        <div>
          <h2${editAttrs('center.title', 'text')}>${escapeHtml(D.center.title)}</h2>
          <p${editAttrs('center.subtitle', 'text')}>${escapeHtml(D.center.subtitle)}</p>
        </div>
      </div>
      <div class="core-body">
        ${D.center.layers.map((layer) => `
          <section class="layer" ${editAttrs(`center.layers.${layer.id}`, 'layer')}>
            <div class="layer-head">
              <span class="layer-num">${escapeHtml(layer.number)}.</span>
              <strong${editAttrs(`center.layers.${layer.id}.title`, 'text')}>${escapeHtml(layer.title)}</strong>
              <span class="layer-en"${editAttrs(`center.layers.${layer.id}.enTitle`, 'text')}>(${escapeHtml(layer.enTitle)})</span>
            </div>
            ${renderLayerBody(layer)}
          </section>
        `).join('')}
      </div>
    </section>
  `;
}

function renderNamedList(key, label) {
  const block = getData()[key];
  if (!block) return '';
  if (!isBlockVisible(key)) return hiddenStrip(key, label);
  return `
    <section class="metrics" data-add="${key}.items" ${editAttrs(`ui.blocks.${key}`, 'block')}>
      <div class="metrics-title"${editAttrs(`${key}.title`, 'text')}>${escapeHtml(block.title)}</div>
      ${listItems(block.items, `${key}.items`)}
    </section>
  `;
}

function renderMetrics(D) {
  return `
    <section class="metrics" ${editAttrs('ui.blocks.metrics', 'block')}>
      <div class="metrics-title"${editAttrs('metrics.title', 'text')}>${escapeHtml(D.metrics.title)}</div>
      <div class="metrics-grid">
        ${D.metrics.columns.map((col) => `
          <div class="metric-col" ${editAttrs(`metrics.columns.${col.id}`, 'metric')}>
            <h3>${icon(col.icon)}<span${editAttrs(`metrics.columns.${col.id}.title`, 'text')}>${escapeHtml(col.title)}</span></h3>
            ${listItems(col.items, `metrics.columns.${col.id}.items`, col.id === 'outcome' ? 'bullet-list' : 'bullet-list')}
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function statusText() {
  const D = getData();
  if (state.selectedDomain) {
    const item = layerById('domains')?.items.find((i) => i.id === state.selectedDomain);
    const rel = RELATED[state.selectedDomain];
    if (!item) return D.ui.statusDefault;
    if (!rel) return `${item.title}: ${item.detail}`;
    const labels = (layerId, ids) => (layerById(layerId)?.items || [])
      .filter((entry) => ids.includes(entry.id))
      .map((entry) => entry.label || entry.title)
      .join(', ');
    return `${item.title}: ${labels('journeys', rel.journeys || [])}; ${labels('capabilities', rel.caps || [])}; ${labels('channels', rel.channels || [])}`;
  }
  if (state.selectedJourney) {
    const item = layerById('journeys')?.items.find((i) => i.id === state.selectedJourney);
    return item ? `Сценарий: ${item.label}` : D.ui.statusDefault;
  }
  if (state.selectedCap) {
    const item = layerById('capabilities')?.items.find((i) => i.id === state.selectedCap);
    return item ? `Capability: ${item.label}` : D.ui.statusDefault;
  }
  if (state.selectedChannel) {
    const item = layerById('channels')?.items.find((i) => i.id === state.selectedChannel);
    return item ? `Канал: ${item.label}` : D.ui.statusDefault;
  }
  return D.ui.statusDefault;
}

function renderPageMeta() {
  const D = getData();
  const title = document.getElementById('page-title');
  const sub = document.getElementById('page-subtitle');
  title.textContent = D.pageTitle;
  sub.textContent = D.pageSubtitle;
  document.title = D.pageTitle;
  if (window.EDIT_MODE) {
    title.setAttribute('data-edit-path', 'pageTitle');
    title.setAttribute('data-edit-type', 'text');
    sub.setAttribute('data-edit-path', 'pageSubtitle');
    sub.setAttribute('data-edit-type', 'text');
  }
  document.getElementById('status-bar').textContent = statusText();
}

function renderToolbar() {
  const el = document.getElementById('toolbar');
  const hasSel = state.selectedDomain || state.selectedJourney || state.selectedCap || state.selectedChannel;
  el.innerHTML = `
    ${window.EDIT_MODE ? '' : '<a class="btn" href="?edit=1">WYSIWYG</a>'}
    ${hasSel ? '<button type="button" class="btn ghost" id="reset-btn">Сбросить выбор</button>' : ''}
  `;
}

function hiddenStrip(blockId, label) {
  if (isBlockVisible(blockId) || !window.EDIT_MODE) return '';
  return `<div class="hidden-block-strip">Скрыт блок «${escapeHtml(label)}»</div>`;
}

function render() {
  const D = getData();
  renderPageMeta();
  renderToolbar();

  const hero = isBlockVisible('hero') ? renderHero(D) : hiddenStrip('hero', 'Шапка');
  const left = isBlockVisible('business') ? renderSide(D.left, 'side-left', 'building') : hiddenStrip('business', 'Telecom Business');
  const right = isBlockVisible('client') ? renderSide(D.right, 'side-right', 'user') : hiddenStrip('client', 'Клиент');
  const core = isBlockVisible('center') ? renderCore(D) : hiddenStrip('center', 'Платформа');
  const metrics = isBlockVisible('metrics') ? renderMetrics(D) : hiddenStrip('metrics', 'Метрики');
  const zones = renderNamedList('zones', 'Зоны ответственности');
  const tobe = renderNamedList('tobe', 'Куда хотим');

  document.getElementById('diagram').innerHTML = `
    ${hero}
    ${zones}
    <div class="stage">
      ${left}
      <div class="v-arrow"${editAttrs('left.arrow', 'text')}>${escapeHtml(D.left.arrow)}</div>
      ${core}
      <div class="v-arrow"${editAttrs('right.arrow', 'text')}>${escapeHtml(D.right.arrow)}</div>
      ${right}
    </div>
    ${metrics}
    ${tobe}
  `;

  if (window.PlatformEditor) window.PlatformEditor.afterRender();
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function bindEvents() {
  document.body.addEventListener('click', (e) => {
    if (window.EDIT_MODE && e.target.closest('[data-edit-path]') && !e.target.closest('.edit-panel, .edit-toolbar')) {
      return;
    }
    if (e.target.closest('#reset-btn')) {
      setState({ selectedDomain: null, selectedJourney: null, selectedCap: null, selectedChannel: null });
      return;
    }
    const staticCard = e.target.closest('.domain-card.static');
    if (staticCard) {
      setState({ selectedDomain: null, selectedJourney: null, selectedCap: null, selectedChannel: null });
      return;
    }
    const domain = e.target.closest('[data-domain]');
    if (domain) {
      const id = domain.dataset.domain;
      if (!RELATED[id]) {
        setState({ selectedDomain: null, selectedJourney: null, selectedCap: null, selectedChannel: null });
        return;
      }
      setState({
        selectedDomain: state.selectedDomain === id ? null : id,
        selectedJourney: null,
        selectedCap: null,
        selectedChannel: null,
      });
      return;
    }
    const journey = e.target.closest('[data-journey]');
    if (journey) {
      setState({
        selectedJourney: state.selectedJourney === journey.dataset.journey ? null : journey.dataset.journey,
        selectedDomain: null,
        selectedCap: null,
        selectedChannel: null,
      });
      return;
    }
    const cap = e.target.closest('[data-cap]');
    if (cap) {
      setState({
        selectedCap: state.selectedCap === cap.dataset.cap ? null : cap.dataset.cap,
        selectedDomain: null,
        selectedJourney: null,
        selectedChannel: null,
      });
      return;
    }
    const channel = e.target.closest('[data-channel]');
    if (channel) {
      setState({
        selectedChannel: state.selectedChannel === channel.dataset.channel ? null : channel.dataset.channel,
        selectedDomain: null,
        selectedJourney: null,
        selectedCap: null,
      });
    }
  });
}

window.PlatformApp = {
  render,
  getData,
  setState,
  layerById,
};

bindEvents();
render();
