(function () {
  if (!window.EDIT_MODE || !window.ArchApp) return;

  const DRAFT_KEY = 'megafon-cpo-arch-draft';
  const { render, getData } = window.ArchApp;

  let selectedPath = null;
  let selectedType = null;

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
    const parts = path.split('.');
    let cur = getData();
    for (const part of parts) {
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

  function deleteByPath(path) {
    const parts = path.split('.');

    if (parts[parts.length - 2] === 'items') {
      const id = parts[parts.length - 1];
      let cur = getData();
      for (let i = 0; i < parts.length - 2; i++) {
        cur = resolveSegment(cur, parts[i]);
      }
      cur.items = cur.items.filter((item) => item.id !== id);
      return;
    }

    if (parts[0] === 'integration' && parts.length === 2) {
      const id = parts[1];
      const D = getData();
      D.integration = D.integration.filter((item) => item.id !== id);
      return;
    }

    if (parts[0] === 'raci' && parts.length === 2) {
      getData().raci.splice(Number(parts[1]), 1);
      return;
    }

    const { parent, key } = getParentAndKey(path);
    if (parent == null) return;
    if (Array.isArray(parent) && /^\d+$/.test(key)) {
      parent.splice(Number(key), 1);
    }
  }

  function newId(prefix) {
    return `${prefix}${Date.now().toString(36)}`;
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
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('visible'), 2200);
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
    downloadFile('schema.json', JSON.stringify(getData(), null, 2), 'application/json');
  }

  function exportDataJs() {
    const body = `window.ARCH_DATA = ${JSON.stringify(getData(), null, 2)};\n`;
    downloadFile('data.js', body, 'text/javascript');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        window.ARCH_DATA = JSON.parse(reader.result);
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

  function buildEditToolbar() {
    const bar = document.createElement('div');
    bar.className = 'edit-toolbar';
    bar.innerHTML = `
      <span class="edit-badge">WYSIWYG</span>
      <span class="edit-hint">Кликните элемент для редактирования</span>
      <div class="edit-toolbar-actions">
        <button type="button" class="btn" id="edit-save-draft">Сохранить черновик</button>
        <button type="button" class="btn" id="edit-export-json">Экспорт JSON</button>
        <button type="button" class="btn" id="edit-export-js">Экспорт data.js</button>
        <label class="btn import-label">
          Импорт JSON
          <input type="file" id="edit-import-json" accept=".json,application/json" hidden>
        </label>
        <button type="button" class="btn ghost" id="edit-reset">Сбросить</button>
        <a class="btn ghost" href="${location.pathname}">Просмотр</a>
      </div>
    `;
    document.querySelector('.page-header').insertBefore(bar, document.getElementById('status-bar'));

    bar.querySelector('#edit-save-draft').addEventListener('click', saveDraft);
    bar.querySelector('#edit-export-json').addEventListener('click', exportJson);
    bar.querySelector('#edit-export-js').addEventListener('click', exportDataJs);
    bar.querySelector('#edit-reset').addEventListener('click', resetToOriginal);
    bar.querySelector('#edit-import-json').addEventListener('change', (e) => {
      if (e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = '';
    });
  }

  function buildEditPanel() {
    const panel = document.createElement('aside');
    panel.id = 'edit-panel';
    panel.className = 'edit-panel hidden';
    panel.innerHTML = `
      <div class="edit-panel-head">
        <strong>Редактирование</strong>
        <button type="button" class="edit-close" id="edit-panel-close" aria-label="Закрыть">×</button>
      </div>
      <div class="edit-panel-body" id="edit-panel-body"></div>
      <div class="edit-panel-foot">
        <button type="button" class="btn" id="edit-apply">Применить</button>
        <button type="button" class="btn ghost" id="edit-delete">Удалить</button>
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('#edit-panel-close').addEventListener('click', closePanel);
    panel.querySelector('#edit-apply').addEventListener('click', applyPanel);
    panel.querySelector('#edit-delete').addEventListener('click', deleteCurrent);
    return panel;
  }

  function closePanel() {
    document.getElementById('edit-panel').classList.add('hidden');
    selectedPath = null;
    selectedType = null;
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

  function field(label, id, value, opts = {}) {
    const tag = opts.textarea ? 'textarea' : 'input';
    const rows = opts.textarea ? ` rows="${opts.rows || 3}"` : '';
    const type = opts.textarea ? '' : ' type="text"';
    return `
      <label class="edit-field">
        <span>${label}</span>
        <${tag}${type} id="${id}" class="edit-input"${rows}>${opts.textarea ? escapeHtml(value || '') : ''}</${tag}>
        ${!opts.textarea ? '' : ''}
      </label>
    `.replace(/<input([^>]*)><\/input>/, (_, attrs) => `<input${attrs} value="${escapeAttr(value || '')}">`);
  }

  function fixField(label, id, value, opts = {}) {
    if (opts.textarea) {
      return `<label class="edit-field"><span>${label}</span><textarea id="${id}" class="edit-input" rows="${opts.rows || 3}">${escapeHtml(value || '')}</textarea></label>`;
    }
    return `<label class="edit-field"><span>${label}</span><input type="text" id="${id}" class="edit-input" value="${escapeAttr(value || '')}"></label>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function renderPanelForm(path, type) {
    const body = document.getElementById('edit-panel-body');
    const deleteBtn = document.getElementById('edit-delete');
    let html = `<p class="edit-path">${path}</p>`;
    const val = getByPath(path);

    if (type === 'text') {
      html += fixField('Текст', 'ef-label', val);
      deleteBtn.style.display = 'none';
    } else if (type === 'tile') {
      html += fixField('Название', 'ef-label', val.label);
      html += fixField('Подсказка', 'ef-hint', val.hint || '');
      deleteBtn.style.display = path.includes('.items.') ? 'inline-block' : 'none';
    } else if (type === 'metric') {
      html += fixField('Метрика', 'ef-label', val.label);
      html += fixField('Описание', 'ef-description', val.description);
      deleteBtn.style.display = 'none';
    } else if (type === 'flowStep') {
      html += fixField('Заголовок', 'ef-title', val.title);
      html += fixField('Подзаголовок', 'ef-subtitle', val.subtitle || '');
      html += fixField('Пункты (по одному на строку)', 'ef-items', (val.items || []).join('\n'), { textarea: true, rows: 6 });
      deleteBtn.style.display = 'none';
    } else if (type === 'roleZone') {
      html += fixField('Заголовок', 'ef-title', val.title);
      html += fixField('Подзаголовок', 'ef-subtitle', val.subtitle);
      html += fixField('Владение', 'ef-ownership', val.ownership, { textarea: true, rows: 2 });
      html += fixField('Ответственности (по одной на строку)', 'ef-resp', (val.responsibilities || []).join('\n'), { textarea: true, rows: 6 });
      html += fixField('KPI', 'ef-kpis', val.kpis);
      deleteBtn.style.display = 'none';
    } else if (type === 'raciRow') {
      html += fixField('Зона', 'ef-area', val.area);
      html += fixField('Head Telecom', 'ef-telecom', val.telecom);
      html += fixField('Head CX', 'ef-cx', val.cx);
      html += fixField('Head VAS', 'ef-vas', val.vas);
      html += fixField('Platform', 'ef-platform', val.platform);
      html += fixField('Product (P&L)', 'ef-product', val.product);
      deleteBtn.style.display = 'inline-block';
    }

    body.innerHTML = html;
  }

  function readField(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function applyPanel() {
    if (!selectedPath || !selectedType) return;

    const type = selectedType;
    const val = getByPath(selectedPath);

    if (val == null && type !== 'text') {
      showToast('Ошибка: элемент не найден');
      return;
    }

    try {
      if (type === 'text') {
        if (!setByPath(selectedPath, readField('ef-label'))) {
          showToast('Ошибка: не удалось сохранить');
          return;
        }
      } else if (type === 'tile') {
        val.label = readField('ef-label');
        val.hint = readField('ef-hint');
      } else if (type === 'metric') {
        val.label = readField('ef-label');
        val.description = readField('ef-description');
      } else if (type === 'flowStep') {
        val.title = readField('ef-title');
        val.subtitle = readField('ef-subtitle');
        val.items = readField('ef-items').split('\n').map((s) => s.trim()).filter(Boolean);
      } else if (type === 'roleZone') {
        val.title = readField('ef-title');
        val.subtitle = readField('ef-subtitle');
        val.ownership = readField('ef-ownership');
        val.responsibilities = readField('ef-resp').split('\n').map((s) => s.trim()).filter(Boolean);
        val.kpis = readField('ef-kpis');
      } else if (type === 'raciRow') {
        val.area = readField('ef-area');
        val.telecom = readField('ef-telecom');
        val.cx = readField('ef-cx');
        val.vas = readField('ef-vas');
        val.platform = readField('ef-platform');
        val.product = readField('ef-product');
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
    if (!selectedPath || !confirm('Удалить этот элемент?')) return;
    deleteByPath(selectedPath);
    saveDraft();
    closePanel();
    render();
    showToast('Элемент удалён');
  }

  function injectAddButtons() {
    document.querySelectorAll('.section-block[data-section]').forEach((block) => {
      if (block.querySelector('.edit-add-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn';
      btn.textContent = '+ Добавить элемент';
      btn.addEventListener('click', () => {
        const [domainId, sectionIdx] = block.dataset.section.split('.');
        const section = getData().domains.find((d) => d.id === domainId).sections[Number(sectionIdx)];
        const id = newId('item-');
        section.items.push({ id, label: 'Новый элемент', hint: '' });
        saveDraft();
        render();
        openPanel(`domains.${domainId}.sections.${sectionIdx}.items.${id}`, 'tile');
      });
      block.appendChild(btn);
    });

    const intSection = document.getElementById('integration-section');
    if (intSection && !intSection.querySelector('.edit-add-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn';
      btn.textContent = '+ Добавить интеграцию';
      btn.addEventListener('click', () => {
        const id = newId('i');
        getData().integration.push({ id, label: 'Новая интеграция', hint: '' });
        saveDraft();
        render();
        openPanel(`integration.${id}`, 'tile');
      });
      intSection.querySelector('.panel-body').appendChild(btn);
    }

    const raciSection = document.getElementById('raci-section');
    if (raciSection && !raciSection.querySelector('.edit-add-raci')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn edit-add-raci';
      btn.textContent = '+ Добавить строку RACI';
      btn.addEventListener('click', () => {
        getData().raci.push({ area: 'Новая зона', telecom: 'C', cx: 'C', vas: 'C', platform: 'R', product: 'I' });
        saveDraft();
        render();
        const idx = getData().raci.length - 1;
        openPanel(`raci.${idx}`, 'raciRow');
      });
      raciSection.querySelector('.panel-body').prepend(btn);
    }
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
    window.ARCH_DATA = draft || cloneData(window.ARCH_DATA);
    buildEditToolbar();
    buildEditPanel();
    bindEditClicks();
    render();
    showToast('Режим редактирования включён');
  }

  window.ArchEditor = {
    afterRender: injectAddButtons,
  };

  init();
})();
