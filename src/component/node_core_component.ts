import { CSSResult, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('node-core-component')
export class NodeCoreComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            background-color: var(--background-day);
            border: 1px solid var(--border-day);
            box-sizing: border-box;
            color: #000000;
            display: block;
            height: 100%;
            width: 100%;
        }

        @media (prefers-color-scheme: dark) {
            :host {
                background-color: var(--background-night);
                border-color: var(--border-night);
            }
        }
    `;
}
