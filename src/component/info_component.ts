import { CSSResult, LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';


@customElement('info-component')
export class InfoComponent extends LitElement {
    static override styles: CSSResult = css`
        :host {
            box-sizing: border-box;
            background-color: #ffffff;
            border: 1px solid grey;
        }
    `;

    
    @property({ type: String }) public selectedElementTagName: string = '';

    
    override render() {
        switch (this.selectedElementTagName) {
            case 'EDITOR-COMPONENT':
                return html`
                    <h2>Info Box</h2>
                    <p>Editor<br />A: Add node</p>
                `;
            case 'NODE-COMPONENT':
                return html`
                    <h2>Info Box</h2>
                    <p>Node<br />d: Delete</p>
                `;
            default:
                return html`
                    <h2>Info Box</h2>
                    <p>${this.selectedElementTagName}</p>
                `;
        }
    }
}
