import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('node-component')
export class NodeComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        :host > div.input-container,
        :host > div.output-container {
            height: 100%;
            box-sizing: border-box;
            flex: 0 0 20px;
        }

        :host > node-core-component {
            height: 100%;
            flex: 1 1 auto;
            background-color: #fff;
            box-sizing: border-box;
            border: 1px solid grey;
        }

        :host > div.input-container > node-input-port-component,
        :host > div.output-container > node-output-port-component {
            height: 20px;
            width: 100%;
            box-sizing: border-box;
        }
    `;

    
    height: string = "100px";
    width: string = "100px";
    x: number = 0;
    y: number = 0;


    override render() {
        return html`
            <div class="input-container">
                <node-input-port-component>1</node-input-port-component>
                <node-input-port-component>2</node-input-port-component>
            </div>
            <node-core-component></node-core-component>
            <div class="output-container">
                <node-output-port-component>1</node-output-port-component>
            </div>
        `;
    }
}
