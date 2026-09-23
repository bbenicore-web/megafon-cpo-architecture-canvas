(function () {
  if (!window.EDIT_MODE || !window.PlatformApp) return;

  const DRAFT_KEY = 'telecom-picture-platform-draft';
  const { render, getData } = window.PlatformApp;

  let selectedPath = null;
  let selectedType = null;

  const ICON_OPTIONS = [
    'target', 'building', 'user', 'cube', 'userPlus', 'star', 'settings', 'heart',
    'grid', 'search', 'card', 'spark', 'cart', 'plug', 'shield', 'wallet', 'chart',
    'flask', 'globe', 'phone', 'monitor', 'chat', 'more', 'shop', 'headset',
  ].map((value) => ({ value, label: value }));

  const TONE_OPTIONS = [
    { value: 'blue', label: 'Синий' },
    { value: 'purple', label: 'Фиолетовый' },
    { value: 'green', label: 'Зелёный' },
    { value: 'orange', label: 'Оранжевый' },
  ];

  const PAGE_BLOCKS = {
    hero: { label: 'Шапка и ценность' },
    business: { label: 'Telecom Business' },
    center: { label: 'Платформа' },
    client: { label: 'Конечный клиент' },
    metrics: { label: 'Метрики' },
  };

  function resolveSegment(cur, part) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      if (/^\d+$/.test(part)) return cur[Number(part)];
      const byId = cur.find((item) => item && item.id === part);
      if (byId) return byId;
    }
    return cur[part];
  }

  function getParentAndKey(path) {
    const parts = path.split('.');
    let cur = getData();
    for (let i = 0; i < parts.length - 1; i++) {
      cur = resolveSegment(cur, parts[i]);
      if (cur == null) return { parent: null, key: parts[parts.length - 1] };
    }
    return { parent: cur, key: parts[parts.length - 1] };
  }

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return null;
  }

  function saveDraft(silent) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(getData()));
    if (!silent) showToast('Черновик сохранён локально');
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  function getByPath(path) {
    let cur = getData();
    for (const part of path.split('.')) {
      cur = resolveSegment(cur, part);
      if (cur == null) return undefined;
    }
    return cur;
  }

  function setByPath(path, value) {
    const { parent, key } = getParentAndKey(path);
    if (parent == null) return false;
    if (Array.isArray(parent) && /^\d+$/.test(key)) {
      parent[Number(key)] = value;
      return true;
    }
    parent[key] = value;
    return true;
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    let el = document.getElementById('edit-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'edit-toast';
      el.className = 'edit-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('visible'), 1800);
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    downloadFile('telecom-digital-platform.json', JSON.stringify(getData(), null, 2), 'application/json');
    showToast('JSON скачан');
  }

  function exportDataJs() {
    downloadFile('data.js', `window.PLATFORM_DATA = ${JSON.stringify(getData(), null, 2)};\n`, 'text/javascript');
    showToast('data.js скачан');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        window.PLATFORM_DATA = JSON.parse(reader.result);
        saveDraft();
        render();
        showToast('JSON импортирован');
      } catch (_) {
        showToast('Ошибка: неверный JSON');
      }
    };
    reader.readAsText(file);
  }

  function resetToOriginal() {
    if (!confirm('Сбросить все изменения к исходным данным?')) return;
    clearDraft();
    location.reload();
  }

  function isBlockVisible(blockId) {
    const hidden = getData().ui?.hiddenBlocks;
    return !hidden || !hidden.includes(blockId);
  }

  function hideBlock(blockId) {
    const D = getData();
    D.ui = D.ui || {};
    D.ui.hiddenBlocks = D.ui.hiddenBlocks || [];
    if (!D.ui.hiddenBlocks.includes(blockId)) D.ui.hiddenBlocks.push(blockId);
  }

  function restoreBlock(blockId) {
    const D = getData();
    D.ui.hiddenBlocks = (D.ui.hiddenBlocks || []).filter((id) => id !== blockId);
  }

  function updateRestoreMenu(select) {
    if (!select) return;
    const hidden = getData().ui?.hiddenBlocks || [];
    select.innerHTML = '<option value="">↩ Скрытые блоки...</option>' + hidden.map((id) => (
      `<option value="${id}">${escapeHtml(PAGE_BLOCKS[id]?.label || id)}</option>`
    )).join('');
  }

  function newId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function canDelete(path, type) {
    return ['text', 'domain', 'journey', 'capability', 'channel', 'metric', 'layer', 'block'].includes(type)
      && (type !== 'text' || /\.items\.\d+$/.test(path));
  }

  function deleteLabel(type) {
    return {
      text: 'Удалить пункт',
      domain: 'Удалить домен',
      journey: 'Удалить шаг',
      capability: 'Удалить capability',
      channel: 'Удалить канал',
      metric: 'Удалить колонку',
      layer: 'Удалить слой',
      block: 'Скрыть блок',
    }[type] || 'Удалить';
  }

  function deleteByPath(path, type) {
    if (type === 'block') {
      hideBlock(path.split('.').pop());
      return true;
    }
    const { parent, key } = getParentAndKey(path);
    if (parent == null) return false;
    if (Array.isArray(parent)) {
      if (/^\d+$/.test(key)) {
        parent.splice(Number(key), 1);
        return true;
      }
      const idx = parent.findIndex((item) => item && item.id === key);
      if (idx >= 0) {
        parent.splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  function fixField(label, id, value, opts = {}) {
    if (opts.textarea) {
      return `<label class="edit-field"><span>${label}</span><textarea id="${id}" class="edit-input" rows="${opts.rows || 3}">${escapeHtml(value || '')}</textarea></label>`;
    }
    return `<label class="edit-field"><span>${label}</span><input type="text" id="${id}" class="edit-input" value="${escapeAttr(value || '')}"></label>`;
  }

  function fixSelect(label, id, value, options) {
    const opts = options.map((o) => `<option value="${escapeAttr(o.value)}"${o.value === value ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
    return `<label class="edit-field"><span>${label}</span><select id="${id}" class="edit-input">${opts}</select></label>`;
  }

  function readField(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function buildEditToolbar() {
    const bar = document.createElement('div');
    bar.className = 'edit-toolbar';
    bar.innerHTML = `
      <span class="edit-badge">WYSIWYG</span>
      <span class="edit-hint">Кликните элемент схемы, чтобы изменить текст или состав блоков</span>
      <div class="edit-toolbar-actions">
        <button type="button" class="btn" id="edit-save-draft">Сохранить черновик</button>
        <button type="button" class="btn" id="edit-export-json">Экспорт JSON</button>
        <button type="button" class="btn" id="edit-export-js">Экспорт data.js</button>
        <label class="btn import-label">
          Импорт JSON
          <input type="file" id="edit-import-json" accept=".json,application/json" hidden>
        </label>
        <select id="edit-restore-blocks" class="edit-input" title="Восстановить скрытый блок">
          <option value="">↩ Скрытые блоки...</option>
        </select>
        <button type="button" class="btn ghost" id="edit-reset">Сбросить</button>
        <a class="btn ghost" href="${location.pathname}">Просмотр</a>
      </div>
    `;
    document.querySelector('.page-header').insertBefore(bar, document.getElementById('status-bar'));
    bar.querySelector('#edit-save-draft').addEventListener('click', () => saveDraft());
    bar.querySelector('#edit-export-json').addEventListener('click', exportJson);
    bar.querySelector('#edit-export-js').addEventListener('click', exportDataJs);
    bar.querySelector('#edit-reset').addEventListener('click', resetToOriginal);
    bar.querySelector('#edit-import-json').addEventListener('change', (e) => {
      if (e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = '';
    });
    updateRestoreMenu(bar.querySelector('#edit-restore-blocks'));
    bar.querySelector('#edit-restore-blocks').addEventListener('change', (e) => {
      if (!e.target.value) return;
      restoreBlock(e.target.value);
      saveDraft(true);
      render();
      updateRestoreMenu(e.target);
      showToast('Блок восстановлен');
    });
  }

  function buildEditPanel() {
    const panel = document.createElement('aside');
    panel.id = 'edit-panel';
    panel.className = 'edit-panel hidden';
    panel.innerHTML = `
      <div class="edit-panel-head">
        <strong>Редактирование</strong>
        <button type="button" class="edit-close" id="edit-close" aria-label="Закрыть">×</button>
      </div>
      <div class="edit-panel-body" id="edit-panel-body"></div>
      <div class="edit-panel-foot">
        <button type="button" class="btn" id="edit-apply">Применить</button>
        <button type="button" class="btn" id="edit-delete">Удалить</button>
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('#edit-close').addEventListener('click', closePanel);
    panel.querySelector('#edit-apply').addEventListener('click', applyPanel);
    panel.querySelector('#edit-delete').addEventListener('click', deleteCurrent);
  }

  function closePanel() {
    selectedPath = null;
    selectedType = null;
    document.getElementById('edit-panel').classList.add('hidden');
    document.querySelectorAll('[data-edit-path].edit-selected').forEach((el) => el.classList.remove('edit-selected'));
  }

  function openPanel(path, type) {
    selectedPath = path;
    selectedType = type;
    document.querySelectorAll('[data-edit-path].edit-selected').forEach((el) => el.classList.remove('edit-selected'));
    const el = document.querySelector(`[data-edit-path="${CSS.escape(path)}"]`);
    if (el) {
      el.classList.add('edit-selected');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    renderPanelForm(path, type);
    document.getElementById('edit-panel').classList.remove('hidden');
  }

  function updateDeleteButton(path, type) {
    const deleteBtn = document.getElementById('edit-delete');
    if (canDelete(path, type)) {
      deleteBtn.style.display = 'inline-block';
      deleteBtn.textContent = deleteLabel(type);
    } else {
      deleteBtn.style.display = 'none';
    }
  }

  function renderPanelForm(path, type) {
    const body = document.getElementById('edit-panel-body');
    const val = getByPath(path);
    let html = `<p class="edit-path">${escapeHtml(path)}</p>`;

    if (type === 'block') {
      const blockId = path.split('.').pop();
      html += `<p class="edit-meta">Крупный блок схемы. При удалении блок скрывается, данные остаются в экспорте.</p>`;
      html += `<p class="edit-meta"><strong>${escapeHtml(PAGE_BLOCKS[blockId]?.label || blockId)}</strong></p>`;
    } else if (type === 'text') {
      html += fixField('Текст', 'ef-label', val, { textarea: String(val || '').length > 60, rows: 4 });
    } else if (type === 'domain') {
      html += fixField('Название', 'ef-title', val.title);
      html += fixField('Подзаголовок', 'ef-subtitle', val.subtitle);
      html += fixField('Описание', 'ef-detail', val.detail, { textarea: true, rows: 3 });
      html += fixSelect('Иконка', 'ef-icon', val.icon, ICON_OPTIONS);
      html += fixSelect('Цвет', 'ef-tone', val.tone || 'blue', TONE_OPTIONS);
    } else if (type === 'journey') {
      html += fixField('Шаг сценария', 'ef-label', val.label);
    } else if (type === 'capability' || type === 'channel') {
      html += fixField('Название', 'ef-label', val.label);
      html += fixSelect('Иконка', 'ef-icon', val.icon, ICON_OPTIONS);
    } else if (type === 'metric') {
      html += fixField('Заголовок', 'ef-title', val.title);
      html += fixSelect('Иконка', 'ef-icon', val.icon, ICON_OPTIONS);
      html += fixField('Пункты (по одному на строку)', 'ef-items', (val.items || []).join('\n'), { textarea: true, rows: 6 });
    } else if (type === 'layer') {
      html += fixField('Номер', 'ef-number', val.number);
      html += fixField('Заголовок', 'ef-title', val.title);
      html += fixField('Английский заголовок', 'ef-enTitle', val.enTitle);
    }

    body.innerHTML = html;
    updateDeleteButton(path, type);
  }

  function applyPanel() {
    if (!selectedPath || !selectedType) return;
    const type = selectedType;
    const val = getByPath(selectedPath);
    if (val == null && type !== 'text' && type !== 'block') {
      showToast('Ошибка: элемент не найден');
      return;
    }
    try {
      if (type === 'block') {
        /* title lives on nested fields */
      } else if (type === 'text') {
        if (!setByPath(selectedPath, readField('ef-label'))) {
          showToast('Ошибка: не удалось сохранить');
          return;
        }
      } else if (type === 'domain') {
        val.title = readField('ef-title');
        val.subtitle = readField('ef-subtitle');
        val.detail = readField('ef-detail');
        val.icon = readField('ef-icon');
        val.tone = readField('ef-tone');
      } else if (type === 'journey') {
        val.label = readField('ef-label');
      } else if (type === 'capability' || type === 'channel') {
        val.label = readField('ef-label');
        val.icon = readField('ef-icon');
      } else if (type === 'metric') {
        val.title = readField('ef-title');
        val.icon = readField('ef-icon');
        val.items = readField('ef-items').split('\n').map((s) => s.trim()).filter(Boolean);
      } else if (type === 'layer') {
        val.number = readField('ef-number');
        val.title = readField('ef-title');
        val.enTitle = readField('ef-enTitle');
      } else {
        showToast('Ошибка: неизвестный тип элемента');
        return;
      }
      saveDraft(true);
      render();
      showToast('Изменения применены');
      openPanel(selectedPath, type);
    } catch (err) {
      console.error(err);
      showToast('Ошибка при сохранении');
    }
  }

  function deleteCurrent() {
    if (!selectedPath || !selectedType) return;
    if (!canDelete(selectedPath, selectedType)) {
      showToast('Этот блок нельзя удалить');
      return;
    }
    if (!confirm(`${deleteLabel(selectedType)}?`)) return;
    if (!deleteByPath(selectedPath, selectedType)) {
      showToast('Ошибка: не удалось удалить');
      return;
    }
    const hidden = selectedType === 'block';
    saveDraft(true);
    closePanel();
    render();
    updateRestoreMenu(document.getElementById('edit-restore-blocks'));
    showToast(hidden ? 'Блок скрыт' : 'Удалено');
  }

  function addToList(path, factory, toast) {
    const list = getByPath(path);
    if (!Array.isArray(list)) {
      showToast('Ошибка: список не найден');
      return;
    }
    list.push(factory());
    saveDraft(true);
    render();
    showToast(toast);
  }

  function injectAddButtons() {
    document.querySelectorAll('.edit-add-btn').forEach((btn) => btn.remove());

    const add = (selector, label, onClick) => {
      const host = document.querySelector(selector);
      if (!host) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn';
      btn.textContent = label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });
      host.appendChild(btn);
    };

    const addLabels = {
      'value.client.items': '+ Пункт ценности клиента',
      'value.business.items': '+ Пункт ценности бизнеса',
      'left.provides.items': '+ Что предоставляет',
      'left.results.items': '+ Результат бизнеса',
      'right.uses.items': '+ Использование',
      'right.results.items': '+ Результат клиента',
    };
    Object.entries(addLabels).forEach(([listPath, label]) => {
      add(`[data-add="${listPath}"]`, label, () => {
        addToList(listPath, () => 'Новый пункт', 'Пункт добавлен');
      });
    });
    add('.layer[data-edit-path="center.layers.domains"] .domains', '+ Домен', () => {
      addToList('center.layers.domains.items', () => ({
        id: newId('d'),
        icon: 'cube',
        tone: 'blue',
        title: 'New domain',
        subtitle: 'Подзаголовок',
        detail: 'Описание домена',
      }), 'Домен добавлен');
    });
    add('.layer[data-edit-path="center.layers.journeys"] .journeys', '+ Шаг сценария', () => {
      addToList('center.layers.journeys.items', () => ({ id: newId('j'), label: 'Новый шаг' }), 'Шаг добавлен');
    });
    add('.layer[data-edit-path="center.layers.capabilities"] .caps', '+ Capability', () => {
      addToList('center.layers.capabilities.items', () => ({ id: newId('c'), icon: 'grid', label: 'Новая возможность' }), 'Capability добавлен');
    });
    add('.layer[data-edit-path="center.layers.channels"] .channels', '+ Канал', () => {
      addToList('center.layers.channels.items', () => ({ id: newId('ch'), icon: 'globe', label: 'Новый канал' }), 'Канал добавлен');
    });
    add('.metrics-grid', '+ Колонка метрик', () => {
      addToList('metrics.columns', () => ({
        id: newId('m'),
        icon: 'target',
        title: 'Новая колонка',
        items: ['Новая метрика'],
      }), 'Колонка добавлена');
    });
  }

  function bindEditClicks() {
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('[data-edit-path]');
      if (!target || target.closest('.edit-panel, .edit-toolbar')) return;
      e.preventDefault();
      e.stopPropagation();
      openPanel(target.dataset.editPath, target.dataset.editType);
    });
  }

  function init() {
    document.body.classList.add('edit-mode');
    const draft = loadDraft();
    window.PLATFORM_DATA = draft || cloneData(window.PLATFORM_DATA);
    window.PLATFORM_DATA.ui = window.PLATFORM_DATA.ui || { hiddenBlocks: [], statusDefault: 'Кликните на элемент схемы' };
    buildEditToolbar();
    buildEditPanel();
    bindEditClicks();
    render();
    showToast('WYSIWYG включён — кликните элемент схемы');
  }

  window.PlatformEditor = {
    afterRender() {
      injectAddButtons();
      updateRestoreMenu(document.getElementById('edit-restore-blocks'));
    },
  };

  init();
})();
