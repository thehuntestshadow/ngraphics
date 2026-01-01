/**
 * HEFAISTOS - Reusable Web Components
 * Native custom elements for common UI patterns
 */

// ============================================
// UPLOAD AREA COMPONENT
// ============================================
class UploadArea extends HTMLElement {
    static get observedAttributes() {
        return ['label', 'hint', 'accept', 'disabled'];
    }

    constructor() {
        super();
        this._file = null;
        this._previewUrl = null;
    }

    connectedCallback() {
        this.render();
        this.setupHandlers();
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.render();
            this.setupHandlers();
        }
    }

    get label() { return this.getAttribute('label') || 'Upload Image'; }
    get hint() { return this.getAttribute('hint') || 'or drag and drop'; }
    get accept() { return this.getAttribute('accept') || 'image/*'; }
    get disabled() { return this.hasAttribute('disabled'); }
    get file() { return this._file; }

    render() {
        const hasPreview = !!this._previewUrl;

        this.innerHTML = `
            <div class="upload-area ${hasPreview ? 'has-preview' : ''} ${this.disabled ? 'disabled' : ''}">
                <input type="file" class="upload-input" accept="${this.accept}" hidden ${this.disabled ? 'disabled' : ''}>
                <div class="upload-content ${hasPreview ? 'hidden' : ''}">
                    <div class="upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17,8 12,3 7,8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                    </div>
                    <div class="upload-label">${this.label}</div>
                    <div class="upload-hint">${this.hint}</div>
                </div>
                <div class="upload-preview ${hasPreview ? '' : 'hidden'}">
                    <img src="${this._previewUrl || ''}" alt="Preview" class="upload-preview-img">
                    <button type="button" class="upload-remove" title="Remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    setupHandlers() {
        const area = this.querySelector('.upload-area');
        const input = this.querySelector('.upload-input');
        const removeBtn = this.querySelector('.upload-remove');

        if (!area || !input) return;

        // Click to upload
        area.addEventListener('click', (e) => {
            if (e.target.closest('.upload-remove')) return;
            if (!this.disabled) input.click();
        });

        // Drag and drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!this.disabled) area.classList.add('dragover');
        });

        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            if (this.disabled) return;

            const file = e.dataTransfer.files[0];
            if (file && this.validateFile(file)) {
                this.handleFile(file);
            }
        });

        // File input change
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file && this.validateFile(file)) {
                this.handleFile(file);
            }
        });

        // Remove button
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clear();
            });
        }
    }

    validateFile(file) {
        const accept = this.accept;
        if (accept === '*' || accept === '*/*') return true;

        const acceptTypes = accept.split(',').map(t => t.trim());
        const fileType = file.type;
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();

        return acceptTypes.some(type => {
            if (type.startsWith('.')) return fileExt === type.toLowerCase();
            if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', '/'));
            return fileType === type;
        });
    }

    handleFile(file) {
        this._file = file;

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this._previewUrl = e.target.result;
                this.render();
                this.setupHandlers();
                this.dispatchEvent(new CustomEvent('file-selected', {
                    detail: { file, dataUrl: e.target.result },
                    bubbles: true
                }));
            };
            reader.readAsDataURL(file);
        } else {
            this.dispatchEvent(new CustomEvent('file-selected', {
                detail: { file, dataUrl: null },
                bubbles: true
            }));
        }
    }

    clear() {
        this._file = null;
        this._previewUrl = null;
        const input = this.querySelector('.upload-input');
        if (input) input.value = '';
        this.render();
        this.setupHandlers();
        this.dispatchEvent(new CustomEvent('file-cleared', { bubbles: true }));
    }

    setPreview(url) {
        this._previewUrl = url;
        this.render();
        this.setupHandlers();
    }
}

customElements.define('upload-area', UploadArea);


// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================
class CollapsibleSection extends HTMLElement {
    static get observedAttributes() {
        return ['open', 'title'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupHandlers();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open' && this.isConnected) {
            this.updateOpenState();
        }
    }

    get isOpen() { return this.hasAttribute('open'); }
    get title() { return this.getAttribute('title') || 'Section'; }

    render() {
        const content = this.innerHTML;
        this.innerHTML = `
            <div class="collapsible-section ${this.isOpen ? 'open' : ''}">
                <button type="button" class="collapsible-toggle">
                    <span class="collapsible-title">${this.title}</span>
                    <svg class="collapsible-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"/>
                    </svg>
                </button>
                <div class="collapsible-content">
                    <div class="collapsible-inner">${content}</div>
                </div>
            </div>
        `;
    }

    setupHandlers() {
        const toggle = this.querySelector('.collapsible-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggle());
        }
    }

    updateOpenState() {
        const section = this.querySelector('.collapsible-section');
        if (section) {
            section.classList.toggle('open', this.isOpen);
        }
    }

    toggle() {
        if (this.isOpen) {
            this.removeAttribute('open');
        } else {
            this.setAttribute('open', '');
        }
        this.dispatchEvent(new CustomEvent('toggle', {
            detail: { open: this.isOpen },
            bubbles: true
        }));
    }

    open() {
        this.setAttribute('open', '');
    }

    close() {
        this.removeAttribute('open');
    }
}

customElements.define('collapsible-section', CollapsibleSection);


// ============================================
// MODAL DIALOG COMPONENT
// ============================================
class ModalDialog extends HTMLElement {
    static get observedAttributes() {
        return ['open', 'title'];
    }

    constructor() {
        super();
        this._contentSlot = null;
        this._actionsSlot = null;
    }

    connectedCallback() {
        // Store original content before rendering
        this._originalContent = this.innerHTML;
        this.render();
        this.setupHandlers();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open' && this.isConnected) {
            this.updateOpenState();
        }
    }

    get isOpen() { return this.hasAttribute('open'); }
    get title() { return this.getAttribute('title') || ''; }
    set title(val) { this.setAttribute('title', val); this.updateTitle(); }

    render() {
        this.innerHTML = `
            <div class="modal ${this.isOpen ? 'visible' : ''}">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${this.title}</h3>
                        <button type="button" class="modal-close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">${this._originalContent || ''}</div>
                    <div class="modal-actions">
                        <slot name="actions"></slot>
                    </div>
                </div>
            </div>
        `;
    }

    setupHandlers() {
        const backdrop = this.querySelector('.modal-backdrop');
        const closeBtn = this.querySelector('.modal-close');

        if (backdrop) {
            backdrop.addEventListener('click', () => this.close());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // ESC key to close
        this._escHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this._escHandler);
    }

    disconnectedCallback() {
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
        }
    }

    updateOpenState() {
        const modal = this.querySelector('.modal');
        if (modal) {
            modal.classList.toggle('visible', this.isOpen);
        }
    }

    updateTitle() {
        const titleEl = this.querySelector('.modal-title');
        if (titleEl) titleEl.textContent = this.title;
    }

    open() {
        this.setAttribute('open', '');
        this.dispatchEvent(new CustomEvent('modal-open', { bubbles: true }));
    }

    close() {
        this.removeAttribute('open');
        this.dispatchEvent(new CustomEvent('modal-close', { bubbles: true }));
    }

    setBody(content) {
        const body = this.querySelector('.modal-body');
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
    }

    setActions(actions) {
        const actionsEl = this.querySelector('.modal-actions');
        if (actionsEl) {
            actionsEl.innerHTML = '';
            if (Array.isArray(actions)) {
                actions.forEach(action => actionsEl.appendChild(action));
            } else if (typeof actions === 'string') {
                actionsEl.innerHTML = actions;
            } else {
                actionsEl.appendChild(actions);
            }
        }
    }
}

customElements.define('modal-dialog', ModalDialog);


// ============================================
// OPTION BUTTON GROUP COMPONENT
// ============================================
class OptionGroup extends HTMLElement {
    static get observedAttributes() {
        return ['value', 'name'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.setupHandlers();
        this.updateActiveState();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && this.isConnected) {
            this.updateActiveState();
        }
    }

    get value() { return this.getAttribute('value') || ''; }
    set value(val) {
        this.setAttribute('value', val);
        this.updateActiveState();
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: val },
            bubbles: true
        }));
    }

    get name() { return this.getAttribute('name') || ''; }

    setupHandlers() {
        this.querySelectorAll('[data-value]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.value = btn.dataset.value;
            });
        });
    }

    updateActiveState() {
        this.querySelectorAll('[data-value]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.value);
        });
    }
}

customElements.define('option-group', OptionGroup);


// ============================================
// SLIDER INPUT COMPONENT
// ============================================
class SliderInput extends HTMLElement {
    static get observedAttributes() {
        return ['min', 'max', 'value', 'step', 'label', 'show-value'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupHandlers();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.isConnected && name === 'value') {
            this.updateValue();
        }
    }

    get min() { return parseFloat(this.getAttribute('min')) || 0; }
    get max() { return parseFloat(this.getAttribute('max')) || 100; }
    get step() { return parseFloat(this.getAttribute('step')) || 1; }
    get value() { return parseFloat(this.getAttribute('value')) || this.min; }
    get label() { return this.getAttribute('label') || ''; }
    get showValue() { return this.hasAttribute('show-value'); }

    set value(val) {
        this.setAttribute('value', val);
        this.updateValue();
    }

    render() {
        this.innerHTML = `
            <div class="slider-input">
                ${this.label ? `<label class="slider-label">${this.label}</label>` : ''}
                <div class="slider-control">
                    <input type="range"
                        class="slider-range"
                        min="${this.min}"
                        max="${this.max}"
                        step="${this.step}"
                        value="${this.value}">
                    ${this.showValue ? `<span class="slider-value">${this.value}</span>` : ''}
                </div>
            </div>
        `;
    }

    setupHandlers() {
        const range = this.querySelector('.slider-range');
        if (range) {
            range.addEventListener('input', (e) => {
                this.setAttribute('value', e.target.value);
                this.updateValueDisplay();
                this.dispatchEvent(new CustomEvent('change', {
                    detail: { value: parseFloat(e.target.value) },
                    bubbles: true
                }));
            });
        }
    }

    updateValue() {
        const range = this.querySelector('.slider-range');
        if (range) range.value = this.value;
        this.updateValueDisplay();
    }

    updateValueDisplay() {
        const display = this.querySelector('.slider-value');
        if (display) display.textContent = this.value;
    }
}

customElements.define('slider-input', SliderInput);


// ============================================
// TAG INPUT COMPONENT
// ============================================
class TagInput extends HTMLElement {
    static get observedAttributes() {
        return ['placeholder', 'max-tags'];
    }

    constructor() {
        super();
        this._tags = [];
    }

    connectedCallback() {
        this.render();
        this.setupHandlers();
    }

    get placeholder() { return this.getAttribute('placeholder') || 'Add tag...'; }
    get maxTags() { return parseInt(this.getAttribute('max-tags')) || 10; }
    get tags() { return [...this._tags]; }

    set tags(val) {
        this._tags = Array.isArray(val) ? val : [];
        this.renderTags();
    }

    render() {
        this.innerHTML = `
            <div class="tag-input-wrapper">
                <div class="tag-list"></div>
                <div class="tag-input-container">
                    <input type="text" class="tag-input" placeholder="${this.placeholder}">
                    <button type="button" class="tag-add-btn" title="Add tag">+</button>
                </div>
            </div>
        `;
        this.renderTags();
    }

    renderTags() {
        const list = this.querySelector('.tag-list');
        if (!list) return;

        list.innerHTML = this._tags.map(tag => `
            <span class="tag-chip">
                ${tag}
                <button type="button" class="tag-chip-remove" data-tag="${tag}">&times;</button>
            </span>
        `).join('');

        // Setup remove handlers
        list.querySelectorAll('.tag-chip-remove').forEach(btn => {
            btn.addEventListener('click', () => this.removeTag(btn.dataset.tag));
        });
    }

    setupHandlers() {
        const input = this.querySelector('.tag-input');
        const addBtn = this.querySelector('.tag-add-btn');

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag(input.value);
                    input.value = '';
                }
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (input) {
                    this.addTag(input.value);
                    input.value = '';
                }
            });
        }
    }

    addTag(tag) {
        const normalized = tag.trim().toLowerCase();
        if (!normalized) return false;
        if (this._tags.includes(normalized)) return false;
        if (this._tags.length >= this.maxTags) return false;

        this._tags.push(normalized);
        this.renderTags();
        this.dispatchEvent(new CustomEvent('tag-added', {
            detail: { tag: normalized, tags: this.tags },
            bubbles: true
        }));
        return true;
    }

    removeTag(tag) {
        const index = this._tags.indexOf(tag);
        if (index === -1) return false;

        this._tags.splice(index, 1);
        this.renderTags();
        this.dispatchEvent(new CustomEvent('tag-removed', {
            detail: { tag, tags: this.tags },
            bubbles: true
        }));
        return true;
    }

    clear() {
        this._tags = [];
        this.renderTags();
        this.dispatchEvent(new CustomEvent('tags-cleared', { bubbles: true }));
    }
}

customElements.define('tag-input', TagInput);


// ============================================
// LOADING SPINNER COMPONENT
// ============================================
class LoadingSpinner extends HTMLElement {
    static get observedAttributes() {
        return ['size', 'text'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    get size() { return this.getAttribute('size') || 'md'; }
    get text() { return this.getAttribute('text') || ''; }

    render() {
        const sizes = { sm: 24, md: 40, lg: 64 };
        const sizeVal = sizes[this.size] || sizes.md;

        this.innerHTML = `
            <div class="loading-spinner" style="--spinner-size: ${sizeVal}px">
                <div class="spinner-ring"></div>
                ${this.text ? `<div class="spinner-text">${this.text}</div>` : ''}
            </div>
        `;
    }

    setText(text) {
        this.setAttribute('text', text);
    }
}

customElements.define('loading-spinner', LoadingSpinner);


// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================
class ToastNotification extends HTMLElement {
    constructor() {
        super();
        this._timeout = null;
    }

    connectedCallback() {
        this.render();
    }

    get type() { return this.getAttribute('type') || 'info'; }
    get message() { return this.getAttribute('message') || ''; }
    get duration() { return parseInt(this.getAttribute('duration')) || 3000; }

    render() {
        const icons = {
            success: '<path d="M20 6L9 17l-5-5"/>',
            error: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
            warning: '<path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>',
            info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
        };

        this.innerHTML = `
            <div class="toast toast-${this.type}">
                <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[this.type] || icons.info}
                </svg>
                <span class="toast-message">${this.message}</span>
                <button type="button" class="toast-close">&times;</button>
            </div>
        `;

        this.querySelector('.toast-close')?.addEventListener('click', () => this.dismiss());

        // Auto-dismiss
        if (this.duration > 0) {
            this._timeout = setTimeout(() => this.dismiss(), this.duration);
        }
    }

    dismiss() {
        if (this._timeout) clearTimeout(this._timeout);
        this.classList.add('dismissing');
        setTimeout(() => this.remove(), 300);
    }
}

customElements.define('toast-notification', ToastNotification);


// ============================================
// IMAGE GRID COMPONENT (for history/favorites)
// ============================================
class ImageGrid extends HTMLElement {
    static get observedAttributes() {
        return ['selectable'];
    }

    constructor() {
        super();
        this._items = [];
        this._selectedIds = new Set();
    }

    connectedCallback() {
        this.render();
    }

    get selectable() { return this.hasAttribute('selectable'); }
    get items() { return this._items; }
    get selectedIds() { return [...this._selectedIds]; }

    set items(val) {
        this._items = Array.isArray(val) ? val : [];
        this.render();
    }

    render() {
        if (this._items.length === 0) {
            this.innerHTML = '<div class="image-grid-empty"><slot name="empty">No items</slot></div>';
            return;
        }

        this.innerHTML = `
            <div class="image-grid ${this.selectable ? 'selectable' : ''}">
                ${this._items.map(item => `
                    <div class="image-grid-item ${this._selectedIds.has(item.id) ? 'selected' : ''}" data-id="${item.id}">
                        <img src="${item.thumbnail || item.imageUrl}" alt="${item.title || ''}" loading="lazy">
                        <div class="image-grid-overlay">
                            <div class="image-grid-title">${item.title || ''}</div>
                            <div class="image-grid-meta">${item.meta || ''}</div>
                        </div>
                        ${!this.selectable ? `<button type="button" class="image-grid-delete" data-id="${item.id}">&times;</button>` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        this.setupHandlers();
    }

    setupHandlers() {
        this.querySelectorAll('.image-grid-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.image-grid-delete')) return;

                const id = item.dataset.id;
                if (this.selectable) {
                    this.toggleSelection(id);
                } else {
                    this.dispatchEvent(new CustomEvent('item-click', {
                        detail: { id, item: this._items.find(i => i.id == id) },
                        bubbles: true
                    }));
                }
            });
        });

        this.querySelectorAll('.image-grid-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('item-delete', {
                    detail: { id: btn.dataset.id },
                    bubbles: true
                }));
            });
        });
    }

    toggleSelection(id) {
        if (this._selectedIds.has(id)) {
            this._selectedIds.delete(id);
        } else {
            this._selectedIds.add(id);
        }

        const item = this.querySelector(`[data-id="${id}"]`);
        if (item) item.classList.toggle('selected', this._selectedIds.has(id));

        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: { selectedIds: this.selectedIds },
            bubbles: true
        }));
    }

    selectAll() {
        this._items.forEach(item => this._selectedIds.add(item.id));
        this.render();
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: { selectedIds: this.selectedIds },
            bubbles: true
        }));
    }

    clearSelection() {
        this._selectedIds.clear();
        this.render();
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: { selectedIds: [] },
            bubbles: true
        }));
    }
}

customElements.define('image-grid', ImageGrid);


// ============================================
// COMPONENT STYLES (injected once)
// ============================================
(function injectComponentStyles() {
    if (document.getElementById('component-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'component-styles';
    styles.textContent = `
        /* Upload Area Component */
        upload-area {
            display: block;
        }

        upload-area .upload-area {
            position: relative;
            border: 2px dashed var(--border-default, #444);
            border-radius: var(--radius-lg, 16px);
            padding: 32px 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            background: var(--bg-surface, #1a1a1a);
        }

        upload-area .upload-area:hover:not(.disabled),
        upload-area .upload-area.dragover {
            border-color: var(--accent, #6366f1);
            background: var(--accent-subtle, rgba(99,102,241,0.1));
        }

        upload-area .upload-area.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        upload-area .upload-area.has-preview {
            padding: 0;
            border-style: solid;
        }

        upload-area .upload-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 12px;
            color: var(--text-muted, #666);
        }

        upload-area .upload-icon svg {
            width: 100%;
            height: 100%;
        }

        upload-area .upload-label {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary, #fff);
            margin-bottom: 4px;
        }

        upload-area .upload-hint {
            font-size: 0.8rem;
            color: var(--text-muted, #666);
        }

        upload-area .upload-content.hidden,
        upload-area .upload-preview.hidden {
            display: none;
        }

        upload-area .upload-preview {
            position: relative;
        }

        upload-area .upload-preview-img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: var(--radius-lg, 16px);
        }

        upload-area .upload-remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.7);
            border: none;
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            transition: all 0.2s;
        }

        upload-area .upload-remove:hover {
            background: var(--error, #ef4444);
        }

        upload-area .upload-remove svg {
            width: 14px;
            height: 14px;
        }

        /* Collapsible Section */
        collapsible-section {
            display: block;
        }

        collapsible-section .collapsible-section {
            border: 1px solid var(--border-subtle, #333);
            border-radius: var(--radius-md, 12px);
            overflow: hidden;
        }

        collapsible-section .collapsible-toggle {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            background: var(--bg-elevated, #222);
            border: none;
            color: var(--text-primary, #fff);
            cursor: pointer;
            transition: background 0.2s;
        }

        collapsible-section .collapsible-toggle:hover {
            background: var(--bg-surface, #2a2a2a);
        }

        collapsible-section .collapsible-title {
            font-size: 0.9rem;
            font-weight: 600;
        }

        collapsible-section .collapsible-chevron {
            width: 18px;
            height: 18px;
            transition: transform 0.2s;
        }

        collapsible-section .collapsible-section.open .collapsible-chevron {
            transform: rotate(180deg);
        }

        collapsible-section .collapsible-content {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.25s ease;
        }

        collapsible-section .collapsible-section.open .collapsible-content {
            grid-template-rows: 1fr;
        }

        collapsible-section .collapsible-inner {
            overflow: hidden;
            padding: 0 18px;
        }

        collapsible-section .collapsible-section.open .collapsible-inner {
            padding: 18px;
        }

        /* Slider Input */
        slider-input {
            display: block;
        }

        slider-input .slider-input {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        slider-input .slider-label {
            font-size: 0.8rem;
            font-weight: 500;
            color: var(--text-secondary, #999);
        }

        slider-input .slider-control {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        slider-input .slider-range {
            flex: 1;
            height: 6px;
            -webkit-appearance: none;
            background: var(--bg-elevated, #333);
            border-radius: 3px;
            outline: none;
        }

        slider-input .slider-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: var(--accent, #6366f1);
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.15s;
        }

        slider-input .slider-range::-webkit-slider-thumb:hover {
            transform: scale(1.15);
        }

        slider-input .slider-value {
            min-width: 32px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--accent, #6366f1);
            text-align: right;
        }

        /* Loading Spinner */
        loading-spinner {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        loading-spinner .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        loading-spinner .spinner-ring {
            width: var(--spinner-size, 40px);
            height: var(--spinner-size, 40px);
            border: 3px solid var(--bg-elevated, #333);
            border-top-color: var(--accent, #6366f1);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        loading-spinner .spinner-text {
            font-size: 0.85rem;
            color: var(--text-secondary, #999);
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Toast Notification */
        toast-notification {
            display: block;
        }

        toast-notification .toast {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--bg-elevated, #222);
            border: 1px solid var(--border-default, #444);
            border-radius: var(--radius-md, 12px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        }

        toast-notification.dismissing .toast {
            animation: slideOut 0.3s ease forwards;
        }

        toast-notification .toast-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        toast-notification .toast-success .toast-icon { color: var(--success, #22c55e); }
        toast-notification .toast-error .toast-icon { color: var(--error, #ef4444); }
        toast-notification .toast-warning .toast-icon { color: var(--warning, #f59e0b); }
        toast-notification .toast-info .toast-icon { color: var(--accent, #6366f1); }

        toast-notification .toast-message {
            flex: 1;
            font-size: 0.9rem;
            color: var(--text-primary, #fff);
        }

        toast-notification .toast-close {
            background: none;
            border: none;
            color: var(--text-muted, #666);
            cursor: pointer;
            font-size: 1.2rem;
            line-height: 1;
            padding: 4px;
        }

        toast-notification .toast-close:hover {
            color: var(--text-primary, #fff);
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }

        /* Image Grid */
        image-grid {
            display: block;
        }

        image-grid .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
        }

        image-grid .image-grid-item {
            position: relative;
            aspect-ratio: 1;
            border-radius: var(--radius-md, 12px);
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
        }

        image-grid .image-grid-item:hover {
            border-color: var(--accent, #6366f1);
        }

        image-grid .image-grid-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        image-grid .image-grid-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            opacity: 0;
            transition: opacity 0.2s;
        }

        image-grid .image-grid-item:hover .image-grid-overlay {
            opacity: 1;
        }

        image-grid .image-grid-title {
            font-size: 0.75rem;
            font-weight: 500;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        image-grid .image-grid-meta {
            font-size: 0.65rem;
            color: rgba(255,255,255,0.7);
        }

        image-grid .image-grid-delete {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.6);
            border: none;
            border-radius: 50%;
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s;
        }

        image-grid .image-grid-item:hover .image-grid-delete {
            opacity: 1;
        }

        image-grid .image-grid-delete:hover {
            background: var(--error, #ef4444);
        }

        /* Selectable mode */
        image-grid .image-grid.selectable .image-grid-item::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 8px;
            width: 20px;
            height: 20px;
            background: rgba(0,0,0,0.5);
            border: 2px solid rgba(255,255,255,0.5);
            border-radius: 4px;
            z-index: 5;
        }

        image-grid .image-grid.selectable .image-grid-item.selected::before {
            background: var(--accent, #6366f1);
            border-color: var(--accent, #6366f1);
        }

        image-grid .image-grid.selectable .image-grid-item.selected::after {
            content: '✓';
            position: absolute;
            top: 9px;
            left: 12px;
            font-size: 12px;
            font-weight: 700;
            color: #fff;
            z-index: 6;
        }

        image-grid .image-grid.selectable .image-grid-item.selected {
            border-color: var(--accent, #6366f1);
        }

        image-grid .image-grid-empty {
            padding: 32px;
            text-align: center;
            color: var(--text-muted, #666);
        }
    `;

    document.head.appendChild(styles);
})();


// ============================================
// EXPORT FOR USE
// ============================================
window.NGComponents = {
    UploadArea,
    CollapsibleSection,
    ModalDialog,
    OptionGroup,
    SliderInput,
    TagInput,
    LoadingSpinner,
    ToastNotification,
    ImageGrid
};
