/**
 * Schema-driven Control Panel with two-way state binding and collapsible groups.
 */

import { PANEL_SCHEMA } from './panelSchema.js';
import {
  createSliderWidget,
  createToggleWidget,
  createSelectWidget,
  createTextWidget,
  createButtonWidget
} from './widgets.js';

export class ControlPanel {
  constructor(container, state, callbacks = {}) {
    this.container = container;
    this.state = state;
    this.callbacks = callbacks;
    this.widgetMap = new Map();
    this.visible = true;

    this.panelEl = document.createElement('div');
    this.panelEl.className = 'ctrl-panel';
    this.panelEl.id = 'control-panel';

    this.initHeader();
    this.buildFromSchema();
    this.initFooter();

    this.container.appendChild(this.panelEl);

    // Subscribe to state changes to update widgets if changed programmatically
    this.state.subscribe('*', (key, val) => {
      const widget = this.widgetMap.get(key);
      if (widget && widget.setValue) {
        widget.setValue(val);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyG' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        this.toggle();
      }
    });
  }

  initHeader() {
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `
      <div class="panel-title">
        <span class="panel-icon">⚙</span>
        <span>World Controls</span>
        <span class="gen-badge" id="gen-badge" style="display:none;">Generating...</span>
      </div>
      <button class="panel-close-btn" id="panel-close" title="Close Panel (G)">✕</button>
    `;
    this.panelEl.appendChild(header);

    header.querySelector('#panel-close').addEventListener('click', () => this.toggle());
    this.genBadge = header.querySelector('#gen-badge');
  }

  buildFromSchema() {
    const content = document.createElement('div');
    content.className = 'panel-content';

    PANEL_SCHEMA.forEach((cat) => {
      const group = document.createElement('div');
      group.className = 'ctrl-group';

      const groupHeader = document.createElement('div');
      groupHeader.className = 'group-header';
      groupHeader.innerHTML = `<span>${cat.category}</span><span class="group-arrow">▾</span>`;
      groupHeader.addEventListener('click', () => group.classList.toggle('collapsed'));

      const groupBody = document.createElement('div');
      groupBody.className = 'group-body';

      cat.controls.forEach((ctrl) => {
        const val = this.state.get(ctrl.key);
        let widget = null;

        const onChange = (newVal) => {
          this.state.set(ctrl.key, newVal);
        };

        if (ctrl.type === 'slider') {
          widget = createSliderWidget({ ...ctrl, value: val, onChange });
        } else if (ctrl.type === 'toggle') {
          widget = createToggleWidget({ ...ctrl, value: val, onChange });
        } else if (ctrl.type === 'select') {
          widget = createSelectWidget({ ...ctrl, value: val, onChange });
        } else if (ctrl.type === 'text') {
          widget = createTextWidget({ ...ctrl, value: val, onChange });
        }

        if (widget) {
          this.widgetMap.set(ctrl.key, widget);
          groupBody.appendChild(widget.element);
        }
      });

      group.appendChild(groupHeader);
      group.appendChild(groupBody);
      content.appendChild(group);
    });

    this.panelEl.appendChild(content);
  }

  initFooter() {
    const footer = document.createElement('div');
    footer.className = 'panel-footer';

    const randBtn = createButtonWidget({
      label: '🎲 Randomize Seed',
      className: 'btn-secondary',
      onClick: () => {
        if (this.callbacks.onRandomizeSeed) this.callbacks.onRandomizeSeed();
      }
    });

    const shotBtn = createButtonWidget({
      label: '📸 Take Screenshot (P)',
      className: 'btn-primary',
      onClick: () => {
        if (this.callbacks.onScreenshot) this.callbacks.onScreenshot();
      }
    });

    footer.appendChild(randBtn.element);
    footer.appendChild(shotBtn.element);
    this.panelEl.appendChild(footer);
  }

  setGenerating(isGenerating) {
    if (this.genBadge) {
      this.genBadge.style.display = isGenerating ? 'inline-block' : 'none';
    }
  }

  toggle() {
    this.visible = !this.visible;
    this.panelEl.classList.toggle('panel-hidden', !this.visible);
  }

  show() {
    this.visible = true;
    this.panelEl.classList.remove('panel-hidden');
  }

  hide() {
    this.visible = false;
    this.panelEl.classList.add('panel-hidden');
  }
}
