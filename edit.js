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

  function fixSelect(label, id, value, options) {
    const opts = options.map((o) => `<option value="${escapeAttr(o.value)}"${o.value === value ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
    return `<label class="edit-field"><span>${label}</span><select id="${id}" class="edit-input">${opts}</select></label>`;
  }

  const COLOR_OPTIONS = [
    { value: 'green', label: 'Зелёный' },
    { value: 'blue', label: 'Синий' },
    { value: 'orange', label: 'Оранжевый' },
    { value: 'purple', label: 'Фиолетовый' },
  ];

  const DOMAIN_OPTIONS = [
    { value: 'telecom', label: 'Telecom' },
    { value: 'cx', label: 'CX' },
    { value: 'vas', label: 'VAS' },
  ];

  function ensureUiDefaults() {
    const D = getData();
    if (D.ui) return;
    D.ui = {
      pageTitle: document.title,
      pageSubtitle: document.querySelector('.page-header p')?.textContent || '',
      panels: {
        business: 'БИЗНЕС-ЗАКАЗЧИКИ',
        platformWhy: 'ЗАЧЕМ ПЛАТФОРМА',
        platformMetrics: 'СВЯЗЬ С БИЗНЕСОМ',
        integration: 'ИНТЕГРАЦИЯ И ВЗАИМОДЕЙСТВИЕ ПЛАТФОРМ',
        teams: 'КОМАНДА ТЕЛЕКОМ ПЛАТФОРМЫ',
        flow: '1. Модель взаимодействия',
        roles: '2. Описание ролей и зон ответственности',
        raci: 'Легенда RACI',
      },
      business: {
        leadersHint: '↓ управляет CPO направлениями',
        cpoSubtitle: 'CPO продуктовых направлений',
        cpoHint: 'Запросы от CPO направлений → платформа Telecom',
      },
      platformWhyText: 'Платформа даёт общие capabilities — каталоги, поиск, навигацию, профиль и сервисы — всем доменам.',
      digitalCpoBadge: 'Платформа',
      sidebarZonePrefix: 'ЗОНА · ',
      sidebarZoneHint: 'Наведите на колонку платформы или откройте блок «2. Описание ролей» ниже.',
      statusDefault: 'Кликните на элемент схемы или наведите на колонку платформы',
      raciLegend: 'R — исполняет · A — отвечает · C — консультирует · I — информируется',
      raciHeaders: ['Зона', 'Head Telecom', 'Head CX', 'Head VAS', 'Platform', 'Product (P&L)'],
    };
  }

  function directionOptions() {
    const opts = getData().directions.map((d) => ({ value: d.id, label: d.label }));
    return opts.length ? opts : [{ value: 'lead', label: 'Направление' }];
  }

  function entityIdFromPath(path) {
    const parts = path.split('.');
    if (parts.length >= 2 && /^(businessLeaders|cpoRoles|teams|flowSteps|roleZones|integration|directions|domains)$/.test(parts[0])) {
      return parts[1];
    }
    return null;
  }

  function domainOptions() {
    const D = getData();
    return D.domains.map((d) => ({ value: d.id, label: d.platformTitle || d.cpoTitle || d.id }));
  }

  const DELETABLE_TYPES = new Set([
    'tile', 'section', 'metric', 'flowStep', 'roleZone', 'raciRow',
    'businessLeader', 'cpoRole', 'team', 'direction', 'domain',
  ]);

  function resolveEditType(path, type) {
    if (type === 'text') {
      if (/^businessLeaders\.[^.]+\.label$/.test(path)) return 'businessLeader';
      if (/^cpoRoles\.[^.]+\.label$/.test(path)) return 'cpoRole';
      if (/^teams\.[^.]+\.label$/.test(path)) return 'team';
    }
    return type;
  }

  function canDelete(path, type) {
    return DELETABLE_TYPES.has(resolveEditType(path, type));
  }

  function deleteLabel(type) {
    const labels = {
      domain: 'Удалить домен',
      section: 'Удалить секцию',
      tile: 'Удалить элемент',
      metric: 'Удалить метрику',
      flowStep: 'Удалить шаг',
      roleZone: 'Удалить зону',
      raciRow: 'Удалить строку',
      businessLeader: 'Удалить лидера',
      cpoRole: 'Удалить CPO',
      team: 'Удалить команду',
      direction: 'Удалить направление',
    };
    return labels[type] || 'Удалить';
  }

  function deleteByPath(path, type) {
    const parts = path.split('.');
    const D = getData();

    if (parts[parts.length - 2] === 'items') {
      const id = parts[parts.length - 1];
      let cur = D;
      for (let i = 0; i < parts.length - 2; i++) cur = resolveSegment(cur, parts[i]);
      if (!cur?.items) return false;
      cur.items = cur.items.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'domains' && parts[2] === 'sections' && parts.length === 4 && /^\d+$/.test(parts[3])) {
      let domain = D;
      for (let i = 0; i < 2; i++) domain = resolveSegment(domain, parts[i]);
      if (!domain?.sections) return false;
      domain.sections.splice(Number(parts[3]), 1);
      return true;
    }

    if (parts[0] === 'integration') {
      const id = entityIdFromPath(path);
      if (!id) return false;
      D.integration = D.integration.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'raci' && parts.length === 2) {
      D.raci.splice(Number(parts[1]), 1);
      return true;
    }

    if (parts[0] === 'metrics' && parts.length === 2) {
      D.metrics.splice(Number(parts[1]), 1);
      return true;
    }

    if (parts[0] === 'businessLeaders') {
      const id = entityIdFromPath(path.replace(/\.label$/, ''));
      if (!id) return false;
      D.businessLeaders = D.businessLeaders.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'cpoRoles') {
      const id = entityIdFromPath(path.replace(/\.label$/, ''));
      if (!id) return false;
      D.cpoRoles = D.cpoRoles.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'teams') {
      const id = entityIdFromPath(path.replace(/\.label$/, ''));
      if (!id) return false;
      D.teams = D.teams.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'flowSteps') {
      const id = entityIdFromPath(path);
      if (!id) return false;
      D.flowSteps = D.flowSteps.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'roleZones') {
      const id = entityIdFromPath(path);
      if (!id) return false;
      D.roleZones = D.roleZones.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'directions') {
      const id = entityIdFromPath(path);
      if (!id) return false;
      const fallback = D.directions.find((d) => d.id !== id)?.id;
      D.teams.forEach((t) => {
        if (t.direction === id && fallback) t.direction = fallback;
      });
      D.directions = D.directions.filter((item) => item.id !== id);
      return true;
    }

    if (parts[0] === 'domains' && parts.length === 2) {
      const id = entityIdFromPath(path);
      if (!id) return false;
      D.domains = D.domains.filter((item) => item.id !== id);
      if (D.domainToZone) delete D.domainToZone[id];
      D.cpoRoles.forEach((c) => {
        if (c.domain === id && D.domains[0]) c.domain = D.domains[0].id;
      });
      return true;
    }

    return false;
  }

  function addDomain() {
    const D = getData();
    const id = newId('domain-');
    D.domains.push({
      id, color: 'green', cpoTitle: 'NEW CPO', cpoSubtitle: '', platformTitle: 'NEW PLATFORM', sections: [],
    });
    if (!D.domainToZone) D.domainToZone = {};
    D.domainToZone[id] = id;
    saveDraft(true);
    render();
    openPanel(`domains.${id}`, 'domain');
  }

  function addSection(domainId) {
    const domain = getData().domains.find((d) => d.id === domainId);
    if (!domain) return;
    domain.sections.push({ title: 'Новая секция', kind: 'tiles', items: [] });
    saveDraft(true);
    render();
    openPanel(`domains.${domainId}.sections.${domain.sections.length - 1}`, 'section');
  }

  function addTile(domainId, sectionIdx) {
    const section = getData().domains.find((d) => d.id === domainId)?.sections[sectionIdx];
    if (!section) return;
    const id = newId('item-');
    section.items.push({ id, label: 'Новый элемент', hint: '' });
    saveDraft(true);
    render();
    openPanel(`domains.${domainId}.sections.${sectionIdx}.items.${id}`, 'tile');
  }

  function addIntegration() {
    const id = newId('i');
    getData().integration.push({ id, label: 'Новая интеграция', hint: '' });
    saveDraft(true);
    render();
    openPanel(`integration.${id}`, 'tile');
  }

  function addRaciRow() {
    getData().raci.push({ area: 'Новая зона', telecom: 'C', cx: 'C', vas: 'C', platform: 'R', product: 'I' });
    saveDraft(true);
    render();
    openPanel(`raci.${getData().raci.length - 1}`, 'raciRow');
  }

  function addLeader() {
    const id = newId('leader-');
    getData().businessLeaders.push({ id, label: 'Новый лидер' });
    saveDraft(true);
    render();
    openPanel(`businessLeaders.${id}.label`, 'businessLeader');
  }

  function addCpoRole() {
    const id = newId('cpo-');
    const domain = getData().domains[0]?.id || 'telecom';
    getData().cpoRoles.push({ id, label: 'Новый CPO', domain, teamIds: [] });
    saveDraft(true);
    render();
    openPanel(`cpoRoles.${id}`, 'cpoRole');
  }

  function addMetric() {
    getData().metrics.push({ label: 'Новая метрика', description: '' });
    saveDraft(true);
    render();
    openPanel(`metrics.${getData().metrics.length - 1}`, 'metric');
  }

  function addFlowStep() {
    const id = newId('step-');
    getData().flowSteps.push({ id, title: 'Новый шаг', subtitle: '', color: 'purple', items: [] });
    saveDraft(true);
    render();
    openPanel(`flowSteps.${id}`, 'flowStep');
  }

  function addRoleZone() {
    const id = newId('zone-');
    getData().roleZones.push({
      id, title: 'Новая зона', subtitle: '', color: 'purple', ownership: '', responsibilities: [], kpis: '',
    });
    saveDraft(true);
    render();
    openPanel(`roleZones.${id}`, 'roleZone');
  }

  function addTeam() {
    const id = newId('team-');
    const direction = getData().directions[0]?.id || 'lead';
    getData().teams.push({ id, label: 'Новая команда', direction });
    saveDraft(true);
    render();
    openPanel(`teams.${id}`, 'team');
  }

  function addDirection() {
    const id = newId('dir-');
    getData().directions.push({ id, label: 'Новое направление' });
    saveDraft(true);
    render();
    openPanel(`directions.${id}`, 'direction');
  }

  function runAddAction(action) {
    const map = {
      domain: addDomain,
      section: () => {
        const first = getData().domains[0];
        if (first) addSection(first.id);
        else { addDomain(); }
      },
      tile: () => {
        const first = getData().domains[0];
        if (first?.sections[0]) addTile(first.id, 0);
        else if (first) addSection(first.id);
        else addDomain();
      },
      integration: addIntegration,
      raci: addRaciRow,
      leader: addLeader,
      cpo: addCpoRole,
      metric: addMetric,
      flow: addFlowStep,
      roleZone: addRoleZone,
      team: addTeam,
      direction: addDirection,
    };
    if (map[action]) map[action]();
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
      <span class="edit-hint">Кликните элемент · «Закрепить динамику» для редактирования sidebar</span>
      <div class="edit-toolbar-actions">
        <button type="button" class="btn" id="edit-save-draft">Сохранить черновик</button>
        <button type="button" class="btn" id="edit-export-json">Экспорт JSON</button>
        <button type="button" class="btn" id="edit-export-js">Экспорт data.js</button>
        <label class="btn import-label">
          Импорт JSON
          <input type="file" id="edit-import-json" accept=".json,application/json" hidden>
        </label>
        <select id="edit-add-menu" class="edit-add-menu" title="Добавить элемент">
          <option value="">+ Добавить...</option>
          <option value="domain">Домен</option>
          <option value="section">Секция</option>
          <option value="tile">Плитка</option>
          <option value="integration">Интеграция</option>
          <option value="leader">Бизнес-лидер</option>
          <option value="cpo">CPO</option>
          <option value="metric">Метрика</option>
          <option value="direction">Направление</option>
          <option value="team">Команда</option>
          <option value="flow">Шаг flow</option>
          <option value="roleZone">Зона роли</option>
          <option value="raci">Строка RACI</option>
        </select>
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
    bar.querySelector('#edit-add-menu').addEventListener('change', (e) => {
      if (e.target.value) {
        runAddAction(e.target.value);
        e.target.value = '';
      }
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

  function pinZoneForEdit(path, type) {
    if (type === 'roleZone' && /^roleZones\.[^.]+$/.test(path)) {
      window.ArchEditPin.pinnedZoneId = path.split('.')[1];
      window.ArchEditPin.freezeDynamic = true;
    }
  }

  function injectZonePin() {
    const sidebar = document.getElementById('sidebar-right');
    if (!sidebar) return;

    let pin = sidebar.querySelector('.edit-zone-pin');
    if (!pin) {
      pin = document.createElement('div');
      pin.className = 'edit-zone-pin';
      const inner = sidebar.querySelector('.panel-inner') || sidebar;
      inner.insertBefore(pin, inner.firstChild);
    }

    const D = getData();
    pin.innerHTML = `
      <label class="edit-zone-label freeze-label">
        <input type="checkbox" id="edit-freeze-dynamic" ${window.ArchEditPin.freezeDynamic ? 'checked' : ''}>
        <span>Закрепить динамику</span>
      </label>
      <label class="edit-zone-label">
        <span>Зона sidebar:</span>
        <select id="edit-pinned-zone"${window.ArchEditPin.freezeDynamic ? '' : ' disabled'}>
          ${D.roleZones.map((z) => `<option value="${z.id}"${window.ArchEditPin.pinnedZoneId === z.id ? ' selected' : ''}>${z.title}</option>`).join('')}
        </select>
      </label>
    `;

    pin.querySelector('#edit-freeze-dynamic').addEventListener('change', (e) => {
      window.ArchEditPin.freezeDynamic = e.target.checked;
      if (window.ArchEditPin.freezeDynamic) {
        window.ArchApp.setState({
          focusMode: false,
          hoveredDomain: null,
          selectedCpo: null,
          selectedRoleZone: null,
          selectedTile: null,
          selectedFlowStep: null,
          highlightedLeader: null,
        });
      } else {
        render();
      }
    });

    pin.querySelector('#edit-pinned-zone').addEventListener('change', (e) => {
      window.ArchEditPin.pinnedZoneId = e.target.value;
      render();
    });
  }

  function openPanel(path, type) {
    pinZoneForEdit(path, type);
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

  function updateDeleteButton(path, type) {
    const deleteBtn = document.getElementById('edit-delete');
    const resolved = resolveEditType(path, type);
    if (canDelete(path, type)) {
      deleteBtn.style.display = 'inline-block';
      deleteBtn.textContent = deleteLabel(resolved);
    } else {
      deleteBtn.style.display = 'none';
    }
  }

  function renderPanelForm(path, type) {
    const body = document.getElementById('edit-panel-body');
    let html = `<p class="edit-path">${path}</p>`;
    const val = getByPath(path);

    if (type === 'text') {
      html += fixField('Текст', 'ef-label', val);
    } else if (type === 'domain') {
      html += fixField('CPO заголовок', 'ef-cpoTitle', val.cpoTitle);
      html += fixField('CPO подзаголовок', 'ef-cpoSubtitle', val.cpoSubtitle);
      html += fixField('Платформа', 'ef-platformTitle', val.platformTitle);
      html += fixSelect('Цвет колонки', 'ef-color', val.color, COLOR_OPTIONS);
    } else if (type === 'direction') {
      html += fixField('Направление', 'ef-label', val.label);
      const teamCount = getData().teams.filter((t) => t.direction === val.id).length;
      html += `<p class="edit-meta">${teamCount} команд в направлении</p>`;
    } else if (type === 'tile') {
      html += fixField('Название', 'ef-label', val.label);
      html += fixField('Подсказка', 'ef-hint', val.hint || '');
    } else if (type === 'section') {
      html += fixField('Заголовок секции', 'ef-title', val.title);
      html += fixSelect('Тип секции', 'ef-kind', val.kind || 'tiles', [
        { value: 'tiles', label: 'Плитки' },
        { value: 'text', label: 'Текстовые блоки' },
      ]);
      html += `<p class="edit-meta">${val.items.length} элемент(ов)</p>`;
    } else if (type === 'metric') {
      html += fixField('Метрика', 'ef-label', val.label);
      html += fixField('Описание', 'ef-description', val.description);
    } else if (type === 'flowStep') {
      html += fixField('Заголовок', 'ef-title', val.title);
      html += fixField('Подзаголовок', 'ef-subtitle', val.subtitle || '');
      html += fixSelect('Цвет', 'ef-color', val.color || 'purple', COLOR_OPTIONS.filter((c) => ['green', 'purple'].includes(c.value)));
      html += fixField('Пункты (по одному на строку)', 'ef-items', (val.items || []).join('\n'), { textarea: true, rows: 6 });
    } else if (type === 'roleZone') {
      html += fixField('Заголовок', 'ef-title', val.title);
      html += fixField('Подзаголовок', 'ef-subtitle', val.subtitle);
      html += fixSelect('Цвет', 'ef-color', val.color || 'purple', COLOR_OPTIONS);
      html += fixField('Владение', 'ef-ownership', val.ownership, { textarea: true, rows: 2 });
      html += fixField('Ответственности (по одной на строку)', 'ef-resp', (val.responsibilities || []).join('\n'), { textarea: true, rows: 6 });
      html += fixField('KPI', 'ef-kpis', val.kpis);
    } else if (type === 'raciRow') {
      html += fixField('Зона', 'ef-area', val.area);
      html += fixField('Head Telecom', 'ef-telecom', val.telecom);
      html += fixField('Head CX', 'ef-cx', val.cx);
      html += fixField('Head VAS', 'ef-vas', val.vas);
      html += fixField('Platform', 'ef-platform', val.platform);
      html += fixField('Product (P&L)', 'ef-product', val.product);
    } else if (type === 'businessLeader') {
      const leader = getByPath(path.replace(/\.label$/, ''));
      html += fixField('Лидер', 'ef-label', leader?.label || '');
    } else if (type === 'cpoRole') {
      html += fixField('CPO', 'ef-label', val?.label || '');
      html += fixSelect('Домен', 'ef-domain', val?.domain || 'telecom', domainOptions().length ? domainOptions() : DOMAIN_OPTIONS);
      html += fixField('ID команд (через запятую)', 'ef-teamIds', (val?.teamIds || []).join(', '));
    } else if (type === 'team') {
      html += fixField('Команда', 'ef-label', val?.label || '');
      html += fixSelect('Направление', 'ef-direction', val?.direction || 'lead', directionOptions());
    }

    body.innerHTML = html;
    updateDeleteButton(path, type);
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
      } else if (type === 'domain') {
        val.cpoTitle = readField('ef-cpoTitle');
        val.cpoSubtitle = readField('ef-cpoSubtitle');
        val.platformTitle = readField('ef-platformTitle');
        val.color = readField('ef-color');
      } else if (type === 'direction') {
        val.label = readField('ef-label');
      } else if (type === 'tile') {
        val.label = readField('ef-label');
        val.hint = readField('ef-hint');
      } else if (type === 'section') {
        val.title = readField('ef-title');
        val.kind = readField('ef-kind');
      } else if (type === 'metric') {
        val.label = readField('ef-label');
        val.description = readField('ef-description');
      } else if (type === 'flowStep') {
        val.title = readField('ef-title');
        val.subtitle = readField('ef-subtitle');
        val.color = readField('ef-color');
        val.items = readField('ef-items').split('\n').map((s) => s.trim()).filter(Boolean);
      } else if (type === 'roleZone') {
        val.title = readField('ef-title');
        val.subtitle = readField('ef-subtitle');
        val.color = readField('ef-color');
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
      } else if (type === 'cpoRole') {
        val.label = readField('ef-label');
        val.domain = readField('ef-domain');
        val.teamIds = readField('ef-teamIds').split(',').map((s) => s.trim()).filter(Boolean);
      } else if (type === 'team') {
        val.label = readField('ef-label');
        val.direction = readField('ef-direction');
      } else if (type === 'businessLeader' || (type === 'text' && /^businessLeaders\./.test(selectedPath))) {
        const leader = getByPath(selectedPath.replace(/\.label$/, '')) || val;
        leader.label = readField('ef-label');
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
    const resolved = resolveEditType(selectedPath, selectedType);
    if (!canDelete(selectedPath, selectedType)) {
      showToast('Этот блок нельзя удалить');
      return;
    }
    const label = deleteLabel(resolved).toLowerCase();
    if (!confirm(`${label.charAt(0).toUpperCase()}${label.slice(1)}?`)) return;
    if (!deleteByPath(selectedPath, resolved)) {
      showToast('Ошибка: не удалось удалить');
      return;
    }
    saveDraft(true);
    closePanel();
    render();
    showToast('Блок удалён');
  }

  function injectSectionActions() {
    document.querySelectorAll('.section-block[data-section]').forEach((block) => {
      if (block.querySelector('.edit-section-actions')) return;
      const [domainId, sectionIdx] = block.dataset.section.split('.');
      const actions = document.createElement('div');
      actions.className = 'edit-section-actions';
      actions.innerHTML = `
        <button type="button" class="edit-del-btn" data-action="delete-section">× Секцию</button>
      `;
      actions.querySelector('[data-action="delete-section"]').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedPath = `domains.${domainId}.sections.${sectionIdx}`;
        selectedType = 'section';
        deleteCurrent();
      });
      block.insertBefore(actions, block.firstChild);
    });
  }

  function injectAddButtons() {
    injectSectionActions();
    document.querySelectorAll('.section-block[data-section]').forEach((block) => {
      if (block.querySelector('.edit-add-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn';
      btn.textContent = '+ Добавить элемент';
      btn.addEventListener('click', () => {
        const [domainId, sectionIdx] = block.dataset.section.split('.');
        addTile(domainId, Number(sectionIdx));
      });
      block.appendChild(btn);
    });

    const intSection = document.getElementById('integration-section');
    if (intSection && !intSection.querySelector('.edit-add-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn';
      btn.textContent = '+ Добавить интеграцию';
      btn.addEventListener('click', addIntegration);
      intSection.querySelector('.panel-body').appendChild(btn);
    }

    const raciSection = document.getElementById('raci-section');
    if (raciSection && !raciSection.querySelector('.edit-add-raci')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn edit-add-raci';
      btn.textContent = '+ Добавить строку RACI';
      btn.addEventListener('click', addRaciRow);
      raciSection.querySelector('.panel-body').prepend(btn);
    }

    const businessSection = document.getElementById('business-section');
    if (businessSection && !businessSection.querySelector('.edit-add-leader')) {
      const wrap = document.createElement('div');
      wrap.className = 'edit-block-actions';
      wrap.innerHTML = `
        <button type="button" class="edit-add-btn edit-add-leader">+ Лидер</button>
        <button type="button" class="edit-add-btn edit-add-cpo">+ CPO</button>
      `;
      wrap.querySelector('.edit-add-leader').addEventListener('click', addLeader);
      wrap.querySelector('.edit-add-cpo').addEventListener('click', addCpoRole);
      businessSection.querySelector('.panel-body').appendChild(wrap);
    }

    const metricsPanel = document.querySelector('#sidebar-left .panel-inner:nth-child(2) .panel-body');
    if (metricsPanel && !metricsPanel.querySelector('.edit-add-metric')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn edit-add-metric';
      btn.textContent = '+ Метрика';
      btn.addEventListener('click', addMetric);
      metricsPanel.appendChild(btn);
    }

    const flowSection = document.getElementById('flow-section');
    if (flowSection && !flowSection.querySelector('.edit-add-flow')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn edit-add-flow';
      btn.textContent = '+ Шаг flow';
      btn.addEventListener('click', addFlowStep);
      flowSection.querySelector('.panel-body').appendChild(btn);
    }

    const rolesSection = document.getElementById('roles-section');
    if (rolesSection && !rolesSection.querySelector('.edit-add-role')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn edit-add-role';
      btn.textContent = '+ Зона роли';
      btn.addEventListener('click', addRoleZone);
      rolesSection.querySelector('.panel-body').appendChild(btn);
    }

    const teamsSection = document.getElementById('teams-section');
    if (teamsSection && !teamsSection.querySelector('.edit-block-actions')) {
      const wrap = document.createElement('div');
      wrap.className = 'edit-block-actions';
      wrap.innerHTML = `
        <button type="button" class="edit-add-btn edit-add-direction">+ Направление</button>
        <button type="button" class="edit-add-btn edit-add-team">+ Команда</button>
      `;
      wrap.querySelector('.edit-add-direction').addEventListener('click', addDirection);
      wrap.querySelector('.edit-add-team').addEventListener('click', addTeam);
      teamsSection.querySelector('.panel-body').appendChild(wrap);
    }

    const domainsGrid = document.getElementById('domains-grid');
    if (domainsGrid && !domainsGrid.querySelector('.edit-add-domain')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn edit-add-domain';
      btn.textContent = '+ Домен';
      btn.addEventListener('click', addDomain);
      domainsGrid.parentElement.appendChild(btn);
    }

    document.querySelectorAll('[data-domain]').forEach((article) => {
      if (article.querySelector('.edit-add-section')) return;
      const domainId = article.dataset.domain;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-add-btn edit-add-section';
      btn.textContent = '+ Секция';
      btn.addEventListener('click', () => addSection(domainId));
      article.appendChild(btn);
    });
  }

  function injectQuickDelete() {
    document.querySelectorAll('[data-edit-path]').forEach((el) => {
      if (el.closest('.edit-panel, .edit-toolbar, .edit-zone-pin, .edit-section-actions')) return;
      if (el.querySelector(':scope > .edit-quick-del')) return;
      const path = el.dataset.editPath;
      const type = resolveEditType(path, el.dataset.editType);
      if (!canDelete(path, el.dataset.editType)) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edit-quick-del';
      btn.title = deleteLabel(type);
      btn.textContent = '×';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectedPath = path;
        selectedType = el.dataset.editType;
        deleteCurrent();
      });
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.appendChild(btn);
    });
  }

  function bindEditClicks() {
    document.body.addEventListener('click', (e) => {
      if (e.target.closest('.edit-section-actions, .edit-del-btn, .edit-zone-pin, .edit-quick-del')) return;
      const target = e.target.closest('[data-edit-path]');
      if (!target || target.closest('.edit-panel, .edit-toolbar')) return;
      e.preventDefault();
      e.stopPropagation();
      const path = target.dataset.editPath;
      const type = resolveEditType(path, target.dataset.editType);
      openPanel(path, type);
    });
  }

  function init() {
    document.body.classList.add('edit-mode');
    const draft = loadDraft();
    window.ARCH_DATA = draft || cloneData(window.ARCH_DATA);
    ensureUiDefaults();
    window.ArchEditPin = { pinnedZoneId: 'digital', freezeDynamic: true };
    buildEditToolbar();
    buildEditPanel();
    bindEditClicks();
    window.ArchApp.setState({
      focusMode: false,
      hoveredDomain: null,
      selectedCpo: null,
      selectedRoleZone: null,
      selectedTile: null,
      selectedFlowStep: null,
      highlightedLeader: null,
    });
    showToast('Динамика закреплена — можно редактировать зоны');
  }

  window.ArchEditor = {
    afterRender() {
      injectZonePin();
      injectAddButtons();
      injectQuickDelete();
    },
  };

  init();
})();
