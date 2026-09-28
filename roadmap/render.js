(function () {
  const D = window.ROADMAP_DATA;
  const scaleStart = Date.parse(`${D.scaleStart}T00:00:00Z`);
  const scaleEnd = Date.parse(`${D.scaleEnd}T00:00:00Z`);
  const span = scaleEnd - scaleStart;

  function pct(dateStr) {
    const t = Date.parse(`${dateStr}T00:00:00Z`);
    return ((t - scaleStart) / span) * 100;
  }

  function barGeom(row) {
    const left = pct(row.start);
    const end = pct(row.end) + (86400000 / span) * 100;
    const width = Math.max(end - left, 0.6);
    return { left, width, style: `left:${left.toFixed(4)}%;width:${width.toFixed(4)}%` };
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const chart = document.querySelector('.chart');
  if (!chart) return;

  const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  function depIds(row) {
    if (!row.dependsOn) return [];
    return [].concat(row.dependsOn);
  }

  function scaleParts() {
    const parts = [];
    let cursor = scaleStart;
    while (cursor < scaleEnd) {
      const d = new Date(cursor);
      const nextMonth = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
      const segEnd = Math.min(nextMonth, scaleEnd);
      const q = Math.floor(d.getUTCMonth() / 3) + 1;
      parts.push({
        width: ((segEnd - cursor) / span) * 100,
        month: `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
        quarter: `${q}Q${String(d.getUTCFullYear()).slice(2)}`,
      });
      cursor = segEnd;
    }
    return parts;
  }

  const parts = scaleParts();
  const quarters = [];
  parts.forEach((part) => {
    const last = quarters[quarters.length - 1];
    if (last && last.label === part.quarter) last.width += part.width;
    else quarters.push({ label: part.quarter, width: part.width });
  });
  const lines = [];
  parts.reduce((acc, part, index) => {
    const next = acc + part.width;
    if (index < parts.length - 1) lines.push(next);
    return next;
  }, 0);
  const gradient = lines.length
    ? `linear-gradient(to right, ${lines.map((line) => {
      const p = line.toFixed(4);
      return `transparent ${p}%, var(--grid) ${p}%, var(--grid) calc(${p}% + 1px), transparent calc(${p}% + 1px)`;
    }).join(', ')})`
    : 'none';
  chart.style.setProperty('--lane-grid', gradient);

  let anchorGeom = null;
  D.blocks.forEach((block) => {
    block.rows.forEach((row) => {
      if (row.id === 'bss-core') anchorGeom = barGeom(row);
    });
  });
  const depAt = anchorGeom ? anchorGeom.left + anchorGeom.width : null;

  document.title = D.title;
  const h1 = document.querySelector('.head h1');
  const sub = document.querySelector('.head .sub');
  if (h1) h1.textContent = D.title;
  if (sub) sub.textContent = D.range;

  let html = `
    <div class="colhead team-col">Команда</div>
    <div class="colhead task-col">Задача</div>
    <div class="scale-head">
      <div class="quarters">
        ${quarters.map((q) => `<span style="width:${q.width.toFixed(4)}%">${esc(q.label)}</span>`).join('')}
      </div>
      <div class="months">
        ${parts.map((part) => `<span style="width:${part.width.toFixed(4)}%">${esc(part.month)}</span>`).join('')}
      </div>
    </div>
    <div class="colhead tbd-col">TBD</div>
  `;

  D.blocks.forEach((block) => {
    html += `<div class="block-title">${esc(block.title)}</div>`;
    block.rows.forEach((row, idx) => {
      const group = idx === 0 ? ' group' : '';
      const ids = depIds(row);
      const dependsOnBss = ids.includes('bss-core');
      const dependsOnPok = ids.includes('pok-combo') || ids.includes('pok-zero');
      const dependsOnPrep = ids.includes('bft') || ids.includes('cjm');
      const orange = dependsOnBss || dependsOnPok;
      const isPokSource = row.id === 'pok-combo' || row.id === 'pok-zero';
      let note = '';
      if (row.requirementsOpen) note += '<span class="task-note open">Требования не финализированы</span>';
      if (dependsOnBss && dependsOnPok) {
        note += '<span class="task-note dep">Зависит от BSS CORE и от ПОК: комбо-наборы, нулевой профиль</span>';
      } else if (dependsOnBss) {
        note += '<span class="task-note dep">Зависит от конфигурирования BSS CORE</span>';
      } else if (dependsOnPok) {
        note += '<span class="task-note dep">Зависит от ПОК: комбо-наборы и нулевой профиль</span>';
      }
      if (dependsOnPrep) note += '<span class="task-note link">Зависит от формирования БФТ и формирования CJM</span>';
      if (isPokSource) note += '<span class="task-note source">От этой работы зависят задачи ЛК</span>';
      const laneMeta = `${row.id ? ` data-id="${esc(row.id)}"` : ''}${dependsOnPrep ? ' data-prep="1"' : ''}`;
      html += `<div class="team${group}">${esc(row.team)}</div>`;
      html += `<div class="task${group}"><span class="task-name">${esc(row.task)}</span>${note}</div>`;
      const depTick = dependsOnBss && depAt != null
        ? `<span class="dep-tick" style="left:${depAt.toFixed(4)}%"></span>`
        : '';
      if (row.tbd) {
        const laneDep = dependsOnBss ? ' dep' : '';
        const tbdCls = orange ? ' dep' : isPokSource ? ' source' : '';
        html += `<div class="lane${laneDep}${group}"${laneMeta}>${depTick}</div>`;
        html += `<div class="tbd-cell${group}"><span class="tbd${tbdCls}">TBD</span></div>`;
        return;
      }
      const cls = [
        'bar',
        row.later ? 'later' : '',
        row.requirementsOpen ? 'open' : '',
        orange ? 'dep' : '',
        row.id === 'bss-core' ? 'anchor' : '',
      ].filter(Boolean).join(' ');
      const geom = barGeom(row);
      const flag = row.id === 'bss-core' && depAt != null
        ? `<span class="dep-flag" style="left:calc(${depAt.toFixed(4)}% + 10px)">От этой работы зависят задачи ЦКО</span>`
        : '';
      const release = row.release
        ? `<span class="release-mark" style="left:${(geom.left + geom.width).toFixed(4)}%"><b>Релиз</b><span>может сдвинуться из-за оценки других задач</span></span>`
        : '';
      html += `<div class="lane${dependsOnBss ? ' dep' : ''}${group}"${laneMeta}><i class="${cls}" style="${geom.style}"></i>${depTick}${flag}${release}</div>`;
      html += `<div class="tbd-cell${group}"></div>`;
    });
  });

  chart.innerHTML = html;
  drawPrepLinks(chart);

  function drawPrepLinks(root) {
    const targets = [...root.querySelectorAll('.lane[data-prep]')];
    const sources = ['bft', 'cjm']
      .map((id) => root.querySelector(`.lane[data-id="${id}"] .bar`))
      .filter(Boolean);
    if (!targets.length || !sources.length) return;
    const crect = root.getBoundingClientRect();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'prep-links');
    svg.setAttribute('width', String(crect.width));
    svg.setAttribute('height', String(crect.height));
    root.appendChild(svg);
    const ns = 'http://www.w3.org/2000/svg';
    sources.forEach((bar, index) => {
      const br = bar.getBoundingClientRect();
      const x0 = br.right - crect.left;
      const y0 = br.top + br.height / 2 - crect.top;
      const laneRight = targets[0].getBoundingClientRect().right - crect.left;
      const gutter = laneRight - 3 - index * 7;
      const yLast = targets[targets.length - 1].getBoundingClientRect();
      const yEnd = yLast.top + yLast.height / 2 - crect.top;
      const spine = document.createElementNS(ns, 'path');
      spine.setAttribute('d', `M ${x0.toFixed(1)} ${y0.toFixed(1)} H ${gutter.toFixed(1)} V ${yEnd.toFixed(1)}`);
      spine.setAttribute('fill', 'none');
      spine.setAttribute('stroke', '#1c2430');
      spine.setAttribute('stroke-width', '1.5');
      if (index === 1) spine.setAttribute('stroke-dasharray', '4 3');
      svg.appendChild(spine);
      targets.forEach((lane) => {
        const lr = lane.getBoundingClientRect();
        const y = lr.top + lr.height / 2 - crect.top;
        const xTip = gutter - 16;
        const tick = document.createElementNS(ns, 'path');
        tick.setAttribute('d', `M ${gutter.toFixed(1)} ${y.toFixed(1)} H ${xTip.toFixed(1)}`);
        tick.setAttribute('fill', 'none');
        tick.setAttribute('stroke', '#1c2430');
        tick.setAttribute('stroke-width', '1.5');
        if (index === 1) tick.setAttribute('stroke-dasharray', '4 3');
        svg.appendChild(tick);
        const head = document.createElementNS(ns, 'path');
        head.setAttribute('d', `M ${(xTip + 6).toFixed(1)} ${(y - 3.5).toFixed(1)} L ${xTip.toFixed(1)} ${y.toFixed(1)} L ${(xTip + 6).toFixed(1)} ${(y + 3.5).toFixed(1)}`);
        head.setAttribute('fill', 'none');
        head.setAttribute('stroke', '#1c2430');
        head.setAttribute('stroke-width', '1.5');
        svg.appendChild(head);
      });
    });
  }
})();
