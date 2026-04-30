// === V12 Flex Generator — vanilla JS ===

// --- État initial (exemple S65 AMG du post Instagram) ---
const DEFAULT_DATA = [
  { year: 2015, value: 230000, maint: 0 },
  { year: 2016, value: 170000, maint: 5000 },
  { year: 2017, value: 145000, maint: 12000 },
  { year: 2018, value: 135000, maint: 18000 },
  { year: 2019, value: 128000, maint: 22000 },
  { year: 2020, value: 122000, maint: 26000 },
  { year: 2021, value: 118000, maint: 29000 },
  { year: 2022, value: 115000, maint: 31500 },
  { year: 2023, value: 112000, maint: 33500 },
  { year: 2024, value: 110215, maint: 34960 }
];

let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
let chart = null;

// --- DOM refs ---
const $ = (id) => document.getElementById(id);
const dataBody = $('dataBody');
const titleInput = $('title');
const vehicleLabelInput = $('vehicleLabel');
const maintLabelInput = $('maintLabel');
const currencySelect = $('currency');
const chartTitleDisplay = $('chartTitleDisplay');
const chartYearDisplay = $('chartYearDisplay');

// --- Format helpers ---
const fmtMoney = (n) => {
  const c = currencySelect.value;
  const formatted = Math.round(n).toLocaleString('en-US');
  return c === '€' || c === '£' || c === '¥' ? `${c}${formatted}` : `${c}${formatted}`;
};

// --- Render data table ---
function renderTable() {
  dataBody.innerHTML = '';
  data.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="number" data-field="year" data-idx="${idx}" value="${row.year}" step="1"></td>
      <td><input type="number" data-field="value" data-idx="${idx}" value="${row.value}" step="100" min="0"></td>
      <td><input type="number" data-field="maint" data-idx="${idx}" value="${row.maint}" step="100" min="0"></td>
      <td><button class="btn-delete" data-del="${idx}" title="Supprimer">×</button></td>
    `;
    dataBody.appendChild(tr);
  });

  // Attach listeners
  dataBody.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', onCellChange);
  });
  dataBody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', onDeleteRow);
  });
}

function onCellChange(e) {
  const idx = parseInt(e.target.dataset.idx, 10);
  const field = e.target.dataset.field;
  const val = parseFloat(e.target.value) || 0;
  data[idx][field] = val;
  renderChart();
}

function onDeleteRow(e) {
  const idx = parseInt(e.target.dataset.del, 10);
  data.splice(idx, 1);
  renderTable();
  renderChart();
}

// --- Add/Reset ---
$('addRow').addEventListener('click', () => {
  const last = data[data.length - 1];
  const newYear = last ? last.year + 1 : new Date().getFullYear();
  const newValue = last ? Math.round(last.value * 0.92) : 100000;
  const newMaint = last ? last.maint + 3000 : 0;
  data.push({ year: newYear, value: newValue, maint: newMaint });
  renderTable();
  renderChart();
});

$('resetData').addEventListener('click', () => {
  if (confirm('Réinitialiser avec les données exemple ?')) {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    renderTable();
    renderChart();
  }
});

// --- Title / labels / currency listeners ---
titleInput.addEventListener('input', () => {
  chartTitleDisplay.textContent = titleInput.value;
});
[vehicleLabelInput, maintLabelInput, currencySelect].forEach(el => {
  el.addEventListener('input', renderChart);
  el.addEventListener('change', renderChart);
});

// --- Chart rendering ---
function renderChart() {
  const ctx = $('chart').getContext('2d');
  const labels = data.map(d => d.year);
  const values = data.map(d => d.value);
  const maints = data.map(d => d.maint);

  // Last point labels
  const lastIdx = data.length - 1;
  const vehicleLabelText = data.length ? `${vehicleLabelInput.value} ${fmtMoney(values[lastIdx])}` : '';
  const maintLabelText = data.length ? `${maintLabelInput.value} ${fmtMoney(maints[lastIdx])}` : '';

  // Update year display
  chartYearDisplay.textContent = data.length ? labels[lastIdx] : '';

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: vehicleLabelInput.value,
          data: values,
          borderColor: '#00d4e0',
          backgroundColor: '#00d4e0',
          borderWidth: 4,
          tension: 0.4,
          pointRadius: (c) => c.dataIndex === lastIdx ? 6 : 0,
          pointBackgroundColor: '#00d4e0',
          pointBorderColor: '#00d4e0'
        },
        {
          label: maintLabelInput.value,
          data: maints,
          borderColor: '#ff3b3b',
          backgroundColor: '#ff3b3b',
          borderWidth: 4,
          tension: 0.4,
          pointRadius: (c) => c.dataIndex === lastIdx ? 6 : 0,
          pointBackgroundColor: '#ff3b3b',
          pointBorderColor: '#ff3b3b'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      layout: { padding: { right: 90, top: 10, bottom: 10 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c1c',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#2a2a2a',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${fmtMoney(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          display: false,
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#888',
            font: { size: 11 },
            callback: (v) => fmtMoney(v)
          },
          grid: { display: false },
          border: { color: '#444' }
        }
      }
    },
    plugins: [endLabelPlugin(vehicleLabelText, maintLabelText)]
  });
}

// --- Custom plugin: draw end-of-line labels (like the Instagram post) ---
function endLabelPlugin(vehicleText, maintText) {
  return {
    id: 'endLabels',
    afterDatasetsDraw(chart) {
      const { ctx, data: chartData, scales } = chart;
      if (!chartData.datasets.length || !chartData.labels.length) return;

      const lastIdx = chartData.labels.length - 1;
      ctx.save();
      ctx.font = '600 13px -apple-system, system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      // Vehicle label
      const meta0 = chart.getDatasetMeta(0);
      if (meta0.data[lastIdx]) {
        const pt = meta0.data[lastIdx];
        ctx.fillStyle = '#00d4e0';
        ctx.fillText(vehicleText, pt.x + 12, pt.y);
      }

      // Maintenance label
      const meta1 = chart.getDatasetMeta(1);
      if (meta1.data[lastIdx]) {
        const pt = meta1.data[lastIdx];
        ctx.fillStyle = '#ff3b3b';
        ctx.fillText(maintText, pt.x + 12, pt.y);
      }
      ctx.restore();
    }
  };
}

// --- PNG Export ---
$('exportPng').addEventListener('click', () => {
  const card = $('chartCard');

  // Use html2canvas-free approach: composite manually
  const chartCanvas = $('chart');
  const cardRect = card.getBoundingClientRect();

  // Create export canvas at 2x for retina quality
  const scale = 2;
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = cardRect.width * scale;
  exportCanvas.height = cardRect.height * scale;
  const ectx = exportCanvas.getContext('2d');
  ectx.scale(scale, scale);

  // Black background
  ectx.fillStyle = '#000';
  ectx.fillRect(0, 0, cardRect.width, cardRect.height);

  // Title
  ectx.fillStyle = '#fff';
  ectx.font = 'italic 500 26px -apple-system, system-ui, sans-serif';
  ectx.textAlign = 'center';
  ectx.fillText(titleInput.value, cardRect.width / 2, 56);

  // Draw chart
  const chartRect = chartCanvas.getBoundingClientRect();
  const chartX = chartRect.left - cardRect.left;
  const chartY = chartRect.top - cardRect.top;
  ectx.drawImage(chartCanvas, chartX, chartY, chartRect.width, chartRect.height);

  // Year
  if (data.length) {
    ectx.fillStyle = '#fff';
    ectx.font = '300 36px -apple-system, system-ui, sans-serif';
    ectx.textAlign = 'center';
    ectx.fillText(data[data.length - 1].year, cardRect.width / 2, cardRect.height - 30);
  }

  // Trigger download
  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `v12-flex-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PNG exporté ✓');
  }, 'image/png');
});

// --- Copy JSON ---
$('copyJson').addEventListener('click', async () => {
  const payload = {
    title: titleInput.value,
    vehicleLabel: vehicleLabelInput.value,
    maintLabel: maintLabelInput.value,
    currency: currencySelect.value,
    data
  };
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    showToast('JSON copié ✓');
  } catch (e) {
    alert('Impossible de copier — votre navigateur bloque clipboard.');
  }
});

// --- Toast ---
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

// --- Init ---
chartTitleDisplay.textContent = titleInput.value;
renderTable();
renderChart();
