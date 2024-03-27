import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('node-output-port-component')
export class NodeOutputPortComponent extends LitElement {
    static override styles: CSSResult = css`
        node-output-port-component {
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


    public get cX() : number {
        return this.getBoundingClientRect().left + this.getBoundingClientRect().width/2;
    };
    public get cY() : number {
        return this.getBoundingClientRect().top + this.getBoundingClientRect().height/2;
    };


    override render() {
        return html`<slot></slot>`;
    };


    // Disable shadow DOM for this element.
    protected createRenderRoot() {
        return this;
    };
};
