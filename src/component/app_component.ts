import { CSSResult, LitElement, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { EditorComponent } from './editor_component';
import { NodeComponent } from './node_component';
import { NodeOutputPortComponent } from './node_output_port_component';


@customElement('app-component')
export class AppComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        }

        h1 {
            flex: 0 0 auto;
        }

        editor-component {
            flex: 1 1 auto;
        }

        info-component {
            position: absolute;
            bottom: 0;
            right: 0;
            z-index: 10;
        }
    `;


    @state()
    private _clickedElement: { element: Element | null, parentElement: Element | null } = { element: null, parentElement: null };
    @state()
    private _hoveredElement: { element: Element | null, parentElement: Element | null } = { element: null, parentElement: null };
    private _previousMouseEvent: MouseEvent | null = null;
    private _mousePositionX: number = 0;
    private _mousePositionY: number = 0;
    @query('editor-component', true) private _editorComponent!: EditorComponent;


    override render() {
        return html`
            <h1>MeshUp</h1>
            <editor-component></editor-component>
            <info-component selectedElementTagName=${this._hoveredElement.element ? this._hoveredElement.element.tagName : ''}></info-component>
        `;
    }


    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener('mousedown', this._onMouseDown.bind(this));
        window.addEventListener('mousemove', this._onMouseMove.bind(this));
        window.addEventListener('mouseup', this._onMouseUp.bind(this));
        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('contextmenu', (event) => { event.preventDefault(); });
    }

    // For the moment not needed as the AppComponent is the root one.
    //disconnectedCallback(): void {
    //    window.removeEventListener('mousedown', this._onMouseDown);
    //    window.removeEventListener('mousemove', this._onMouseMove);
    //    window.removeEventListener('keydown', this._onKeyDown);
    //    super.disconnectedCallback();
    //}


    _onKeyDown(event: KeyboardEvent): void {
        switch (this._hoveredElement.element!.tagName) {
            case 'EDITOR-COMPONENT':
                switch (event.key) {
                    case 'ArrowUp':
                        this._editorComponent!.transformRelative(0, 25);
                        break;
                    case 'ArrowDown':
                        this._editorComponent!.transformRelative(0, -25);
                        break;
                    case 'ArrowLeft':
                        this._editorComponent!.transformRelative(25, 0);
                        break;
                    case 'ArrowRight':
                        this._editorComponent!.transformRelative(-25, 0);
                        break;
                    case 'Home':
                        this._editorComponent!.resetView();
                        break;
                    case 'a':
                        this._editorComponent!.addNode(this._mousePositionX, this._mousePositionY);
                        break;
                };
                break;
            case 'NODE-CORE-COMPONENT':
                switch (event.key) {
                    case 'ArrowUp':
                        this._editorComponent!.moveNodeRelative(this._hoveredElement.parentElement as NodeComponent, 0, -25);
                        break;
                    case 'ArrowDown':
                        this._editorComponent!.moveNodeRelative(this._hoveredElement.parentElement as NodeComponent, 0, 25);
                        break;
                    case 'ArrowLeft':
                        this._editorComponent!.moveNodeRelative(this._hoveredElement.parentElement as NodeComponent, -25, 0);
                        break;
                    case 'ArrowRight':
                        this._editorComponent!.moveNodeRelative(this._hoveredElement.parentElement as NodeComponent, 25, 0);
                        break;
                    case 'd':
                        this._editorComponent!.deleteNode(this._hoveredElement.parentElement as NodeComponent);
                        break;
                };
                break;
        };
    }


    _onMouseDown(event: MouseEvent): void {
        switch (event.button) {
            case 0:
                this._clickedElement = this._findPointedElement();
                this._previousMouseEvent = event;
                break;
        }
    }


    _onMouseMove(event: MouseEvent): void {
        this._mousePositionX = event.clientX;
        this._mousePositionY = event.clientY;

        switch (event.buttons) {
            case 0:
                this._hoveredElement = this._findPointedElement();
                break;
            case 1:
                switch (this._clickedElement.element!.tagName) {
                    case 'EDITOR-COMPONENT':
                        this._editorComponent!.transformRelative(this._mousePositionX  - this._previousMouseEvent!.clientX, this._mousePositionY - this._previousMouseEvent!.clientY);
                        break;
                    case 'NODE-CORE-COMPONENT':
                        this._editorComponent!.moveNodeRelative(this._clickedElement.parentElement! as NodeComponent, this._mousePositionX  - this._previousMouseEvent!.clientX, this._mousePositionY - this._previousMouseEvent!.clientY);
                        break;
                    case 'NODE-OUTPUT-PORT-COMPONENT':
                        this._editorComponent!.drawConnection(this._clickedElement.element! as NodeOutputPortComponent, this._mousePositionX, this._mousePositionY);
                        break;
                };

                this._previousMouseEvent = event;
                break;
        }
    };


    _onMouseUp(event: MouseEvent): void {
        console.log('AppComponent._onMouseUp', event.button);
        switch (event.button) {
            case 0:
                switch (this._clickedElement.element!.tagName) {
                    case 'EDITOR-COMPONENT': break;
                    case 'NODE-CORE-COMPONENT': break;
                    case 'NODE-OUTPUT-PORT-COMPONENT':
                        this._editorComponent!.clearGhostConnection();
                        break;
                };

                this._clickedElement = { element: null, parentElement: null };
                this._previousMouseEvent = null;
                break;
        }
    };


    // Note: parentElement crossing shadowRoot is not working.
    _findPointedElement(): { element: Element | null, parentElement: Element | null } {
        let pointedElement1 = this.shadowRoot!.elementFromPoint(this._mousePositionX, this._mousePositionY)!;

        switch (pointedElement1.tagName) {
            case 'EDITOR-COMPONENT':
                let pointedElement2 = pointedElement1.shadowRoot!.elementFromPoint(this._mousePositionX, this._mousePositionY)!;

                switch (pointedElement2.tagName) {
                    case 'NODE-COMPONENT':
                        let pointedElement3 = pointedElement2.shadowRoot!.elementFromPoint(this._mousePositionX, this._mousePositionY)!;
                    
                        switch (pointedElement3.tagName) {
                            case 'NODE-INPUT-PORT-COMPONENT':
                            case 'NODE-OUTPUT-PORT-COMPONENT':
                            case 'NODE-CORE-COMPONENT':
                                return { element: pointedElement3, parentElement: pointedElement2};
                            default:
                                return { element: pointedElement2, parentElement: pointedElement1};
                        }
                    default:
                        return { element: pointedElement1, parentElement: null};
                };
            default:
                return {element: null, parentElement: null}
        };
    }
}
