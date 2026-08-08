function getData() {
  return window.ARCH_DATA;
}

function isBlockVisible(blockId) {
  const hidden = getData().ui?.hiddenBlocks;
  return !hidden || !hidden.includes(blockId);
}

function editAttrs(path, type) {
  if (!window.EDIT_MODE) return '';
  return ` data-edit-path="${path}" data-edit-type="${type}"`;
}

function blockAttrs(blockId) {
  if (!window.EDIT_MODE) return '';
  return editAttrs(`ui.blocks.${blockId}`, 'block');
}

const state = {
  focusMode: true,
  hoveredDomain: null,
  selectedTile: null,
  selectedCpo: null,
  highlightedLeader: null,
  selectedFlowStep: null,
  selectedRoleZone: null,
  raciFilter: 'all',
};

window.ArchEditPin = window.ArchEditPin || { pinnedZoneId: 'digital', freezeDynamic: false };

function isEditFrozen() {
  return window.EDIT_MODE && window.ArchEditPin?.freezeDynamic;
}

function teamCountLabel(count) {
  if (count === 1) return '1 команда';
  if (count >= 2 && count <= 4) return `${count} команды`;
  return `${count} команд`;
}

function zoneById(id) {
  const D = getData();
  return D.roleZones.find((z) => z.id === id) || D.roleZones[0];
}

function cpoById(id) {
  return getData().cpoRoles.find((c) => c.id === id);
}

function getSidebarZone() {
  const D = getData();
  if (isEditFrozen() && window.ArchEditPin.pinnedZoneId) {
    return zoneById(window.ArchEditPin.pinnedZoneId);
  }
  if (state.selectedRoleZone) return zoneById(state.selectedRoleZone);
  if (state.hoveredDomain) return zoneById(D.domainToZone[state.hoveredDomain]);
  if (state.selectedCpo) {
    const cpo = cpoById(state.selectedCpo);
    if (cpo) return zoneById(D.domainToZone[cpo.domain]);
  }
  return zoneById('digital');
}

function isDomainDimmed(domainId) {
  if (isEditFrozen()) return false;
  if (state.selectedCpo) {
    const cpo = cpoById(state.selectedCpo);
    return cpo ? cpo.domain !== domainId : false;
  }
  if (state.focusMode && state.hoveredDomain) return state.hoveredDomain !== domainId;
  return false;
}

function isIntegrationDimmed() {
  if (isEditFrozen()) return false;
  return state.focusMode && state.hoveredDomain !== null;
}

function isTeamHighlighted(teamId) {
  if (!state.selectedCpo) return false;
  const cpo = cpoById(state.selectedCpo);
  return cpo ? cpo.teamIds.includes(teamId) : false;
}

function isDirectionHighlighted(dirId) {
  if (!state.selectedCpo) return false;
  const cpo = cpoById(state.selectedCpo);
  if (!cpo) return false;
  return getData().teams.some((t) => t.direction === dirId && cpo.teamIds.includes(t.id));
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function resetSelection() {
  setState({
    selectedTile: null,
    selectedCpo: null,
    highlightedLeader: null,
    selectedFlowStep: null,
    selectedRoleZone: null,
    hoveredDomain: null,
    raciFilter: 'all',
  });
}

function panel(title, body, titlePath, blockId) {
  const titleEl = titlePath
    ? `<div class="panel-title"${editAttrs(titlePath, 'text')}>${title}</div>`
    : `<div class="panel-title">${title}</div>`;
  const blockMark = blockId ? blockAttrs(blockId) : '';
  return `<div class="panel-inner"${blockMark}>${titleEl}<div class="panel-body">${body}</div></div>`;
}

function collapsible(title, body, count, titlePath) {
  const countBadge = count ? `<span class="badge">${count}</span>` : '';
  const titleEl = titlePath
    ? `<summary class="panel-title collapsible-title"${editAttrs(titlePath, 'text')}>${title}${countBadge}</summary>`
    : `<summary class="panel-title collapsible-title">${title}${countBadge}</summary>`;
  return `${titleEl}<div class="panel-body">${body}</div>`;
}

function clearBlockElement(el) {
  if (!el) return;
  el.removeAttribute('data-edit-path');
  el.removeAttribute('data-edit-type');
}

function markBlockElement(el, blockId) {
  if (!el) return;
  if (window.EDIT_MODE) {
    el.setAttribute('data-edit-path', `ui.blocks.${blockId}`);
    el.setAttribute('data-edit-type', 'block');
  } else {
    el.removeAttribute('data-edit-path');
    el.removeAttribute('data-edit-type');
  }
}

function btnClass(active, dimmed) {
  let cls = 'btn';
  if (active) cls += ' active';
  if (dimmed) cls += ' dimmed';
  return cls;
}

function findTile(id) {
  const D = getData();
  for (const domain of D.domains) {
    for (const section of domain.sections) {
      const item = section.items.find((i) => i.id === id);
      if (item) return item;
    }
  }
  return D.integration.find((i) => i.id === id) || null;
}

function renderToolbar() {
  document.getElementById('toolbar').innerHTML = `
    <label class="toggle">
      <input type="checkbox" id="focus-toggle" ${state.focusMode ? 'checked' : ''}>
      <span>Режим фокуса</span>
    </label>
    <button type="button" class="btn ghost" id="reset-btn">Сбросить</button>
  `;
}

function renderStatusBar() {
  const D = getData();
  const parts = [];
  if (state.highlightedLeader) {
    const leader = D.businessLeaders.find((l) => l.id === state.highlightedLeader);
    if (leader) parts.push(`Лидер: ${leader.label}`);
  }
  if (state.selectedCpo) {
    const cpo = cpoById(state.selectedCpo);
    if (cpo) parts.push(`CPO: ${cpo.label}`);
  }
  if (state.hoveredDomain) {
    const domain = D.domains.find((d) => d.id === state.hoveredDomain);
    if (domain) parts.push(`Домен: ${domain.platformTitle}`);
  }
  if (state.selectedTile) {
    const tile = findTile(state.selectedTile);
    if (tile) parts.push(`Элемент: ${tile.label}${tile.hint ? ' — ' + tile.hint : ''}`);
  }
  if (state.selectedFlowStep) {
    const step = D.flowSteps.find((s) => s.id === state.selectedFlowStep);
    if (step) parts.push(`Шаг: ${step.title}`);
  }
  if (state.selectedRoleZone) {
    parts.push(`Роль: ${zoneById(state.selectedRoleZone).title}`);
  }
  document.getElementById('status-bar').textContent = parts.length
    ? parts.join(' · ')
    : (D.ui?.statusDefault || 'Кликните на элемент схемы или наведите на колонку платформы');
}

function renderPageMeta() {
  const D = getData();
  const ui = D.ui || {};
  if (ui.pageTitle) {
    document.title = ui.pageTitle;
    const h1 = document.querySelector('.page-header h1');
    if (h1) {
      h1.textContent = ui.pageTitle;
      if (window.EDIT_MODE) h1.setAttribute('data-edit-path', 'ui.pageTitle'), h1.setAttribute('data-edit-type', 'text');
    }
  }
  const sub = document.querySelector('.page-header p');
  if (sub && ui.pageSubtitle) {
    sub.textContent = ui.pageSubtitle;
    if (window.EDIT_MODE) sub.setAttribute('data-edit-path', 'ui.pageSubtitle'), sub.setAttribute('data-edit-type', 'text');
  }
}

function cposForLeader(leaderId) {
  return getData().cpoRoles.filter((c) => (c.leaderId || 'telecom-core') === leaderId);
}

function renderBusiness() {
  const el = document.getElementById('business-section');
  if (!isBlockVisible('business')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const ui = D.ui || {};
  const biz = ui.business || {};

  const renderCpo = (c) => {
    const active = state.selectedCpo === c.id;
    return `<button type="button" class="${btnClass(active, false)} chip-btn" data-cpo="${c.id}"${editAttrs(`cpoRoles.${c.id}`, 'cpoRole')}>${c.label}</button>`;
  };

  const cols = D.businessLeaders.map((leader) => {
    const cpos = cposForLeader(leader.id);
    const isVitriny = leader.id === 'vitriny';
    const hintKey = isVitriny ? 'vitrinyHint' : 'telecomHint';
    const hintFallback = isVitriny ? '' : (biz.leadersHint || '');
    const hintText = biz[hintKey] || hintFallback;
    const hintPath = `ui.business.${hintKey}`;

    return `
      <div class="business-leader-col${isVitriny ? ' business-leader-col-vitriny' : ''}">
        <button type="button" class="pill-btn${isVitriny ? ' pill-btn-vitriny' : ''} ${state.highlightedLeader === leader.id ? 'active' : ''}" data-leader="${leader.id}"${editAttrs(`businessLeaders.${leader.id}.label`, 'text')}>${leader.label}</button>
        <p class="muted arrow-hint ${state.highlightedLeader === leader.id ? 'active' : ''}"${editAttrs(hintPath, 'text')}>${hintText}</p>
        ${cpos.length ? `<p class="muted" style="margin-bottom:0.5rem"${editAttrs('ui.business.cpoSubtitle', 'text')}>${biz.cpoSubtitle || ''}</p>` : ''}
        ${cpos.length ? `<div class="chips">${cpos.map(renderCpo).join('')}</div>` : ''}
        ${cpos.length ? `<p class="muted ${state.selectedCpo ? 'active' : ''}" style="margin-top:0.75rem"${editAttrs('ui.business.cpoHint', 'text')}>${biz.cpoHint || ''}</p>` : ''}
      </div>
    `;
  }).join('');

  el.innerHTML = panel(ui.panels?.business || 'БИЗНЕС-ЗАКАЗЧИКИ', `
    <div class="business-split">${cols}</div>
  `, 'ui.panels.business');
  markBlockElement(el, 'business');
}

function renderDigitalCpo() {
  const el = document.getElementById('digital-cpo');
  if (!isBlockVisible('digitalCpo')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const ui = D.ui || {};
  const vitriny = state.highlightedLeader === 'vitriny';
  el.className = `banner${vitriny ? ' highlighted' : ''}`;
  el.innerHTML = `
    <span${editAttrs('digitalCpoTitle', 'text')}>${D.digitalCpoTitle}</span>
    <small${editAttrs('ui.digitalCpoBadge', 'text')}>${ui.digitalCpoBadge || 'Платформа'}</small>
  `;
  markBlockElement(el, 'digitalCpo');
}

function renderSidebar() {
  const D = getData();
  const ui = D.ui || {};
  const left = document.getElementById('sidebar-left');
  const showWhy = isBlockVisible('platformWhy');
  const showMetrics = isBlockVisible('platformMetrics');
  if (!showWhy && !showMetrics) {
    left.hidden = true;
    left.innerHTML = '';
  } else {
    left.hidden = false;
    const metrics = D.metrics.map((m, i) => `
      <div class="metric"${editAttrs(`metrics.${i}`, 'metric')}>
        <strong>${m.label}</strong>
        <p>${m.description}</p>
      </div>
    `).join('');
    let html = '';
    if (showWhy) {
      html += panel(ui.panels?.platformWhy || 'ЗАЧЕМ ПЛАТФОРМА', `<p class="muted"${editAttrs('ui.platformWhyText', 'text')}>${ui.platformWhyText || ''}</p>`, 'ui.panels.platformWhy', 'platformWhy');
    }
    if (showMetrics) {
      html += panel(ui.panels?.platformMetrics || 'СВЯЗЬ С БИЗНЕСОМ', metrics, 'ui.panels.platformMetrics', 'platformMetrics');
    }
    left.innerHTML = html;
  }

  const right = document.getElementById('sidebar-right');
  if (!isBlockVisible('sidebarRight')) {
    right.hidden = true;
    right.innerHTML = '';
    clearBlockElement(right);
    return;
  }
  right.hidden = false;

  const zone = getSidebarZone();
  const zonePinned = isEditFrozen();
  right.innerHTML = panel(
    `${ui.sidebarZonePrefix || 'ЗОНА · '}${zone.title.toUpperCase()}${zonePinned ? ' 📌' : ''}`,
    `<div class="sidebar-zone-body"${editAttrs(`roleZones.${zone.id}`, 'roleZone')}>
      <p class="muted">${zone.ownership}</p>
      <ul>${zone.responsibilities.map((r) => `<li>${r}</li>`).join('')}</ul>
      <p class="muted">KPI: ${zone.kpis}</p>
    </div>
    <p class="muted sidebar-hint"${editAttrs('ui.sidebarZoneHint', 'text')}>${zonePinned ? 'Зона закреплена — можно редактировать' : (ui.sidebarZoneHint || '')}</p>`,
    null
  );
  markBlockElement(right, 'sidebarRight');
}

function renderDomains() {
  const el = document.getElementById('domains-section');
  if (!isBlockVisible('domains')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const html = D.domains.map((d) => {
    const dimmed = isDomainDimmed(d.id);
    const highlighted = state.hoveredDomain === d.id || (state.selectedCpo && cpoById(state.selectedCpo)?.domain === d.id);
    return `
      <article class="domain ${d.color}${dimmed ? ' dimmed' : ''}${highlighted ? ' highlighted' : ''}"
        data-domain="${d.id}"${editAttrs(`domains.${d.id}`, 'domain')}>
        <div class="domain-head"><strong${editAttrs(`domains.${d.id}.cpoTitle`, 'text')}>${d.cpoTitle}</strong><span${editAttrs(`domains.${d.id}.cpoSubtitle`, 'text')}>${d.cpoSubtitle}</span></div>
        <div class="domain-head platform-head"><strong${editAttrs(`domains.${d.id}.platformTitle`, 'text')}>${d.platformTitle}</strong></div>
        ${d.sections.map((s, si) => `
          <div class="section-block" data-section="${d.id}.${si}"${editAttrs(`domains.${d.id}.sections.${si}`, 'section')}>
            <h4${editAttrs(`domains.${d.id}.sections.${si}.title`, 'text')}>${s.title}</h4>
            <div class="${s.kind === 'text' ? 'text-grid' : 'tile-grid'}">
              ${s.items.map((item) => {
                const active = state.selectedTile === item.id;
                const cls = s.kind === 'text' ? 'text-item' : 'tile';
                return `<button type="button" class="${cls} ${active ? 'active' : ''}${dimmed ? ' dimmed' : ''}"
                  data-tile="${item.id}" title="${item.hint || item.label}"
                  ${editAttrs(`domains.${d.id}.sections.${si}.items.${item.id}`, 'tile')}>${item.label}</button>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </article>
    `;
  }).join('');

  el.innerHTML = `<div class="domains">${html}</div>`;
  markBlockElement(el, 'domains');
}

function renderIntegration() {
  const el = document.getElementById('integration-section');
  if (!isBlockVisible('integration')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const ui = D.ui || {};
  const dimmed = isIntegrationDimmed();
  el.innerHTML = panel(
    ui.panels?.integration || 'ИНТЕГРАЦИЯ И ВЗАИМОДЕЙСТВИЕ ПЛАТФОРМ',
    `<div class="integration-grid${dimmed ? ' dimmed' : ''}">
      ${D.integration.map((i) => {
        const active = state.selectedTile === i.id;
        return `<button type="button" class="integration-item ${active ? 'active' : ''}" data-int="${i.id}" title="${i.hint}"
          ${editAttrs(`integration.${i.id}`, 'tile')}>${i.label}</button>`;
      }).join('')}
    </div>`,
    'ui.panels.integration'
  );
  markBlockElement(el, 'integration');
}

function renderTeams() {
  const el = document.getElementById('teams-section');
  if (!isBlockVisible('teams')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const ui = D.ui || {};
  const showTeams = isEditFrozen() || state.hoveredDomain === 'telecom' || state.selectedCpo !== null;
  const dirs = D.directions.map((dir) => {
    const teams = D.teams.filter((t) => t.direction === dir.id);
    const dirHighlighted = isDirectionHighlighted(dir.id);
    const dirDimmed = state.selectedCpo && !dirHighlighted;
    return `
      <div class="direction${dirDimmed ? ' dimmed' : ''}"${editAttrs(`directions.${dir.id}`, 'direction')}>
        <div class="direction-head${dirHighlighted ? ' highlighted' : ''}">
          ${dir.label}
          <small>${teamCountLabel(teams.length)}</small>
        </div>
        ${teams.map((t) => {
          const highlighted = isTeamHighlighted(t.id);
          const dimmed = state.selectedCpo && !highlighted;
          return `<div class="direction-team${highlighted ? ' highlighted' : ''}${dimmed ? ' dimmed' : ''}"
            ${editAttrs(`teams.${t.id}`, 'team')}>${t.label}</div>`;
        }).join('')}
      </div>
    `;
  }).join('');

  el.innerHTML = panel(
    ui.panels?.teams || 'КОМАНДА ТЕЛЕКОМ ПЛАТФОРМЫ',
    `<div class="directions${showTeams ? '' : ' muted-section'}">${dirs}</div>`,
    'ui.panels.teams'
  );
  markBlockElement(el, 'teams');
}

function renderFlow() {
  const el = document.getElementById('flow-section');
  if (!isBlockVisible('flow')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const cards = D.flowSteps.map((step, idx) => {
    const active = state.selectedFlowStep === step.id;
    const dimmed = state.selectedFlowStep && !active;
    const arrow = idx < D.flowSteps.length - 1 ? '<span class="flow-arrow">→</span>' : '';
    return `
      <button type="button" class="flow-card ${step.color}${active ? ' active' : ''}${dimmed ? ' dimmed' : ''}" data-flow="${step.id}"
        ${editAttrs(`flowSteps.${step.id}`, 'flowStep')}>
        <h3>${step.title}</h3>${step.subtitle ? `<p>${step.subtitle}</p>` : ''}
        <ul>${step.items.map((i) => `<li>${i}</li>`).join('')}</ul>
      </button>${arrow}
    `;
  }).join('');

  el.innerHTML = collapsible(
    (D.ui?.panels?.flow) || '1. Модель взаимодействия',
    `<div class="flow">${cards}</div>`,
    null,
    'ui.panels.flow'
  );
  markBlockElement(el, 'flow');
}

function renderRoles() {
  const el = document.getElementById('roles-section');
  if (!isBlockVisible('roles')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const cards = D.roleZones.map((z) => {
    const active = state.selectedRoleZone === z.id;
    const dimmed = state.selectedRoleZone && !active;
    return `
      <button type="button" class="role-card ${z.color}${active ? ' active' : ''}${dimmed ? ' dimmed' : ''}" data-zone="${z.id}"
        ${editAttrs(`roleZones.${z.id}`, 'roleZone')}>
        <h3>${z.title}</h3>
        <p>${z.subtitle}</p>
        <p>${z.ownership}</p>
        <p><strong>Отвечает за:</strong></p>
        <ul>${z.responsibilities.map((r) => `<li>${r}</li>`).join('')}</ul>
        <div class="role-kpi"><strong>KPI:</strong> ${z.kpis}</div>
      </button>
    `;
  }).join('');

  el.innerHTML = collapsible(
    (D.ui?.panels?.roles) || '2. Описание ролей и зон ответственности',
    `<div class="roles">${cards}</div>`,
    4,
    'ui.panels.roles'
  );
  markBlockElement(el, 'roles');
}

function renderRaci() {
  const el = document.getElementById('raci-section');
  if (!isBlockVisible('raci')) {
    el.hidden = true;
    el.innerHTML = '';
    clearBlockElement(el);
    return;
  }
  el.hidden = false;

  const D = getData();
  const ui = D.ui || {};
  const headers = ui.raciHeaders || ['Зона', 'Head Telecom', 'Head CX', 'Head VAS', 'Platform', 'Product (P&L)'];
  const filtered = state.raciFilter === 'all'
    ? D.raci
    : D.raci.filter((r) =>
        r.telecom === state.raciFilter ||
        r.cx === state.raciFilter ||
        r.vas === state.raciFilter ||
        r.platform === state.raciFilter ||
        r.product === state.raciFilter
      );

  const rows = filtered.map((r, ri) => `
    <tr data-raci-index="${D.raci.indexOf(r)}" ${editAttrs(`raci.${D.raci.indexOf(r)}`, 'raciRow')}>
      <td>${r.area}</td>
      <td class="raci-cell ${state.raciFilter === r.telecom ? 'match' : ''}">${r.telecom}</td>
      <td class="raci-cell ${state.raciFilter === r.cx ? 'match' : ''}">${r.cx}</td>
      <td class="raci-cell ${state.raciFilter === r.vas ? 'match' : ''}">${r.vas}</td>
      <td class="raci-cell ${state.raciFilter === r.platform ? 'match' : ''}">${r.platform}</td>
      <td class="raci-cell ${state.raciFilter === r.product ? 'match' : ''}">${r.product}</td>
    </tr>
  `).join('');

  el.innerHTML = collapsible(
    ui.panels?.raci || 'Легенда RACI',
    `
    <div class="raci-toolbar">
      <span class="muted"${editAttrs('ui.raciLegend', 'text')}>${ui.raciLegend || ''}</span>
      <select id="raci-filter">
        <option value="all">Все роли</option>
        <option value="R">R — Responsible</option>
        <option value="A">A — Accountable</option>
        <option value="C">C — Consulted</option>
        <option value="I">I — Informed</option>
      </select>
    </div>
    <table>
      <thead><tr>${headers.map((h, i) => `<th${editAttrs(`ui.raciHeaders.${i}`, 'text')}>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `,
    D.raci.length,
    'ui.panels.raci'
  );
  markBlockElement(el, 'raci');

  const filter = document.getElementById('raci-filter');
  if (filter) filter.value = state.raciFilter;
}

function render() {
  renderPageMeta();
  renderToolbar();
  renderStatusBar();
  renderBusiness();
  renderDigitalCpo();
  renderSidebar();
  renderDomains();
  renderIntegration();
  renderTeams();
  renderFlow();
  renderRoles();
  renderRaci();
  if (window.ArchEditor) window.ArchEditor.afterRender();
}

function bindEvents() {
  document.body.addEventListener('click', (e) => {
    if (window.EDIT_MODE && e.target.closest('[data-edit-path]') && !e.target.closest('.edit-panel, .edit-toolbar')) {
      return;
    }
    const target = e.target.closest('[data-leader], [data-cpo], [data-tile], [data-int], [data-flow], [data-zone], #reset-btn');
    if (!target) return;

    if (target.id === 'reset-btn') {
      resetSelection();
      return;
    }
    if (target.dataset.leader) {
      setState({ highlightedLeader: state.highlightedLeader === target.dataset.leader ? null : target.dataset.leader });
      return;
    }
    if (target.dataset.cpo) {
      setState({
        selectedCpo: state.selectedCpo === target.dataset.cpo ? null : target.dataset.cpo,
        hoveredDomain: 'telecom',
      });
      return;
    }
    if (target.dataset.tile) {
      setState({ selectedTile: state.selectedTile === target.dataset.tile ? null : target.dataset.tile });
      return;
    }
    if (target.dataset.int) {
      setState({ selectedTile: state.selectedTile === target.dataset.int ? null : target.dataset.int });
      return;
    }
    if (target.dataset.flow) {
      setState({ selectedFlowStep: state.selectedFlowStep === target.dataset.flow ? null : target.dataset.flow });
      return;
    }
    if (target.dataset.zone) {
      setState({ selectedRoleZone: state.selectedRoleZone === target.dataset.zone ? null : target.dataset.zone });
    }
  });

  document.body.addEventListener('change', (e) => {
    if (e.target.id === 'focus-toggle') {
      setState({ focusMode: e.target.checked });
    }
    if (e.target.id === 'raci-filter') {
      setState({ raciFilter: e.target.value });
    }
  });

  document.body.addEventListener('mouseover', (e) => {
    if (isEditFrozen()) return;
    const domain = e.target.closest('[data-domain]');
    if (domain && state.focusMode) {
      if (state.hoveredDomain !== domain.dataset.domain) {
        setState({ hoveredDomain: domain.dataset.domain });
      }
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    if (isEditFrozen()) return;
    const domain = e.target.closest('[data-domain]');
    if (domain && state.focusMode && !state.selectedCpo) {
      const related = e.relatedTarget && e.relatedTarget.closest('[data-domain]');
      if (!related) {
        setState({ hoveredDomain: null });
      }
    }
  });
}

if (!window.ARCH_DATA) {
  document.getElementById('status-bar').textContent = 'Ошибка: не загружен data.js';
} else {
  bindEvents();
  render();
}

window.ArchApp = { getData, render, state, setState, resetSelection, isBlockVisible };
