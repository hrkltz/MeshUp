import { CSSResultGroup, LitElement, TemplateResult, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { ScriptNode } from '../node/script_node';
import { NodeOutputPortComponent } from './node_output_port_component';
import { NodeInputPortComponent } from './node_input_port_component';
import { NodeCoreComponent } from './node_core_component';
import { IndexedDBUtil } from '../util/indexeddb_util';
import { NodeObject } from '../object/node_object';
import { ProjectObject } from '../object/project_object';
import { AddNodeDialog } from '../dialog/add_node_dialog';
import { StartSourceNode } from '../node/start_source_node';


@customElement('editor-component')
export class EditorComponent extends LitElement {
    static override styles: CSSResultGroup = [
        css`
            :host,
            svg {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            }

            info-component {
                position: absolute;
                bottom: 0;
                right: 0;
                z-index: 10;
            }
        `,
        ScriptNode.styles,
        StartSourceNode.styles,
        NodeOutputPortComponent.styles,
        NodeInputPortComponent.styles,
        NodeCoreComponent.styles,
    ];

    
    @query('g#transformer', true) _transformer!: SVGElement;
    @query('svg', true) _svg!: SVGElement;
    @state() private _clickedElement: { element: Element | null, parentElement: Element | null } = { element: null, parentElement: null };
    @state() private _hoveredElement: { element: Element | null, parentElement: Element | null } = { element: null, parentElement: null };
    private _ghostConnection: SVGLineElement | null = null;
    private _mousePositionX: number = 0;
    private _mousePositionY: number = 0;
    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _previousMouseEvent: MouseEvent | null = null;
    private _zoom: number = 1.0;

    // Note: Don't add a new line or empty character between <g..> and </g> tags, as it will be rendered as a text.
    override render(): TemplateResult {
        return html`
            <svg
            id="svg">
                <g
                id="transformer"
                transform="translate(${this._offsetX},${this._offsetY}) scale(${this._zoom})"></g>
            </svg>
            <info-component selectedElementTagName=${this._hoveredElement.element ? this._hoveredElement.element.tagName : ''}></info-component>
        `;
    };

    
    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener('contextmenu', (event) => { event.preventDefault(); });
        // Note: We need to bind the keydown eventhandler to the window object, to avoid the need of focusing the editor component.
        window.addEventListener('keydown', this._windowOnKeyDown.bind(this));
    };


    public onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) = (event: WheelEvent) => {
        // Prevent scrolling
        event.preventDefault();
        let tmpZoom = this._zoom + event.deltaY*0.001;

        // Limit the zoom level.
        if (tmpZoom <= 0.5) {
            this._zoom = 0.5;
        } else if (tmpZoom >= 1.5) {
            this._zoom = 1.5;
        } else {
            this._zoom = tmpZoom;
        };

        this.requestUpdate();
    };


    public onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) = (event: MouseEvent) => {
        switch (event.button) {
            case 0:
                this._clickedElement = this._getElementTreeBelowCursor(event.clientX, event.clientY);
                this._previousMouseEvent = event;
                break;
        };
    };


    public onmousemove: ((this: GlobalEventHandlers, ev: MouseEvent) => any) = (event: MouseEvent) => {
        // Currently only needed to allow placing a new node at the cursor position.
        this._mousePositionX = event.clientX;
        this._mousePositionY = event.clientY;

        switch (event.buttons) {
            case 0:
                this._hoveredElement = this._getElementTreeBelowCursor(event.clientX, event.clientY);
                break;
            case 1:
                this._hoveredElement = this._getElementTreeBelowCursor(event.clientX, event.clientY);
                switch (this._clickedElement.element!.tagName) {
                    case 'EDITOR-COMPONENT':
                        this._transformRelative(event.clientX  - this._previousMouseEvent!.clientX, event.clientY - this._previousMouseEvent!.clientY);
                        break;
                    case 'NODE-CORE-COMPONENT':
                        this._moveNodeRelative(this._clickedElement.parentElement! as ScriptNode, event.clientX  - this._previousMouseEvent!.clientX, event.clientY - this._previousMouseEvent!.clientY);
                        break;
                    case 'NODE-OUTPUT-PORT-COMPONENT':
                        this._drawGhostConnection(this._clickedElement.element! as NodeOutputPortComponent, event.clientX, event.clientY);
                        break;
                };

                this._previousMouseEvent = event;
                break;
        };
    };


    public onmouseup: ((this: GlobalEventHandlers, ev: MouseEvent) => any) = (event: MouseEvent) => {
        switch (event.button) {
            case 0:
                switch (this._clickedElement.element!.tagName) {
                    case 'EDITOR-COMPONENT': break;
                    case 'NODE-CORE-COMPONENT': break;
                    case 'NODE-OUTPUT-PORT-COMPONENT':
                        this._clearGhostConnection();

                        if (this._hoveredElement.element!.tagName === 'NODE-INPUT-PORT-COMPONENT') {
                            this._createConnection(this._clickedElement.element! as NodeOutputPortComponent, this._hoveredElement.element! as NodeInputPortComponent);
                        };
                        break;
                };

                this._clickedElement = { element: null, parentElement: null };
                this._previousMouseEvent = null;
                break;
        };
    };


    private _windowOnKeyDown: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) = (event: KeyboardEvent) => {
        if (this._hoveredElement.element === null) return;

        switch (this._hoveredElement.element!.tagName) {
            case 'EDITOR-COMPONENT':
                switch (event.key) {
                    case 'ArrowUp':
                        this._transformRelative(0, 25);
                        break;
                    case 'ArrowDown':
                        this._transformRelative(0, -25);
                        break;
                    case 'ArrowLeft':
                        this._transformRelative(25, 0);
                        break;
                    case 'ArrowRight':
                        this._transformRelative(-25, 0);
                        break;
                    case 'Home':
                        this._resetView();
                        break;
                    case 'a':
                        this._addNode(this._mousePositionX, this._mousePositionY);
                        break;
                    case 's':
                        this._saveProject();
                        break;
                    case 'l':
                        this._loadProject();
                        break;
                };
                break;
            case 'NODE-CORE-COMPONENT':
                switch (event.key) {
                    case 'ArrowUp':
                        this._moveNodeRelative(this._hoveredElement.parentElement as ScriptNode, 0, -25);
                        break;
                    case 'ArrowDown':
                        this._moveNodeRelative(this._hoveredElement.parentElement as ScriptNode, 0, 25);
                        break;
                    case 'ArrowLeft':
                        this._moveNodeRelative(this._hoveredElement.parentElement as ScriptNode, -25, 0);
                        break;
                    case 'ArrowRight':
                        this._moveNodeRelative(this._hoveredElement.parentElement as ScriptNode, 25, 0);
                        break;
                    case 'd':
                        this._deleteNode(this._hoveredElement.parentElement as ScriptNode);
                        break;
                };
                break;
        };
    };


    private _calculateXAbsolute(x: number): number {
        const svgRect = this._svg.getBoundingClientRect()!;

        return (x - svgRect.left - this._offsetX)/this._zoom;
    };


    private _calculateYAbsolute(y: number): number {
        const svgRect = this._svg.getBoundingClientRect()!;
        
        return (y - svgRect.top - this._offsetY)/this._zoom;
    };


    private _resetView() {
        this._offsetX = 0;
        this._offsetY = 0;
        this._zoom = 1.0;
        this.requestUpdate();
    };


    private _transformRelative(dX: number, dY: number) {
        this._offsetX += dX/this._zoom;
        this._offsetY += dY/this._zoom;
        this.requestUpdate();
    };


    private async _addNode(x: number, y: number) {
        const result = await AddNodeDialog.open();

        console.log(result)
        switch (result) {
            case 'StartSourceNode': {
                let cX: number = this._calculateXAbsolute(x);
                let cY: number = this._calculateYAbsolute(y);
                // Create a new node component and append it to the transformer.
                const scriptNode = new StartSourceNode();
                let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                foreignObject.style.boxSizing = 'border-box';
                foreignObject.setAttribute('x', String(cX-55));
                foreignObject.setAttribute('y', String(cY-55));
                foreignObject.setAttribute('width', scriptNode.width);
                foreignObject.setAttribute('height', scriptNode.height);
                foreignObject.appendChild(scriptNode);
                this._transformer.appendChild(foreignObject);
            } break;
            case 'ScriptNode': {
                let cX: number = this._calculateXAbsolute(x);
                let cY: number = this._calculateYAbsolute(y);
                // Create a new node component and append it to the transformer.
                const scriptNode = new ScriptNode();
                let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                foreignObject.style.boxSizing = 'border-box';
                foreignObject.setAttribute('x', String(cX-55));
                foreignObject.setAttribute('y', String(cY-55));
                foreignObject.setAttribute('width', scriptNode.width);
                foreignObject.setAttribute('height', scriptNode.height);
                foreignObject.appendChild(scriptNode);
                this._transformer.appendChild(foreignObject);
            } break;
            case 'MergeNode':
                break;
        };
        return;
    };

    
    private _moveNodeRelative(scriptNode: ScriptNode, dX: number, dY: number) {
        // Move the node component.
        const foreignObject = scriptNode.parentElement;
        const x = Number(foreignObject!.getAttribute('x'));
        const y = Number(foreignObject!.getAttribute('y'));
        foreignObject!.setAttribute('x', `${x + dX/this._zoom}`);
        foreignObject!.setAttribute('y', `${y + dY/this._zoom}`);
        // Move all connected lines.
        // OPTIMIZE: Do this just once during the mousedown event.
        const connectedLineArray = [].filter.call(this.shadowRoot!.querySelectorAll('line'), (e: SVGLineElement) => e.id.includes(scriptNode.id)) as SVGLineElement[];
        
        for (let i = 0; i < connectedLineArray.length; i++) {
            const line = connectedLineArray[i];

            if (line.id.startsWith(scriptNode.id)) {
                const x1 = Number(line.getAttribute('x1'));
                const y1 = Number(line.getAttribute('y1'));
                line.setAttribute('x1', `${x1 + dX/this._zoom}`);
                line.setAttribute('y1', `${y1 + dY/this._zoom}`);
            } else {
                const x2 = Number(line.getAttribute('x2'));
                const y2 = Number(line.getAttribute('y2'));
                line.setAttribute('x2', `${x2 + dX/this._zoom}`);
                line.setAttribute('y2', `${y2 + dY/this._zoom}`);
            };
        };
    };


    private _drawGhostConnection(nodeOutputPortComponent: NodeOutputPortComponent, x: number, y: number) {
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


    private _createConnection(nodeOutputPortComponent: NodeOutputPortComponent, nodeInputPortComponent: NodeInputPortComponent) {
        // Don't connect if both ports are part of the same node.
        if (nodeOutputPortComponent.id.split('.')[0] === nodeInputPortComponent.id.split('.')[0]) {
            return;
        };

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


    private _clearGhostConnection() {
        this._transformer.removeChild(this._ghostConnection!);
        this._ghostConnection = null;
    };


    private _deleteNode(scriptNode: ScriptNode) {
        const foreignObject = scriptNode.parentElement;
        //// ShadowRoot again. :/ Let's dissable it.
        const connectedLineArray = [].filter.call(this.shadowRoot!.querySelectorAll('line'), (e: SVGLineElement) => e.id.includes(scriptNode.id));

        for (let i = 0; i < connectedLineArray.length; i++) {
            this._transformer.removeChild(connectedLineArray[i]);
        };

        this._transformer.removeChild(foreignObject!);
    };


    private _getElementTreeBelowCursor(x: number, y: number): { element: Element | null, parentElement: Element | null } {
        let myTree: Element[] = [];

        if (this.shadowRoot!.elementsFromPoint(x, y).includes(this)) {
            myTree.push(this);
            myTree.push(...this._elementsFromPoint(x, y));
        };

        return { element: myTree.pop()?? null, parentElement: myTree.pop()?? null };
    };


    private _elementsFromPoint(x: number, y: number): Element[] {
        let elementArray = [];
        let shadowRootElementArray = this.shadowRoot!.elementsFromPoint(x, y)!;
        let scriptNode = shadowRootElementArray.find((e) => e.tagName === 'SCRIPT-NODE' || e.tagName === 'START-SOURCE-NODE' || e.tagName === 'SCRIPT-NODE' || e.tagName === 'MERGE-NODE');
        
        if (scriptNode) {
            elementArray.push(scriptNode);
        
            let nodePartComponent = shadowRootElementArray.find((e) => e.tagName === 'NODE-INPUT-PORT-COMPONENT' || e.tagName === 'NODE-CORE-COMPONENT' || e.tagName === 'NODE-OUTPUT-PORT-COMPONENT');
            
            if (nodePartComponent) {
                elementArray.push(nodePartComponent);
            };
        };

        return elementArray;
    };


    private _saveProject(): void {
        // Serialize the graph.
        const childNodeArray = this._transformer.childNodes;
        const foreignObjectArray = [].filter.call(childNodeArray, (e: SVGForeignObjectElement) => e.tagName === 'foreignObject') as SVGForeignObjectElement[];
        const lineArray = [].filter.call(childNodeArray, (e: SVGLineElement) => e.tagName === 'line') as SVGLineElement[];
        const projectObject: ProjectObject = new ProjectObject();
        // Create an array of nodes.
        foreignObjectArray.forEach(foreignObject => {
            console.log((foreignObject.childNodes[0] as HTMLElement).tagName);
            switch ((foreignObject.childNodes[0] as HTMLElement).tagName.toLowerCase()) {
                case 'start-source-node': {
                    const scriptNode = foreignObject.childNodes[0] as StartSourceNode;
                    const nodeObject = new NodeObject(scriptNode.id, 'start-source-node', Number.parseInt(foreignObject.getAttribute('x')!), Number.parseInt(foreignObject.getAttribute('y')!));
                    nodeObject.outputPortArray.push([]);
                    projectObject.nodeArray.push(nodeObject);
                } break;
                case 'script-node': {
                    const scriptNode = foreignObject.childNodes[0] as ScriptNode;
                    const nodeObject = new NodeObject(scriptNode.id, 'script-node', Number.parseInt(foreignObject.getAttribute('x')!), Number.parseInt(foreignObject.getAttribute('y')!));
                    nodeObject.inputPortArray = [[], [], []];
                    nodeObject.outputPortArray = [[], [], []];
                    nodeObject.contentJson = '{"code": ""}';
                    projectObject.nodeArray.push(nodeObject);
                } break;
            };
        });
        // Store the connections.
        lineArray.forEach(line => {
            const splittedLineId = line.id.split(':');
            ([].find.call(projectObject.nodeArray, (e: NodeObject) => splittedLineId[0].startsWith(e.id))! as NodeObject)
                .outputPortArray[Number(splittedLineId[0].split('.')[1])].push(splittedLineId[1]);
            ([].find.call(projectObject.nodeArray, (e: NodeObject) => splittedLineId[1].startsWith(e.id))! as NodeObject)
                .inputPortArray[Number(splittedLineId[1].split('.')[1])].push(splittedLineId[0]);
        });

        // Save the serialized graph to IndexedDB.
        IndexedDBUtil.openDatabase('editor', 1, (db) => {
            db.createObjectStore('editor');
        }).then((db) => {
            IndexedDBUtil.openObjectStore(db, 'editor', 'readwrite').then((objectStore) => {
                IndexedDBUtil.putRecord(objectStore, 'test', projectObject).then(() => {
                    console.log('Record put');
                });
            });
        });
    };


    private _loadProject(): void {
        // Load the serialized graph from IndexedDB.
        IndexedDBUtil.openDatabase('editor', 1, (db) => {
            db.createObjectStore('editor');
        }).then((db) => {
            IndexedDBUtil.openObjectStore(db, 'editor', 'readwrite').then((objectStore) => {
                IndexedDBUtil.getRecord(objectStore, 'test').then((projectObject: ProjectObject) => {
                    // Deserialize the graph.
                    projectObject.nodeArray.forEach(nodeObject => {
                        // Create a new node component and append it to the transformer.
                        switch (nodeObject.type) {
                            case 'start-source-node': {
                                const scriptNode = new StartSourceNode();
                                scriptNode.id = nodeObject.id;
                                scriptNode.x = nodeObject.x;
                                scriptNode.y = nodeObject.y;
                                let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                                foreignObject.style.boxSizing = 'border-box';
                                foreignObject.setAttribute('x', String(nodeObject.x));
                                foreignObject.setAttribute('y', String(nodeObject.y));
                                foreignObject.setAttribute('width', scriptNode.width);
                                foreignObject.setAttribute('height', scriptNode.height);
                                foreignObject.appendChild(scriptNode);
                                this._transformer.appendChild(foreignObject);
                            } break;
                            case 'script-node': {
                                const scriptNode = new ScriptNode();
                                scriptNode.id = nodeObject.id;
                                scriptNode.x = nodeObject.x;
                                scriptNode.y = nodeObject.y;
                                let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                                foreignObject.style.boxSizing = 'border-box';
                                foreignObject.setAttribute('x', String(nodeObject.x));
                                foreignObject.setAttribute('y', String(nodeObject.y));
                                foreignObject.setAttribute('width', scriptNode.width);
                                foreignObject.setAttribute('height', scriptNode.height);
                                foreignObject.appendChild(scriptNode);
                                this._transformer.appendChild(foreignObject);
                            } break;
                        };

                        // Create the connections.
                        //nodeObject.outputPortArray.forEach((outputPortArray, outputPortIndex) => {
                        //    outputPortArray.forEach(outputPortId => {
                        //        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        //        line.style.stroke = 'blue';
                        //        line.style.strokeWidth = '2';
                        //        line.id = `${nodeObject.id}.${outputPortIndex}:${outputPortId}`;
                        //        line.setAttribute('x1', String((this._transformer.querySelector(`#${outputPortId}`) as NodeOutputPortComponent).cX));
                        //        line.setAttribute('y1', String((this._transformer.querySelector(`#${outputPortId}`) as NodeOutputPortComponent).cY));
                        //        line.setAttribute('x2', String((this._transformer.querySelector(`#${inputPortId}`) as NodeInputPortComponent).cX));
                        //        line.setAttribute('y2', String((this._transformer.querySelector(`#${inputPortId}`) as NodeInputPortComponent).cY));
                        //        this._transformer.appendChild(line);
                        //    });
                        //});
                    });
                });
            });
        });
    };
};
