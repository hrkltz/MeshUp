import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';


@customElement('script-node')
export class ScriptNode extends LitElement {
    static override styles: CSSResult = css`
        script-node {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        script-node > div.input-container,
        script-node > div.output-container {
            height: 100%;
            box-sizing: border-box;
            flex: 0 0 20px;
        }

        script-node > node-core-component {
            height: 100%;
            flex: 1 1 auto;
            background-color: #fff;
            box-sizing: border-box;
            border: 1px solid grey;
        }

        script-node > div.input-container > node-input-port-component,
        script-node > div.output-container > node-output-port-component {
            height: 20px;
            width: 100%;
            box-sizing: border-box;
        }
    `;


    public id: string = uuidv4();
    height: string = "60px";
    width: string = "80px";
    x: number = 0;
    y: number = 0;


    override render() {
        return html`
            <div class="input-container">
                <node-input-port-component id="${this.id}.0">0</node-input-port-component>
            </div>
            <node-core-component></node-core-component>
            <div class="output-container">
                <node-output-port-component id="${this.id}.0">0</node-output-port-component>
            </div>
        `;
    };


    // Disable shadow DOM for this element.
    protected createRenderRoot() {
        return this;
    };
};
