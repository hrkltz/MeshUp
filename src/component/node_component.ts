import {CSSResult, LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('node-component')
export class NodeComponent extends LitElement {
    static override styles: CSSResult = css`
    div {
        width: 100%;
        height: 100%;
        border: 2px dashed black;
        background-color: white;
        box-sizing: border-box;
    }
    
    div:focus {
        outline: none;
        border-color: blue;
        border-style: solid;
    }
    `;
    
    height: string = "100px";
    width: string = "100px";
    x: number = 0;
    y: number = 0;

    onfocus: ((this: GlobalEventHandlers, ev: FocusEvent) => any) = (event: FocusEvent) => {
        console.log('NodeComponent.onfocus')
        window.dispatchEvent(new CustomEvent('meshup-focus', {
            detail: this
        }));
    };
    onblur: ((this: GlobalEventHandlers, ev: FocusEvent) => any) = (event: FocusEvent) => {
        console.log('NodeComponent.onblur')
        window.dispatchEvent(new CustomEvent('meshup-focus', {
            detail: null
        }));
    }



    // Note: tabindex is required to make the svg element focusable which allows it to react to key events. Somehow it can't be set in the property decorator but it works if the first child has it.
    override render() {
        return html`
            <div
            tabindex=${-1}
            @keydown=${this._keydownHandler}>Hallo</div>
        `;
    }
}
