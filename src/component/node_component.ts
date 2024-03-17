import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('node-component')
export class NodeComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            border: 2px dashed black;
            background-color: #000;
            box-sizing: border-box;
        }
    `;

    
    height: string = "100px";
    width: string = "100px";
    x: number = 0;
    y: number = 0;


    override render() {
        return html`
            <h1>Node</h1>
            <div>Port</div>
        `;
    }
}
