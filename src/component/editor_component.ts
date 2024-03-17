import { CSSResult, LitElement, TemplateResult, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
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
    `;

    _offsetX: number = 0;
    _offsetY: number = 0;
    _zoom: number = 1.0;
    @query('g#transformer', true) _transformer!: SVGElement;
    @query('svg', true) _svg!: SVGElement;


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


    public onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) = (event: WheelEvent) => {
        // Prevent scrolling
        event.preventDefault();
        let tmpZoom = this._zoom + event.deltaY*0.001;
        // Limit the zoom level.
        if (tmpZoom <= 0.5) this._zoom = 0.5;
        else if (tmpZoom >= 1.5) this._zoom = 1.5;
        else this._zoom = tmpZoom;
        this.requestUpdate();
    };


    public onkeydown: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) = (event: KeyboardEvent) => {
        console.log('EditorComponent.onkeydown', event.key);
        event.stopPropagation();
    };


    public transformRelative(x: number, y: number) {
        this._offsetX += x/this._zoom;
        this._offsetY += y/this._zoom;
        this.requestUpdate();
    }


    public addNode(x: number, y: number) {
        // Get the cursor position relative to the start point of the svg element.
        let svgRect = this._svg.getBoundingClientRect()!;
        let cX: number = ((x - this._offsetX) - svgRect.left)/this._zoom;
        let cY: number = ((y - this._offsetY) - svgRect.top)/this._zoom;
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
    }

    
    public moveNodeRelative(nodeComponent: NodeComponent, dX: number, dY: number) {
        const foreignObject = nodeComponent.parentElement;
        const x = Number(foreignObject!.getAttribute('x'));
        const y = Number(foreignObject!.getAttribute('y'));
        foreignObject!.setAttribute('x', `${x + dX/this._zoom}`);
        foreignObject!.setAttribute('y', `${y + dY/this._zoom}`);
    }


    public deleteNode(nodeComponent: NodeComponent) {
        const foreignObject = nodeComponent.parentElement;
        this._transformer.removeChild(foreignObject!);
    }
};
