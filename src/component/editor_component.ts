import { CSSResultGroup, LitElement, TemplateResult, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { NodeComponent } from './node_component';
import { NodeOutputPortComponent } from './node_output_port_component';
import { NodeInputPortComponent } from './node_input_port_component';
import { NodeCoreComponent } from './node_core_component';


@customElement('editor-component')
export class EditorComponent extends LitElement {
    static override styles: CSSResultGroup = [
        css`
            :host,
            svg {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            };
        `,
        NodeComponent.styles,
        NodeOutputPortComponent.styles,
        NodeInputPortComponent.styles,
        NodeCoreComponent.styles,
    ];

    
    @query('g#transformer', true) _transformer!: SVGElement;
    @query('svg', true) _svg!: SVGElement;
    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _zoom: number = 1.0;
    private _ghostConnection: SVGLineElement | null = null;


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
    };


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


    public elementsFromPoint(x: number, y: number): Element[] {
        let elementArray = [];
        let shadowRootElementArray = this.shadowRoot!.elementsFromPoint(x, y)!;
        let nodeComponent = shadowRootElementArray.find((e) => e.tagName === 'NODE-COMPONENT');
        
        if (nodeComponent) elementArray.push(nodeComponent);
        
        let nodePartComponent = shadowRootElementArray.find((e) => e.tagName === 'NODE-INPUT-PORT-COMPONENT' || e.tagName === 'NODE-CORE-COMPONENT' || e.tagName === 'NODE-OUTPUT-PORT-COMPONENT');
        
        if (nodePartComponent) elementArray.push(nodePartComponent);

        return elementArray;
    };


    private _calculateXAbsolute(x: number): number {
        const svgRect = this._svg.getBoundingClientRect()!;
        return (x - svgRect.left - this._offsetX)/this._zoom;
    };


    private _calculateYAbsolute(y: number): number {
        const svgRect = this._svg.getBoundingClientRect()!;
        return (y - svgRect.top - this._offsetY)/this._zoom;
    };


    public resetView() {
        this._offsetX = 0;
        this._offsetY = 0;
        this._zoom = 1.0;
        this.requestUpdate();
    };


    public transformRelative(dX: number, dY: number) {
        this._offsetX += dX/this._zoom;
        this._offsetY += dY/this._zoom;
        this.requestUpdate();
    };


    public addNode(x: number, y: number) {
        let cX: number = this._calculateXAbsolute(x);
        let cY: number = this._calculateYAbsolute(y);
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
    };

    
    public moveNodeRelative(nodeComponent: NodeComponent, dX: number, dY: number) {
        const foreignObject = nodeComponent.parentElement;
        const x = Number(foreignObject!.getAttribute('x'));
        const y = Number(foreignObject!.getAttribute('y'));
        foreignObject!.setAttribute('x', `${x + dX/this._zoom}`);
        foreignObject!.setAttribute('y', `${y + dY/this._zoom}`);
    };


    public drawGhostConnection(nodeOutputPortComponent: NodeOutputPortComponent, x: number, y: number) {
        if (this._ghostConnection === null) {
            this._ghostConnection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            this._ghostConnection.style.stroke = 'black';
            this._ghostConnection.style.strokeWidth = '2';
            this._ghostConnection.setAttribute('x1', String(this._calculateXAbsolute(nodeOutputPortComponent.cX)));
            this._ghostConnection.setAttribute('y1', String(this._calculateYAbsolute(nodeOutputPortComponent.cY)));
            this._transformer.appendChild(this._ghostConnection);
        };

        this._ghostConnection.setAttribute('x2', String(this._calculateXAbsolute(x)));
        this._ghostConnection.setAttribute('y2', String(this._calculateYAbsolute(y)));
    };


    public createConnection(nodeOutputPortComponent: NodeOutputPortComponent, nodeInputPortComponent: NodeInputPortComponent) {
        // Don't connect if both ports are part of the same node.
        if (nodeOutputPortComponent.id.split('.')[0] === nodeInputPortComponent.id.split('.')[0]) return;

        // TODO: Don't connect if the input port is already connected.
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.style.stroke = 'blue';
        line.style.strokeWidth = '2';
        line.id = `${nodeOutputPortComponent.id}:${nodeInputPortComponent.id}`;
        line.setAttribute('x1', String(this._calculateXAbsolute(nodeOutputPortComponent.cX)));
        line.setAttribute('y1', String(this._calculateYAbsolute(nodeOutputPortComponent.cY)));
        line.setAttribute('x2', String(this._calculateXAbsolute(nodeInputPortComponent.cX)));
        line.setAttribute('y2', String(this._calculateYAbsolute(nodeInputPortComponent.cY)));
        this._transformer.appendChild(line);
    };


    public clearGhostConnection() {
        this._transformer.removeChild(this._ghostConnection!);
        this._ghostConnection = null;
    };


    public deleteNode(nodeComponent: NodeComponent) {
        const foreignObject = nodeComponent.parentElement;
        //// ShadowRoot again. :/ Let's dissable it.
        //const connectedLines = [].filter.call(this.getElementsByTagName(`line`), (e: SVGLineElement) => e.id.includes(nodeComponent.id));
        //console.log(connectedLines)
        //for (let i = 0; i < connectedLines.length; i++) {
        //    this._transformer.removeChild(connectedLines[i]);
        //};

        this._transformer.removeChild(foreignObject!);
    };
};
