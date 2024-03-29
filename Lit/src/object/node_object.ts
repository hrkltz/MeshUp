export class NodeObject {
    contentJson: string = '';
    id: string = '';
    inputPortArray: Array<Array<string>> = [];
    outputPortArray: Array<Array<string>> = [];
    type: string = '';
    x: number = 0;
    y: number = 0;
    

    constructor(id: string, type: string, x: number, y: number) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
    }
}