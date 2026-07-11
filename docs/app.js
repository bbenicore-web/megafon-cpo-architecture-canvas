const D = window.ARCH_DATA;

function panel(title, body) {
  return `<section class="panel"><div class="panel-title">${title}</div><div class="panel-body">${body}</div></section>`;
}

function renderBusiness() {
  const leaders = D.businessLeaders.map((l) => `<span class="pill">${l}</span>`).join('');
  const cpos = D.cpoRoles.map((c) => `<span class="chip">${c}</span>`).join('');
  document.getElementById('business-section').innerHTML = panel('БИЗНЕС-ЗАКАЗЧИКИ', `
    <div class="grid-2" style="margin-bottom:0.75rem">${leaders}</div>
    <p class="muted" style="margin-bottom:0.5rem">CPO продуктовых направлений</p>
    <div class="chips">${cpos}</div>
    <p class="muted" style="margin-top:0.75rem">Запросы от CPO направлений → платформа Telecom</p>
  `);
}

function renderDigitalCpo() {
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
  document.getElementById('sidebar-right').innerHTML = panel(
    'ЗОНА · CPO ЦИФРОВОГО ПРОДУКТА',
    `<p class="muted">${D.roleZones[0].ownership}</p>
     <ul>${D.roleZones[0].responsibilities.slice(0, 4).map((r) => `<li>${r}</li>`).join('')}</ul>
     <p class="muted">KPI: ${D.roleZones[0].kpis}</p>`
  );
}

function renderDomains() {
  const html = D.domains.map((d) => `
    <article class="domain ${d.color}">
      <div class="domain-head"><strong>${d.cpoTitle}</strong><span>${d.cpoSubtitle}</span></div>
      <div class="domain-head" style="text-align:center;margin-top:0"><strong>${d.platformTitle}</strong></div>
      ${d.sections.map((s) => `
        <div class="section-block">
          <h4>${s.title}</h4>
          <div class="${s.title.includes('СЕРВИС') || s.title.includes('ПРИНЦИП') || s.title.includes('ОПЫТ VAS') ? 'text-grid' : 'tile-grid'}">
            ${s.items.map((item) => `<div class="${s.title.includes('СЕРВИС') || s.title.includes('ПРИНЦИП') || s.title.includes('ОПЫТ VAS') ? 'text-item' : 'tile'}">${item}</div>`).join('')}
          </div>
        </div>
      `).join('')}
    </article>
  `).join('');
  document.getElementById('domains-section').innerHTML = `<div class="domains">${html}</div>`;
}

function renderIntegration() {
  document.getElementById('integration-section').innerHTML = panel(
    'ИНТЕГРАЦИЯ И ВЗАИМОДЕЙСТВИЕ ПЛАТФОРМ',
    `<div class="integration-grid">${D.integration.map((i) => `<div class="integration-item">${i}</div>`).join('')}</div>`
  );
}

function renderTeams() {
  const dirs = D.directions.map((dir) => `
    <div class="direction">
      <div class="direction-head">${dir.label}<small>${dir.teams.length} ${dir.teams.length === 1 ? 'команда' : dir.teams.length < 5 ? 'команды' : 'команд'}</small></div>
      ${dir.teams.map((t) => `<div class="direction-team">${t}</div>`).join('')}
    </div>
  `).join('');
  document.getElementById('teams-section').innerHTML = panel('КОМАНДА ТЕЛЕКОМ ПЛАТФОРМЫ', `<div class="directions">${dirs}</div>`);
}

function renderFlow() {
  const cards = D.flowSteps.map((step, idx) => {
    const arrow = idx < D.flowSteps.length - 1 ? '<span class="flow-arrow">→</span>' : '';
    return `
      <div class="flow-card ${step.color}"><h3>${step.title}</h3>${step.subtitle ? `<p>${step.subtitle}</p>` : ''}<ul>${step.items.map((i) => `<li>${i}</li>`).join('')}</ul></div>${arrow}
    `;
  }).join('');
  document.getElementById('flow-section').innerHTML = panel('1. Модель взаимодействия', `<div class="flow">${cards}</div>`);
}

function renderRoles() {
  const cards = D.roleZones.map((z) => `
    <article class="role-card ${z.color}">
      <h3>${z.title}</h3>
      <p>${z.subtitle}</p>
      <p>${z.ownership}</p>
      <p><strong>Отвечает за:</strong></p>
      <ul>${z.responsibilities.map((r) => `<li>${r}</li>`).join('')}</ul>
      <div class="role-kpi"><strong>KPI:</strong> ${z.kpis}</div>
    </article>
  `).join('');
  document.getElementById('roles-section').innerHTML = panel('2. Описание ролей и зон ответственности', `<div class="roles">${cards}</div>`);
}

function renderRaci() {
  const rows = D.raci.map((r) => `
    <tr>
      <td>${r.area}</td>
      <td class="raci-cell">${r.telecom}</td>
      <td class="raci-cell">${r.cx}</td>
      <td class="raci-cell">${r.vas}</td>
      <td class="raci-cell">${r.platform}</td>
      <td class="raci-cell">${r.product}</td>
    </tr>
  `).join('');
  document.getElementById('raci-section').innerHTML = panel('Легенда RACI', `
    <p class="muted" style="margin-bottom:0.5rem">R — исполняет · A — отвечает · C — консультирует · I — информируется</p>
    <table>
      <thead><tr><th>Зона</th><th>Head Telecom</th><th>Head CX</th><th>Head VAS</th><th>Platform</th><th>Product (P&L)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `);
}

renderBusiness();
renderDigitalCpo();
renderSidebar();
renderDomains();
renderIntegration();
renderTeams();
renderFlow();
renderRoles();
renderRaci();
