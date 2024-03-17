import { CSSResult, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('node-core-component')
export class NodeCoreComponent extends LitElement {
    static override styles: CSSResult = css`
        node-core-component {
            align-items: center;
            background-color: var(--background-day);
            border: 1px solid var(--border-day);
            box-sizing: border-box;
            color: #000000;
            display: flex;
            height: 100%;
            justify-content: center;
            width: 100%;
        };

        @media (prefers-color-scheme: dark) {
            node-core-component {
                background-color: var(--background-night);
                border-color: var(--border-night);
            };
        };
    `;


    // Disable shadow DOM for this element.
    protected createRenderRoot() {
        return this;
    };
};
