function getData() {
  return window.ARCH_DATA;
}

function editAttrs(path, type) {
  if (!window.EDIT_MODE) return '';
  return ` data-edit-path="${path}" data-edit-type="${type}"`;
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
  if (state.selectedRoleZone) return zoneById(state.selectedRoleZone);
  if (state.hoveredDomain) return zoneById(D.domainToZone[state.hoveredDomain]);
  if (state.selectedCpo) {
    const cpo = cpoById(state.selectedCpo);
    if (cpo) return zoneById(D.domainToZone[cpo.domain]);
  }
  return zoneById('digital');
}

function isDomainDimmed(domainId) {
  if (state.selectedCpo) {
    const cpo = cpoById(state.selectedCpo);
    return cpo ? cpo.domain !== domainId : false;
  }
  if (state.focusMode && state.hoveredDomain) return state.hoveredDomain !== domainId;
  return false;
}

function isIntegrationDimmed() {
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

function panel(title, body) {
  return `<div class="panel-inner"><div class="panel-title">${title}</div><div class="panel-body">${body}</div></div>`;
}

function collapsible(title, body, count) {
  const countBadge = count ? `<span class="badge">${count}</span>` : '';
  return `<summary class="panel-title collapsible-title">${title}${countBadge}</summary><div class="panel-body">${body}</div>`;
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
    : 'Кликните на элемент схемы или наведите на колонку платформы';
}

function renderBusiness() {
  const D = getData();
  const leaders = D.businessLeaders.map((l) => {
    const active = state.highlightedLeader === l.id;
    return `<button type="button" class="pill-btn ${active ? 'active' : ''}" data-leader="${l.id}"${editAttrs(`businessLeaders.${l.id}.label`, 'text')}>${l.label}</button>`;
  }).join('');

  const cpos = D.cpoRoles.map((c) => {
    const active = state.selectedCpo === c.id;
    return `<button type="button" class="${btnClass(active, false)} chip-btn" data-cpo="${c.id}"${editAttrs(`cpoRoles.${c.id}.label`, 'text')}>${c.label}</button>`;
  }).join('');

  document.getElementById('business-section').innerHTML = panel('БИЗНЕС-ЗАКАЗЧИКИ', `
    <div class="grid-2 leaders-row">${leaders}</div>
    <p class="muted arrow-hint ${state.highlightedLeader === 'telecom-core' ? 'active' : ''}">↓ управляет CPO направлениями</p>
    <p class="muted" style="margin-bottom:0.5rem">CPO продуктовых направлений</p>
    <div class="chips">${cpos}</div>
    <p class="muted ${state.selectedCpo ? 'active' : ''}" style="margin-top:0.75rem">Запросы от CPO направлений → платформа Telecom</p>
  `);
}

function renderDigitalCpo() {
  const D = getData();
  const vitriny = state.highlightedLeader === 'vitriny';
  document.getElementById('digital-cpo').className = `banner${vitriny ? ' highlighted' : ''}`;
  document.getElementById('digital-cpo').innerHTML = `
    <span${editAttrs('digitalCpoTitle', 'text')}>${D.digitalCpoTitle}</span>
    <small>Платформа</small>
  `;
}

function renderSidebar() {
  const D = getData();
  const metrics = D.metrics.map((m, i) => `
    <div class="metric"${editAttrs(`metrics.${i}`, 'metric')}>
      <strong${editAttrs(`metrics.${i}.label`, 'text')}>${m.label}</strong>
      <p${editAttrs(`metrics.${i}.description`, 'text')}>${m.description}</p>
    </div>
  `).join('');

  document.getElementById('sidebar-left').innerHTML = `
    ${panel('ЗАЧЕМ ПЛАТФОРМА', '<p class="muted">Платформа даёт общие capabilities — каталоги, поиск, навигацию, профиль и сервисы — всем доменам. Новые продукты запускаются быстрее и выглядят единообразно.</p>')}
    ${panel('СВЯЗЬ С БИЗНЕСОМ', metrics)}
  `;

  const zone = getSidebarZone();
  document.getElementById('sidebar-right').innerHTML = panel(
    `ЗОНА · ${zone.title.toUpperCase()}`,
    `<p class="muted">${zone.ownership}</p>
     <ul>${zone.responsibilities.slice(0, 4).map((r) => `<li>${r}</li>`).join('')}</ul>
     <p class="muted">KPI: ${zone.kpis}</p>`
  );
}

function renderDomains() {
  const D = getData();
  const html = D.domains.map((d) => {
    const dimmed = isDomainDimmed(d.id);
    const highlighted = state.hoveredDomain === d.id || (state.selectedCpo && cpoById(state.selectedCpo)?.domain === d.id);
    return `
      <article class="domain ${d.color}${dimmed ? ' dimmed' : ''}${highlighted ? ' highlighted' : ''}"
        data-domain="${d.id}">
        <div class="domain-head"${editAttrs(`domains.${d.id}.cpoTitle`, 'text')}><strong>${d.cpoTitle}</strong><span${editAttrs(`domains.${d.id}.cpoSubtitle`, 'text')}>${d.cpoSubtitle}</span></div>
        <div class="domain-head platform-head"${editAttrs(`domains.${d.id}.platformTitle`, 'text')}><strong>${d.platformTitle}</strong></div>
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

  document.getElementById('domains-section').innerHTML = `<div class="domains">${html}</div>`;
}

function renderIntegration() {
  const D = getData();
  const dimmed = isIntegrationDimmed();
  document.getElementById('integration-section').innerHTML = panel(
    'ИНТЕГРАЦИЯ И ВЗАИМОДЕЙСТВИЕ ПЛАТФОРМ',
    `<div class="integration-grid${dimmed ? ' dimmed' : ''}">
      ${D.integration.map((i) => {
        const active = state.selectedTile === i.id;
        return `<button type="button" class="integration-item ${active ? 'active' : ''}" data-int="${i.id}" title="${i.hint}"
          ${editAttrs(`integration.${i.id}`, 'tile')}>${i.label}</button>`;
      }).join('')}
    </div>`
  );
}

function renderTeams() {
  const D = getData();
  const showTeams = state.hoveredDomain === 'telecom' || state.selectedCpo !== null;
  const dirs = D.directions.map((dir) => {
    const teams = D.teams.filter((t) => t.direction === dir.id);
    const dirHighlighted = isDirectionHighlighted(dir.id);
    const dirDimmed = state.selectedCpo && !dirHighlighted;
    return `
      <div class="direction${dirDimmed ? ' dimmed' : ''}">
        <div class="direction-head${dirHighlighted ? ' highlighted' : ''}"${editAttrs(`directions.${dir.id}.label`, 'text')}>
          ${dir.label}
          <small>${teamCountLabel(teams.length)}</small>
        </div>
        ${teams.map((t) => {
          const highlighted = isTeamHighlighted(t.id);
          const dimmed = state.selectedCpo && !highlighted;
          return `<div class="direction-team${highlighted ? ' highlighted' : ''}${dimmed ? ' dimmed' : ''}"
            ${editAttrs(`teams.${t.id}.label`, 'text')}>${t.label}</div>`;
        }).join('')}
      </div>
    `;
  }).join('');

  document.getElementById('teams-section').innerHTML = panel(
    'КОМАНДА ТЕЛЕКОМ ПЛАТФОРМЫ',
    `<div class="directions${showTeams ? '' : ' muted-section'}">${dirs}</div>`
  );
}

function renderFlow() {
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

  document.getElementById('flow-section').innerHTML = collapsible('1. Модель взаимодействия', `<div class="flow">${cards}</div>`);
}

function renderRoles() {
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

  document.getElementById('roles-section').innerHTML = collapsible('2. Описание ролей и зон ответственности', `<div class="roles">${cards}</div>`, 4);
}

function renderRaci() {
  const D = getData();
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

  document.getElementById('raci-section').innerHTML = collapsible('Легенда RACI', `
    <div class="raci-toolbar">
      <span class="muted">R — исполняет · A — отвечает · C — консультирует · I — информируется</span>
      <select id="raci-filter">
        <option value="all">Все роли</option>
        <option value="R">R — Responsible</option>
        <option value="A">A — Accountable</option>
        <option value="C">C — Consulted</option>
        <option value="I">I — Informed</option>
      </select>
    </div>
    <table>
      <thead><tr><th>Зона</th><th>Head Telecom</th><th>Head CX</th><th>Head VAS</th><th>Platform</th><th>Product (P&L)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `, D.raci.length);

  const filter = document.getElementById('raci-filter');
  if (filter) filter.value = state.raciFilter;
}

function render() {
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
    const domain = e.target.closest('[data-domain]');
    if (domain && state.focusMode) {
      if (state.hoveredDomain !== domain.dataset.domain) {
        setState({ hoveredDomain: domain.dataset.domain });
      }
    }
  });

  document.body.addEventListener('mouseout', (e) => {
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

window.ArchApp = { getData, render, state, setState, resetSelection };
