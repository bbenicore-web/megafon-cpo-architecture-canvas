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
        <span style="width:19.6078%">3Q26</span>
        <span style="width:60.1306%">4Q26</span>
        <span style="width:20.2614%">1Q27</span>
      </div>
      <div class="months">
        <span style="width:19.6078%">Сентябрь 2026</span>
        <span style="width:20.2614%">Октябрь 2026</span>
        <span style="width:19.6078%">Ноябрь 2026</span>
        <span style="width:20.2614%">Декабрь 2026</span>
        <span style="width:20.2614%">Январь 2027</span>
      </div>
    </div>
    <div class="colhead tbd-col">TBD</div>
  `;

  D.blocks.forEach((block) => {
    html += `<div class="block-title">${esc(block.title)}</div>`;
    block.rows.forEach((row, idx) => {
      const group = idx === 0 ? ' group' : '';
      html += `<div class="team${group}">${esc(row.team)}</div>`;
      html += `<div class="task${group}">${esc(row.task)}</div>`;
      if (row.tbd) {
        html += `<div class="lane${group}"></div>`;
        html += `<div class="tbd-cell${group}"><span class="tbd">TBD</span></div>`;
        return;
      }
      const cls = row.later ? 'bar later' : 'bar';
      const geom = barGeom(row);
      html += `<div class="lane${group}"><i class="${cls}" style="${geom.style}"></i></div>`;
      html += `<div class="tbd-cell${group}"></div>`;
    });
  });

  chart.innerHTML = html;
})();
