import { CSSResult, LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { NodeComponent } from './node_component';


@customElement('editor-component')
export class EditorComponent extends LitElement {
    static override styles: CSSResult = css`
    :host,
    svg {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }

    svg {
        border: 1px dashed black;
    }


    :host:focus {
        outline: none;
        background-color: red;
        border-color: red;
        border-style: solid;
    }

    svg:focus {
        background-color: transparent;
        outline: none;
        border-color: blue;
        border-style: solid;
    }
    `;

    _isDragging: boolean = false;
    _mousePositionX: number = 0;
    _mousePositionY: number = 0;
    _offsetX: number = 0;
    _offsetY: number = 0;
    _previousEvent: MouseEvent | null = null;
    _zoom: number = 1.0;
    _focus: Element | null = null;
    @query('g#transformer') _transformer!: SVGElement;
    @query('svg') _svg!: SVGElement;


    // Note: tabindex is required to make the svg element focusable which allows it to react to key events. Somehow it can't be set in the property decorator but it works if the first child has it.
    override render(): TemplateResult {
        return html`
        <svg
        id="svg">
            <g
            id="transformer"
            transform="translate(${this._offsetX},${this._offsetY}) scale(${this._zoom})">
            </g>
        </svg>
        `;
    }

    oncontextmenu: ((this: GlobalEventHandlers, ev: MouseEvent) => any) = (event: MouseEvent) => {
        event.preventDefault();
    };
    onfocus: ((this: GlobalEventHandlers, ev: FocusEvent) => any) = (event: FocusEvent) => {
        console.log('EditorComponent.onfocus');
        this._focus = null;
        window.addEventListener('meshup-focus', this._windowOnmeshupfocus);
    };
    onblur: ((this: GlobalEventHandlers, ev: FocusEvent) => any) = (event: FocusEvent) => {
        console.log('EditorComponent.onblur');
        window.removeEventListener('meshup-focus', this._windowOnmeshupfocus);
    };
    onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) = (event: MouseEvent) => {
        console.log('EditorComponent.onmousedown');
        switch (event.button) {
            // Left mouse button.
            case 0:
                this._previousEvent = event;
                this._isDragging = true;
                this.requestUpdate();
                break;
            // Middle mouse button.
            case 1:
                this._offsetX = 0;
                this._offsetY = 0;
                this._zoom = 1.0;
                this.requestUpdate();
                break;
        }
    }
    onmousemove: ((this: GlobalEventHandlers, ev: MouseEvent) => any) = (event: MouseEvent) => {
        console.log('EditorComponent.onmousemove');
        this._mousePositionX = event.clientX;
        this._mousePositionY = event.clientY;

        if (!this._isDragging) return;

        if (this._focus === null) {
            this._offsetX += event.clientX - this._previousEvent!.clientX;
            this._offsetY += event.clientY - this._previousEvent!.clientY;
            this.requestUpdate();
        } else {
            const foreignObject = this._focus.parentElement;
            const x = Number(foreignObject!.getAttribute('x'));
            const y = Number(foreignObject!.getAttribute('y'));
            foreignObject!.setAttribute('x', `${x + (event.clientX - this._previousEvent!.clientX)/this._zoom}`);
            foreignObject!.setAttribute('y', `${y + (event.clientY - this._previousEvent!.clientY)/this._zoom}`);
        }

        this._previousEvent = event;
    }
    onmouseup: ((this: GlobalEventHandlers, ev: MouseEvent) => any) = (event: MouseEvent) => {
        console.log('EditorComponent.onmouseup');
        this._isDragging = false;
        this._previousEvent = null;
        this.requestUpdate();
    }
    onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) = (event: WheelEvent) => {
        // Prevent scrolling
        event.preventDefault();
        let tmpZoom = this._zoom + event.deltaY*0.001;
        // Limit the zoom level.
        if (tmpZoom <= 0.5) this._zoom = 0.5;
        else if (tmpZoom >= 1.5) this._zoom = 1.5;
        else this._zoom = tmpZoom;
        this.requestUpdate();
    }
    onkeydown: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) = (event: KeyboardEvent) => {
        if (this._focus === null) {
            switch (event.key) {
                case 'ArrowUp':
                    this._offsetY += 25;
                    this.requestUpdate();
                break;
                case 'ArrowDown':
                    this._offsetY -= 25;
                    this.requestUpdate();
                break;
                case 'ArrowLeft':
                    this._offsetX += 25;
                    this.requestUpdate();
                break;
                case 'ArrowRight':
                    this._offsetX -= 25;
                    this.requestUpdate();
                break;
                case 'Home':
                    this._offsetX = 0;
                    this._offsetY = 0;
                    this._zoom = 1.0;
                    this.requestUpdate();
                    break;
                case 'a':
                    if (!event.ctrlKey) return; 
    
                    // Get the cursor position relative to the start point of the svg element.
                    let svgRect = this._svg.getBoundingClientRect()!;
                    let cX: number = ((this._mousePositionX - this._offsetX) - svgRect.left)/this._zoom;
                    let cY: number = ((this._mousePositionY - this._offsetY) - svgRect.top)/this._zoom;
                    // Create a new node component and append it to the transformer.
                    const nodeComponent = new NodeComponent();
                    let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                    foreignObject.style.boxSizing = 'border-box';
                    foreignObject.setAttribute('x', String(cX-55));
                    foreignObject.setAttribute('y', String(cY-55));
                    foreignObject.setAttribute('width', nodeComponent.width);
                    foreignObject.setAttribute('height', nodeComponent.height);
                    foreignObject.appendChild(nodeComponent);
                    this._transformer.appendChild(foreignObject);
                break;
            };

            return;
        }

        switch (this._focus.tagName.toLowerCase()) {
            case 'node-component':
                return this._onkeydownNodeComponentHandler(event);
        };
    }
    
    _windowOnmeshupfocus: ((this: Window, ev: any) => any) = (event: CustomEvent) => {
        console.log('EditorComponent._windowOnmeshupfocus');
        this._focus = event.detail;
    }
    _onkeydownNodeComponentHandler: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp': {
                const foreignObject = this._focus!.parentElement;
                const y = Number(foreignObject!.getAttribute('y'));
                foreignObject!.setAttribute('y', `${y - 25}`);
            } break;
            case 'ArrowDown': {
                const foreignObject = this._focus!.parentElement;
                const y = Number(foreignObject!.getAttribute('y'));
                foreignObject!.setAttribute('y', `${y + 25}`);
            } break;
            case 'ArrowLeft': {
                const foreignObject = this._focus!.parentElement;
                const x = Number(foreignObject!.getAttribute('x'));
                foreignObject!.setAttribute('x', `${x - 25}`);}
            break;
            case 'ArrowRight': {
                const foreignObject = this._focus!.parentElement;
                const x = Number(foreignObject!.getAttribute('x'));
                foreignObject!.setAttribute('x', `${x + 25}`);
            } break;
            case 'd':
                if (!event.ctrlKey) return;

                const foreignObject = this._focus!.parentElement;
                this._transformer.removeChild(foreignObject!);
                this.focus();
            break;
        };
    }
}
