import { CSSResult, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('node-core-component')
export class NodeCoreComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
            background-color: #ffffff;
            color: #000000;
            box-sizing: border-box;
            border: 1px solid grey;
        }
    `;
}
