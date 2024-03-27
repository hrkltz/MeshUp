import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


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
    `;


    override render() {
        return html`
            <h1>MeshUp</h1>
            <editor-component></editor-component>
        `;
    };
};
