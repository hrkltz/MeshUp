import { CSSResult, LitElement, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { EditorComponent } from './editor_component';
import { NodeComponent } from './node_component';


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
    private _selectedElement: Element | null = null;
    private _hoverElement: Element | null = null;
    private _previousMouseEvent: MouseEvent | null = null;
    private _mousePositionX: number = 0;
    private _mousePositionY: number = 0;
    @query('editor-component', true) private _editorComponent!: EditorComponent;


    override render() {
        return html`
            <h1>MeshUp</h1>
            <editor-component></editor-component>
            <info-component selectedElementTagName=${this._hoverElement ? this._hoverElement.tagName : ''}></info-component>
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
        const targetElement = this._findTargetElement();

        switch (targetElement.tagName) {
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
                    case 'a':
                        this._editorComponent!.addNode(this._mousePositionX, this._mousePositionY);
                        break;
                };
                break;
            case 'NODE-COMPONENT':
                switch (event.key) {
                    case 'ArrowUp':
                        this._editorComponent!.moveNodeRelative(targetElement as NodeComponent, 0, -25);
                        break;
                    case 'ArrowDown':
                        this._editorComponent!.moveNodeRelative(targetElement as NodeComponent, 0, 25);
                        break;
                    case 'ArrowLeft':
                        this._editorComponent!.moveNodeRelative(targetElement as NodeComponent, -25, 0);
                        break;
                    case 'ArrowRight':
                        this._editorComponent!.moveNodeRelative(targetElement as NodeComponent, 25, 0);
                        break;
                    case 'd':
                        this._editorComponent!.deleteNode(targetElement as NodeComponent);
                        break;
                };
                break;
        };
    }


    _onMouseDown(event: MouseEvent): void {
        this._selectedElement = this._findTargetElement();
        this._previousMouseEvent = event;
    }


    _onMouseMove(event: MouseEvent): void {
        this._hoverElement = this._findTargetElement();
        this._mousePositionX = event.clientX;
        this._mousePositionY = event.clientY;

        if (event.buttons !== 1) return;

        switch (this._selectedElement!.tagName) {
            case 'EDITOR-COMPONENT':
                this._editorComponent!.transformRelative(this._mousePositionX  - this._previousMouseEvent!.clientX, this._mousePositionY - this._previousMouseEvent!.clientY);
                break;
            case 'NODE-COMPONENT':
                this._editorComponent!.moveNodeRelative(this._selectedElement! as NodeComponent, this._mousePositionX  - this._previousMouseEvent!.clientX, this._mousePositionY - this._previousMouseEvent!.clientY);
                break;
        };

        this._previousMouseEvent = event;
    };


    _onMouseUp(event: MouseEvent): void {
        this._selectedElement = null;
        this._previousMouseEvent = null;
    };


    _findTargetElement(): Element {
        this._selectedElement = this.shadowRoot!.elementFromPoint(this._mousePositionX, this._mousePositionY);

        if (this._selectedElement?.tagName === 'EDITOR-COMPONENT') {
            let selectedSubComponent = this._selectedElement.shadowRoot!.elementFromPoint(this._mousePositionX, this._mousePositionY);

            if (['NODE-COMPONENT'].includes(selectedSubComponent!.tagName)) {
                let selectedSubSubComponent = selectedSubComponent!.shadowRoot!.elementFromPoint(this._mousePositionX, this._mousePositionY);
                this._selectedElement = selectedSubSubComponent;
            };
        };

        //console.log(this._mousePositionX, this._mousePositionY, this._selectedElement!.tagName);
        return this._selectedElement!;
    }
}
