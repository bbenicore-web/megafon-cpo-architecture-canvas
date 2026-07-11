const D = window.ARCH_DATA;

const state = {
  focusMode: true,
  hoveredDomain: null,
  selectedTile: null,
  selectedCpo: null,
  highlightedLeader: null,
  selectedFlowStep: null,
  selectedRoleZone: null,
  raciFilter: 'all',
  collapsedHint: null,
};

function teamCountLabel(count) {
  if (count === 1) return '1 команда';
  if (count >= 2 && count <= 4) return `${count} команды`;
  return `${count} команд`;
}

function zoneById(id) {
  return D.roleZones.find((z) => z.id === id) || D.roleZones[0];
}

function cpoById(id) {
  return D.cpoRoles.find((c) => c.id === id);
}

function getSidebarZone() {
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
  return D.teams.some((t) => t.direction === dirId && cpo.teamIds.includes(t.id));
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
  return `<section class="panel"><div class="panel-title">${title}</div><div class="panel-body">${body}</div></section>`;
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

function renderToolbar() {
  document.getElementById('toolbar').innerHTML = `
    <label class="toggle">
      <input type="checkbox" id="focus-toggle" ${state.focusMode ? 'checked' : ''}>
      <span>Режим фокуса</span>
    </label>
    <button type="button" class="btn ghost" id="reset-btn">Сбросить</button>
  `;
  document.getElementById('focus-toggle').onchange = (e) => setState({ focusMode: e.target.checked });
  document.getElementById('reset-btn').onclick = resetSelection;
}

function renderStatusBar() {
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

function findTile(id) {
  for (const domain of D.domains) {
    for (const section of domain.sections) {
      const item = section.items.find((i) => i.id === id);
      if (item) return item;
    }
  }
  const integration = D.integration.find((i) => i.id === id);
  return integration || null;
}

function renderBusiness() {
  const leaders = D.businessLeaders.map((l) => {
    const active = state.highlightedLeader === l.id;
    return `<button type="button" class="pill-btn ${active ? 'active' : ''}" data-leader="${l.id}">${l.label}</button>`;
  }).join('');

  const cpos = D.cpoRoles.map((c) => {
    const active = state.selectedCpo === c.id;
    return `<button type="button" class="${btnClass(active, false)} chip-btn" data-cpo="${c.id}">${c.label}</button>`;
  }).join('');

  document.getElementById('business-section').innerHTML = panel('БИЗНЕС-ЗАКАЗЧИКИ', `
    <div class="grid-2 leaders-row">${leaders}</div>
    <p class="muted arrow-hint ${state.highlightedLeader === 'telecom-core' ? 'active' : ''}">↓ управляет CPO направлениями</p>
    <p class="muted" style="margin-bottom:0.5rem">CPO продуктовых направлений</p>
    <div class="chips">${cpos}</div>
    <p class="muted ${state.selectedCpo ? 'active' : ''}" style="margin-top:0.75rem">Запросы от CPO направлений → платформа Telecom</p>
  `);

  document.querySelectorAll('[data-leader]').forEach((el) => {
    el.onclick = () => setState({
      highlightedLeader: state.highlightedLeader === el.dataset.leader ? null : el.dataset.leader,
    });
  });
  document.querySelectorAll('[data-cpo]').forEach((el) => {
    el.onclick = () => setState({
      selectedCpo: state.selectedCpo === el.dataset.cpo ? null : el.dataset.cpo,
      hoveredDomain: 'telecom',
    });
  });
}

function renderDigitalCpo() {
  const vitriny = state.highlightedLeader === 'vitriny';
  document.getElementById('digital-cpo').className = `banner${vitriny ? ' highlighted' : ''}`;
  document.getElementById('digital-cpo').innerHTML = `
    ${D.digitalCpoTitle}
    <small>Платформа</small>
  `;
}

function renderSidebar() {
  const metrics = D.metrics.map((m) => `
    <div class="metric"><strong>${m.label}</strong><p>${m.description}</p></div>
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
  const html = D.domains.map((d) => {
    const dimmed = isDomainDimmed(d.id);
    const highlighted = state.hoveredDomain === d.id || (state.selectedCpo && cpoById(state.selectedCpo)?.domain === d.id);
    return `
      <article class="domain ${d.color}${dimmed ? ' dimmed' : ''}${highlighted ? ' highlighted' : ''}"
        data-domain="${d.id}">
        <div class="domain-head"><strong>${d.cpoTitle}</strong><span>${d.cpoSubtitle}</span></div>
        <div class="domain-head platform-head"><strong>${d.platformTitle}</strong></div>
        ${d.sections.map((s) => `
          <div class="section-block">
            <h4>${s.title}</h4>
            <div class="${s.kind === 'text' ? 'text-grid' : 'tile-grid'}">
              ${s.items.map((item) => {
                const active = state.selectedTile === item.id;
                const cls = s.kind === 'text' ? 'text-item' : 'tile';
                return `<button type="button" class="${cls} ${active ? 'active' : ''}${dimmed ? ' dimmed' : ''}"
                  data-tile="${item.id}" title="${item.hint || item.label}">${item.label}</button>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </article>
    `;
  }).join('');

  document.getElementById('domains-section').innerHTML = `<div class="domains">${html}</div>`;

  document.querySelectorAll('[data-domain]').forEach((el) => {
    el.onmouseenter = () => { if (state.focusMode) setState({ hoveredDomain: el.dataset.domain }); };
    el.onmouseleave = () => { if (state.focusMode && state.hoveredDomain === el.dataset.domain && !state.selectedCpo) setState({ hoveredDomain: null }); };
  });
  document.querySelectorAll('[data-tile]').forEach((el) => {
    el.onclick = () => setState({ selectedTile: state.selectedTile === el.dataset.tile ? null : el.dataset.tile });
  });
}

function renderIntegration() {
  const dimmed = isIntegrationDimmed();
  document.getElementById('integration-section').innerHTML = panel(
    'ИНТЕГРАЦИЯ И ВЗАИМОДЕЙСТВИЕ ПЛАТФОРМ',
    `<div class="integration-grid${dimmed ? ' dimmed' : ''}">
      ${D.integration.map((i) => {
        const active = state.selectedTile === i.id;
        return `<button type="button" class="integration-item ${active ? 'active' : ''}" data-int="${i.id}" title="${i.hint}">${i.label}</button>`;
      }).join('')}
    </div>`
  );
  document.querySelectorAll('[data-int]').forEach((el) => {
    el.onclick = () => setState({ selectedTile: state.selectedTile === el.dataset.int ? null : el.dataset.int });
  });
}

function renderTeams() {
  const showTeams = state.hoveredDomain === 'telecom' || state.selectedCpo !== null;
  const dirs = D.directions.map((dir) => {
    const teams = D.teams.filter((t) => t.direction === dir.id);
    const dirHighlighted = isDirectionHighlighted(dir.id);
    const dirDimmed = state.selectedCpo && !dirHighlighted;
    return `
      <div class="direction${dirDimmed ? ' dimmed' : ''}">
        <div class="direction-head${dirHighlighted ? ' highlighted' : ''}">
          ${dir.label}
          <small>${teamCountLabel(teams.length)}</small>
        </div>
        ${teams.map((t) => {
          const highlighted = isTeamHighlighted(t.id);
          const dimmed = state.selectedCpo && !highlighted;
          return `<div class="direction-team${highlighted ? ' highlighted' : ''}${dimmed ? ' dimmed' : ''}">${t.label}</div>`;
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
  const cards = D.flowSteps.map((step, idx) => {
    const active = state.selectedFlowStep === step.id;
    const dimmed = state.selectedFlowStep && !active;
    const arrow = idx < D.flowSteps.length - 1 ? '<span class="flow-arrow">→</span>' : '';
    return `
      <button type="button" class="flow-card ${step.color}${active ? ' active' : ''}${dimmed ? ' dimmed' : ''}" data-flow="${step.id}">
        <h3>${step.title}</h3>${step.subtitle ? `<p>${step.subtitle}</p>` : ''}
        <ul>${step.items.map((i) => `<li>${i}</li>`).join('')}</ul>
      </button>${arrow}
    `;
  }).join('');

  const el = document.getElementById('flow-section');
  el.innerHTML = collapsible('1. Модель взаимодействия', `<div class="flow">${cards}</div>`);
  document.querySelectorAll('[data-flow]').forEach((btn) => {
    btn.onclick = () => setState({ selectedFlowStep: state.selectedFlowStep === btn.dataset.flow ? null : btn.dataset.flow });
  });
}

function renderRoles() {
  const cards = D.roleZones.map((z) => {
    const active = state.selectedRoleZone === z.id;
    const dimmed = state.selectedRoleZone && !active;
    return `
      <button type="button" class="role-card ${z.color}${active ? ' active' : ''}${dimmed ? ' dimmed' : ''}" data-zone="${z.id}">
        <h3>${z.title}</h3>
        <p>${z.subtitle}</p>
        <p>${z.ownership}</p>
        <p><strong>Отвечает за:</strong></p>
        <ul>${z.responsibilities.map((r) => `<li>${r}</li>`).join('')}</ul>
        <div class="role-kpi"><strong>KPI:</strong> ${z.kpis}</div>
      </button>
    `;
  }).join('');

  const el = document.getElementById('roles-section');
  el.innerHTML = collapsible('2. Описание ролей и зон ответственности', `<div class="roles">${cards}</div>`, 4);
  document.querySelectorAll('[data-zone]').forEach((btn) => {
    btn.onclick = () => setState({ selectedRoleZone: state.selectedRoleZone === btn.dataset.zone ? null : btn.dataset.zone });
  });
}

function renderRaci() {
  const filtered = state.raciFilter === 'all'
    ? D.raci
    : D.raci.filter((r) =>
        r.telecom === state.raciFilter ||
        r.cx === state.raciFilter ||
        r.vas === state.raciFilter ||
        r.platform === state.raciFilter ||
        r.product === state.raciFilter
      );

  const rows = filtered.map((r) => `
    <tr>
      <td>${r.area}</td>
      <td class="raci-cell ${state.raciFilter === r.telecom ? 'match' : ''}">${r.telecom}</td>
      <td class="raci-cell ${state.raciFilter === r.cx ? 'match' : ''}">${r.cx}</td>
      <td class="raci-cell ${state.raciFilter === r.vas ? 'match' : ''}">${r.vas}</td>
      <td class="raci-cell ${state.raciFilter === r.platform ? 'match' : ''}">${r.platform}</td>
      <td class="raci-cell ${state.raciFilter === r.product ? 'match' : ''}">${r.product}</td>
    </tr>
  `).join('');

  const el = document.getElementById('raci-section');
  el.innerHTML = collapsible('Легенда RACI', `
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
  filter.value = state.raciFilter;
  filter.onchange = (e) => setState({ raciFilter: e.target.value });
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
}

render();
