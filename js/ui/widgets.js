/**
 * UI Widget Factory for control panel sliders, toggles, selects, buttons, and color pickers.
 */

export function createSliderWidget({ label, key, min, max, step, value, onChange }) {
  const row = document.createElement('div');
  row.className = 'ctrl-row';

  const labelEl = document.createElement('label');
  labelEl.className = 'ctrl-label';
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'ctrl-slider';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;

  const valDisplay = document.createElement('span');
  valDisplay.className = 'ctrl-value';
  valDisplay.textContent = typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(2)) : value;

  input.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valDisplay.textContent = Number.isInteger(step) ? val : val.toFixed(2);
    onChange(val);
  });

  row.appendChild(labelEl);
  row.appendChild(input);
  row.appendChild(valDisplay);

  return {
    element: row,
    setValue: (newVal) => {
      input.value = newVal;
      valDisplay.textContent = Number.isInteger(step) ? newVal : Number(newVal).toFixed(2);
    }
  };
}

export function createToggleWidget({ label, key, value, onChange }) {
  const row = document.createElement('div');
  row.className = 'ctrl-row ctrl-row-toggle';

  const labelEl = document.createElement('label');
  labelEl.className = 'ctrl-label';
  labelEl.textContent = label;

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.className = 'ctrl-toggle';
  toggle.checked = Boolean(value);

  toggle.addEventListener('change', (e) => {
    onChange(e.target.checked);
  });

  row.appendChild(labelEl);
  row.appendChild(toggle);

  return {
    element: row,
    setValue: (newVal) => {
      toggle.checked = Boolean(newVal);
    }
  };
}

export function createSelectWidget({ label, key, options, value, onChange }) {
  const row = document.createElement('div');
  row.className = 'ctrl-row';

  const labelEl = document.createElement('label');
  labelEl.className = 'ctrl-label';
  labelEl.textContent = label;

  const select = document.createElement('select');
  select.className = 'ctrl-select';

  options.forEach((opt) => {
    const optEl = document.createElement('option');
    optEl.value = opt.value;
    optEl.textContent = opt.label;
    if (opt.value === value) optEl.selected = true;
    select.appendChild(optEl);
  });

  select.addEventListener('change', (e) => {
    onChange(e.target.value);
  });

  row.appendChild(labelEl);
  row.appendChild(select);

  return {
    element: row,
    setValue: (newVal) => {
      select.value = newVal;
    }
  };
}

export function createButtonWidget({ label, onClick, className = '' }) {
  const row = document.createElement('div');
  row.className = 'ctrl-row ctrl-row-btn';

  const btn = document.createElement('button');
  btn.className = `ctrl-btn ${className}`;
  btn.textContent = label;

  btn.addEventListener('click', onClick);
  row.appendChild(btn);

  return { element: row };
}

export function createTextWidget({ label, key, value, onChange }) {
  const row = document.createElement('div');
  row.className = 'ctrl-row';

  const labelEl = document.createElement('label');
  labelEl.className = 'ctrl-label';
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'ctrl-text-input';
  input.value = value;

  input.addEventListener('change', (e) => {
    onChange(e.target.value);
  });

  row.appendChild(labelEl);
  row.appendChild(input);

  return {
    element: row,
    setValue: (newVal) => {
      input.value = newVal;
    }
  };
}
