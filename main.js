let csvData = [];
let headers = [];

const csvFileInput = document.getElementById('csvFile');
const importBtn = document.getElementById('importBtn');
const csvTable = document.getElementById('csvTable');
const thead = csvTable.querySelector('thead');
const tbody = csvTable.querySelector('tbody');
const addRowBtn = document.getElementById('addRowBtn');
const newRowForm = document.getElementById('newRowForm');
const exportBtn = document.getElementById('exportBtn');
const columnSelect = document.getElementById('columnSelect');
const showChartBtn = document.getElementById('showChartBtn');

let chartInstance = null;

importBtn.addEventListener('click', () => {
  if (!csvFileInput.files.length) {
    alert('Bitte wähle eine CSV-Datei aus!');
    return;
  }
  const file = csvFileInput.files[0];
  Papa.parse(file, {
    header: true,         
    skipEmptyLines: true, 
    complete: function(results) {
      csvData = results.data;
      headers = results.meta.fields;
      renderTable();
      renderNewRowForm();
      renderColumnSelect();
      alert('CSV-Datei erfolgreich importiert!');
    },
    error: function(err) {
      console.error(err);
      alert('Fehler beim Parsen der CSV-Datei!');
    }
  });
});

function renderTable() {
  thead.innerHTML = '';
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  const actionTh = document.createElement('th');
  actionTh.textContent = 'Aktionen';
  headerRow.appendChild(actionTh);
  thead.appendChild(headerRow);

  tbody.innerHTML = '';
  csvData.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');

    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header];
      tr.appendChild(td);
    });

    const actionTd = document.createElement('td');
    const editLink = document.createElement('span');
    editLink.classList.add('edit-btn');
    editLink.textContent = 'Bearbeiten';
    editLink.addEventListener('click', () => {
      editRow(rowIndex);
    });
    actionTd.appendChild(editLink);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
}

function renderNewRowForm() {
  newRowForm.innerHTML = '';
  headers.forEach(header => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = header;
    input.name = header;
    newRowForm.appendChild(input);
  });
}

addRowBtn.addEventListener('click', () => {
  const newRowObj = {};
  headers.forEach(header => {
    const input = newRowForm.querySelector(`input[name="${header}"]`);
    newRowObj[header] = input.value.trim();
  });
  csvData.push(newRowObj);
  renderTable();
  renderNewRowForm();
});

function editRow(rowIndex) {
  const rowObj = csvData[rowIndex];
  headers.forEach(header => {
    const newValue = prompt(`Neuer Wert für ${header}:`, rowObj[header]);
    if (newValue !== null) {
      rowObj[header] = newValue.trim();
    }
  });
  csvData[rowIndex] = rowObj;
  renderTable();
}

function renderColumnSelect() {
  columnSelect.innerHTML = '';
  headers.forEach(header => {
    const option = document.createElement('option');
    option.value = header;
    option.textContent = header;
    columnSelect.appendChild(option);
  });
}

showChartBtn.addEventListener('click', () => {
  const selectedColumn = columnSelect.value;
  if (!selectedColumn) {
    alert('Bitte wähle eine Spalte aus!');
    return;
  }

  const frequencyMap = {};
  csvData.forEach(row => {
    const value = row[selectedColumn] || '';
    if (!frequencyMap[value]) {
      frequencyMap[value] = 0;
    }
    frequencyMap[value]++;
  });

  const labels = Object.keys(frequencyMap);
  const counts = Object.values(frequencyMap);

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById('myChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Häufigkeit',
        data: counts
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
});

exportBtn.addEventListener('click', () => {
  const csv = Papa.unparse({
    fields: headers,
    data: csvData.map(rowObj => {
      return headers.map(h => rowObj[h] || '');
    })
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
