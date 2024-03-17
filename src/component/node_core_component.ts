import { CSSResult, LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';


@customElement('node-core-component')
export class NodeCoreComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            align-items: center;
            background-color: var(--background-day);
            border: 1px solid var(--border-day);
            box-sizing: border-box;
            color: #000000;
            display: flex;
            height: 100%;
            justify-content: center;
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
