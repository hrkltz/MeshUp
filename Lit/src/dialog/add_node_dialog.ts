import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('add-node-dialog')
export class AddNodeDialog extends LitElement {
    static override styles: CSSResult = css`
        :host {
            z-index: 999;
            position: absolute;
            top: 0;
            left: 0;
            width: 100dvw;
            height: 100dvh;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        :host > div {
            background-color: var(--background-day);
            border: 1px solid var(--border-day);
            display: flex;
            flex-direction: column;
        }


        @media (prefers-color-scheme: dark) {
            :host > div {
                background-color: var(--background-night);
                border-color: var(--border-night);
            }
        }
    `;


    // Hide the constructor as the dialog will be shown via the open function.
    private constructor() {
        super();
    };


    static async open() {
        const dialog = new AddNodeDialog();
        document.body.appendChild(dialog);

        return new Promise((resolve) => {
            dialog.addEventListener('close', (event: Event) => {
                resolve((event as CustomEvent).detail);
                dialog.remove();
            }, { once: true });
        });
    };


    private _close(result: string) {
        this.dispatchEvent(new CustomEvent('close', { detail: result }));
    };


    override render() {
        return html`
            <div>
                <h1>Add Node</h1>
                <button @click="${() => this._close('MergeNode')}">MergeNode</button>
                <button @click="${() => this._close('ScriptNode')}">ScriptNode</button>
                <button @click="${() => this._close('StartSourceNode')}">StartSourceNode</button>
            </div>
        `;
    };
};
