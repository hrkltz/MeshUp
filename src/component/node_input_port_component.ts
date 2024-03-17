import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('node-input-port-component')
export class NodeInputPortComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
            background-color: #ffffff;
            color: #000000;
            box-sizing: border-box;
            border: 1px solid grey;
            text-align: center;
        }
    `;


    override render() {
        return html`<slot></slot>`;
    }
}