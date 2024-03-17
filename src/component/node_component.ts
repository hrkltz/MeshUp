import { CSSResult, LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';


@customElement('node-component')
export class NodeComponent extends LitElement {
    static override styles: CSSResult = css`
        node-component {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        node-component > div.input-container,
        node-component > div.output-container {
            height: 100%;
            box-sizing: border-box;
            flex: 0 0 20px;
        }

        node-component > node-core-component {
            height: 100%;
            flex: 1 1 auto;
            background-color: #fff;
            box-sizing: border-box;
            border: 1px solid grey;
        }

        node-component > div.input-container > node-input-port-component,
        node-component > div.output-container > node-output-port-component {
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
                <node-input-port-component id="${this.id}.in1">1</node-input-port-component>
                <node-input-port-component id="${this.id}.in2">2</node-input-port-component>
                <node-input-port-component id="${this.id}.in3">3</node-input-port-component>
            </div>
            <node-core-component></node-core-component>
            <div class="output-container">
                <node-output-port-component id="${this.id}.out1">1</node-output-port-component>
                <node-output-port-component id="${this.id}.out2">2</node-output-port-component>
                <node-output-port-component id="${this.id}.out3">3</node-output-port-component>
            </div>
        `;
    }


    // Disable shadow DOM for this element.
    protected createRenderRoot() {
        return this;
    }
}
