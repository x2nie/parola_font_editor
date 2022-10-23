// Script run within the webview itself.
(function () {
    // @ts-check

    // @ts-ignore
    // In this implementation, we use the owl reactivity mechanism.
    const { Component, useState, mount, useRef, onPatched, onMounted, reactive, useEnv, useEffect } = owl;
    const sprites = reactive({ anims: [], vars: {}, codes:{}, editingLine: 0, editingAnim:-1, nextEditingLine:0 }, (e) => console.log("changed:",e));
    const drawingState = reactive({ pencilOn: true }, (e) => console.log("changed:",e));
    const ledSmall = {width: 4, padding:0.5}
    const ledBig = {width: 15, padding:2}

    
    const numberExp = /([0-9a-fA-Fx]+)/g;

    class Sprite extends Component {
        static template = "Sprite"

        setup() {
            this.state = useState({ changing:true, lineIndex: -1, indent: 0, cols: [] });
            this.led = this.props.led === 'big'? ledBig : ledSmall;
            this.pattern = this.props.led === 'big'? sprites.patternBig : sprites.patternSmall;
            this.att = useState({width: this.state.cols.length * this.led.width , 
                height: 8 * this.led.width})
            this.canvas = useRef('canvas')
            useEffect(
                () => {
                    this.state.changing = true;
                    const line = this.props.line.line;
                    this.state.lineIndex = this.props.line.lineIndex;
                    this.state.indent = line.length - line.replace(/^\s+/, '').length;
                    const numbers = [];
                    let word;
                    while ((word = numberExp.exec(line))) {
                        const n = word[1];
                        numbers.push(Number(n));
                    }
                    // this.state.cols.splice(0, this.state.cols.length, numbers);
                    this.state.cols = numbers;
                    this.state.changing = false;
                    // this.draw();
                    this.att.width = this.state.cols.length * this.led.width 
                },
                () => [this.props.line]
            );
            useEffect(
                () => {                    
                    this.draw();
                },
                () => [this.att, this.state.cols]
            );
        }


        draw(){
            // @ts-check

            // console.log('canvas:', this.canvas);
            if(!this.canvas.el) return;
            let canvas = /** @type {HTMLCanvasElement} */ this.canvas.el;
            canvas.width = this.att.width;
            canvas.height = this.att.height;
            const ctx = canvas.getContext("2d");
            // ctx.fillStyle = "#FF0000";
            // ctx.fillStyle = ctx.createPattern(sprites.patternOff, "repeat");
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
            // console.log('drawing canvas @:', canvas.width, canvas.height);
            const ledWidth = this.led.width;
            this.state.cols.forEach((col, x) => {
                for (let y = 0; y < 8; y++) {
                    const on = col & (1 << y)? 1 : 0;
                    ctx.drawImage(this.pattern[on], x * ledWidth, y* ledWidth);
                }
            });
                
        }

        selectme() {
            sprites.editingLine = this.state.lineIndex;
            sprites.editingAnim = this.props.anim_index;
        }

        toggle(i) {
            this.state.cols[i] = this.state.cols[i] === 0 ? 0xff : 0;
            // this.draw();
            const hexs = this.state.cols.map(n => `0x${n <= 0x0f? '0': '' }${n.toString(16)}`)
            vscode.postMessage({
                type: 'line-modified',
                index: this.state.lineIndex,
                data: `${' '.repeat(this.state.indent)}${hexs.join(', ')},`
            });
        }
    }

    class SpriteEditor extends Component {
        static template = "SpriteEditor"

        setup() {
            // this.lineEditing = sprites.editingLine
            this.state = useState({ changing:true, drawing:false, code:'', indent: 0, cols: [] });
            console.log('editor.code:', this.state.code, '@', this.props.line)
            this.led = this.props.led === 'big'? ledBig : ledSmall;
            this.pattern = this.props.led === 'big'? sprites.patternBig : sprites.patternSmall;
            this.att = useState({width: this.state.cols.length * this.led.width , 
                height: 8 * this.led.width})
            this.canvas = useRef('canvas')            
            useEffect(
                () => {
                    // if(!Object.keys(sprites.codes).includes(sprites.editingLine)) {
                    // if(!Object.keys(sprites.codes).includes(`${this.props.line}`)) {
                    //     console.log('no editing:', Object.keys(sprites.codes), '@', this.props.line )
                    //     return;
                    // }
                    // this.state.changing = true;
                    // const line = sprites.codes[`${this.props.line}`];
                    const line = this.props.line;
                    console.log('editor.line:', line)
                    // this.state.lineIndex = this.props.line.lineIndex;
                    this.state.indent = line.length - line.replace(/^\s+/, '').length;
                    const numbers = [];
                    let word;
                    while ((word = numberExp.exec(line))) {
                        const n = word[1];
                        numbers.push(Number(n));
                    }
                    // this.state.cols.splice(0, this.state.cols.length, numbers);
                    this.state.cols = numbers;
                    // this.state.changing = false;
                    // this.draw();
                    this.att.width = this.state.cols.length * this.led.width ;
                },
                () => [this.props.line]
                // () => [this.props.line, sprites.version]
                // () => [this.state.code]
                // () => [this.lineEditing]
                // () => [this.state.lineIndex]
                // () => [sprites.editingLine, this.lineEditing, this.state.lineEditing]
            );
            useEffect(
                () => {                    
                    this.draw();
                },
                () => [this.att, this.state.cols]
            );
        }
        setup0() {
            // this.lineEditing = sprites.editingLine
            this.state = useState({ changing:true, drawing:false, code:'', indent: 0, cols: [] });
            console.log('editor.code:', this.state.code, '@', this.props.line)
            this.led = this.props.led === 'big'? ledBig : ledSmall;
            this.pattern = this.props.led === 'big'? sprites.patternBig : sprites.patternSmall;
            this.att = useState({width: this.state.cols.length * this.led.width , 
                height: 8 * this.led.width})
            this.canvas = useRef('canvas')            
            useEffect(
                () => {
                    // if(!Object.keys(sprites.codes).includes(sprites.editingLine)) {
                    if(!Object.keys(sprites.codes).includes(`${this.props.line}`)) {
                        console.log('no editing:', Object.keys(sprites.codes), '@', this.props.line )
                        return;
                    }
                    this.state.changing = true;
                    const line = sprites.codes[`${this.props.line}`];
                    // const line = this.state.code;
                    console.log('editor.line:', line)
                    // this.state.lineIndex = this.props.line.lineIndex;
                    this.state.indent = line.length - line.replace(/^\s+/, '').length;
                    const numbers = [];
                    let word;
                    while ((word = numberExp.exec(line))) {
                        const n = word[1];
                        numbers.push(Number(n));
                    }
                    // this.state.cols.splice(0, this.state.cols.length, numbers);
                    this.state.cols = numbers;
                    this.state.changing = false;
                    // this.draw();
                    this.att.width = this.state.cols.length * this.led.width ;
                },
                () => [this.props.line, sprites.version]
                // () => [this.state.code]
                // () => [this.lineEditing]
                // () => [this.state.lineIndex]
                // () => [sprites.editingLine, this.lineEditing, this.state.lineEditing]
            );
            useEffect(
                () => {                    
                    this.draw();
                },
                () => [this.att, this.state.cols]
            );
        }


        draw(){
            // @ts-check
            // return;

            // console.log('canvas:', this.canvas);
            if(!this.canvas.el) return;
            let canvas = /** @type {HTMLCanvasElement} */ this.canvas.el;
            canvas.width = this.att.width;
            canvas.height = this.att.height;
            const ctx = canvas.getContext("2d");
            // ctx.fillStyle = "#FF0000";
            // ctx.fillStyle = ctx.createPattern(sprites.patternOff, "repeat");
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
            // console.log('drawing canvas @:', canvas.width, canvas.height);
            const ledWidth = this.led.width;
            this.state.cols.forEach((col, x) => {
                for (let y = 0; y < 8; y++) {
                    const on = col & (1 << y)? 1 : 0;
                    ctx.drawImage(this.pattern[on], x * ledWidth, y* ledWidth);
                }
            });
                
        }

        startDrawing(ev) {
            console.log('mouse-down.ev:',ev)
            if(ev.button != 0) return;
            const self = this;
            const canvasEl = this.canvas.el;
            const pencilOn = drawingState.pencilOn; // buttonLeft = draw, buttonRight = erase
            // const pencilOn = ev.button == 0; // buttonLeft = draw, buttonRight = erase

            // const el = root.el;
            // el.classList.add('dragging');

            // const current = this.props.info;
            // const offsetX = current.left - ev.pageX;
            // const offsetY = current.top - ev.pageY;
            let x, y;

            canvasEl.addEventListener("mousemove", switchLed);
            window.addEventListener("mouseup", stopDnD, { once: true });

            function switchLed(ev) {
                x = Math.floor(ev.offsetX/self.led.width);
                y = Math.floor(ev.offsetY/self.led.width);
                // console.log('paint:',pencilOn,x, ',', y, self.state.cols.join(','))
                if(pencilOn)
                    self.state.cols[x] = self.state.cols[x] | (1 << y)
                else
                    self.state.cols[x] = self.state.cols[x] & ~(1 << y);
                // self.state.cols[x] = 0xff
                self.draw()
            }
            function stopDnD() {
                canvasEl.removeEventListener("mousemove", switchLed);
                // el.classList.remove('dragging');

                // if (top !== undefined && left !== undefined) {
                //     self.windowService.updatePosition(current.id, left, top);
                // }
                self.tellOuter()
            }

            switchLed(ev); //first mouse down shall edit the led.
        }


        toggle(i) {
            this.state.cols[i] = this.state.cols[i] === 0 ? 0xff : 0;
            // this.draw();
        }
        tellOuter() {
            //? tell vscode that the line has been modified.
            const hexs = this.state.cols.map(n => `0x${n <= 0x0f? '0': '' }${n.toString(16)}`)
            vscode.postMessage({
                type: 'line-modified',
                // index: Number(this.props.line),
                index: Number(sprites.editingLine),
                data: `${' '.repeat(this.state.indent)}${hexs.join(', ')},`
            });
        }
    }

    class Toolbox extends Component {
        static template = "Toolbox"

        setup() {
            this.state = useState(drawingState);
            this.env = useState(sprites);
        }
        clear() {
            directLineModify(this.env.editingLine, () => 0)
        }

        invert() {
            directLineModify(this.env.editingLine, (n) => ~n & 0xff)
        }
        flipV() {
            function flip(n) {
                let a = [];
                for (let i = 0; i < 8; i++) {
                    a.push( (n & (1 << i)) == 0 ? 0 : 1);
                }
                const bin = a.join('')
                console.log('flipV a:',a, 'bin:',bin)
                return parseInt(bin, 2)
            }
            directLineModify(this.env.editingLine, flip);
        }
        flipH(){
            function flip(numbers){
                const nums = [...numbers];
                nums.reverse()
                return nums;
            }
            directLineModify(this.env.editingLine, null, flip)
        }
        duplicate(){
            const sprite = this.env.codes[`${this.env.editingLine}`];
            const txt = `${sprite}`
            const lineIndex = Number(this.env.editingLine+1)
            console.log('duplicate.sprite:',sprite,'@', lineIndex)
            sprites.nextEditingLine = lineIndex;
            // sprites.editingLine = lineIndex;
            vscode.postMessage({
                type: 'line-insert',
                index: lineIndex,
                data: txt,
            });
        }
        delete(){
            vscode.postMessage({
                type: 'delete',
                index: this.env.editingLine,
            });
        }
        newAnim(){
            vscode.postMessage({
                type: 'new-anim',
            });
        }
        appendColumn(){
            function append(numbers){
                const nums = [...numbers, 0x00];
                return nums;
            }
            const config = buildConfig('W', +1)
            directLinesModify(currentAnimLineIds(), null, append, config)
        }

        popColumn(){
            function pop(numbers){
                const nums = [...numbers];
                nums.pop()
                return nums;
            }
            const config = buildConfig('W', -1)
            directLinesModify(currentAnimLineIds(), null, pop, config)
        }


    }

    class Anim extends Component {
        static components = { Sprite };
        static template = "Anim"

        setup() {
            const {data, ...etc} = this.props.anim;
            this.anim = useState({'sprites':data, ...etc});

            useEffect(
                () => {
                    this.anim.sprites = this.props.anim.data;
                },
                () => [this.props.anim]
            ) 
            // this.anim = useState(this.props.anim);
            // console.log('anim.anim:', this.anim)
            // this.env = useEnv();
        }
        add(){
            const sprite = this.anim.sprites[this.anim.sprites.length-1];
            const txt = sprite.line.replaceAll(/([0-9a-fA-F])/g,()=>'0')
            const lineIndex = Number(sprite.lineIndex+1)
            sprites.nextEditingLine = lineIndex;
            // sprites.editingLine = lineIndex;
            vscode.postMessage({
                type: 'line-insert',
                index: lineIndex,
                data: txt,
            });
        }
    }

    // Main root component
    class Root extends Component {
        static components = { Anim, Sprite, SpriteEditor, Toolbox };
        static template = "Root"

        setup() {
            this.state = useState({ sample: {lineIndex:-1, line : "  0xff, 0x8f, 0x8f, 0x8f, 0x81, 0x81, 0x81, 0xff,"} });
            this.env = useState(sprites);
        }
        get raw_anims(){
            return JSON.stringify(this.env.anims)
        }
        get editorTitle(){
            let title = '';
            if(this.env.editingAnim>=0 && this.env.anims.length > this.env.editingAnim){
                title =  this.env.anims[this.env.editingAnim].name;
            }
            return `${title} #${this.env.editingLine}`
        }
        get editorData(){
            if(!Object.keys(this.env.codes).includes(`${this.env.editingLine}`)) {
                console.log('no editing:' )
                return '';
            }
            return this.env.codes[`${this.env.editingLine}`]

        }
    }

    function directLineModify(lineIndex, columnCallback, finalCallback, config){
        const line = sprites.codes[sprites.editingLine]
        const indent = line.length - line.replace(/^\s+/, '').length;
        let numbers = [];
        let word;
        while ((word = numberExp.exec(line))) {
            let n = Number(word[1]);
            if(columnCallback){
                n = columnCallback(n)
            }
            numbers.push(n);
        }
        // this.state.cols.splice(0, this.state.cols.length, numbers);
        // this.state.cols = numbers;
        if(finalCallback!=undefined){
            numbers = finalCallback(numbers)
        }
        const hexs = numbers.map(n => `0x${n <= 0x0f? '0': '' }${n.toString(16)}`)
        //? tell vscode that the line has been modified.
        vscode.postMessage({
            type: 'line-modified',
            index: Number(lineIndex),
            data: `${' '.repeat(indent)}${hexs.join(', ')},`,
            config,
        });
    }

    function directLinesModify(lineIds, columnCallback, finalCallback, config){
        console.log('directLinesModify:', arguments)
        const data = lineIds.map(lineIndex => {            
            const line = sprites.codes[lineIndex]
            const indent = line.length - line.replace(/^\s+/, '').length;
            let numbers = [];
            let word;
            while ((word = numberExp.exec(line))) {
                let n = Number(word[1]);
                if(columnCallback){
                    n = columnCallback(n)
                }
                numbers.push(n);
            }
            // this.state.cols.splice(0, this.state.cols.length, numbers);
            // this.state.cols = numbers;
            if(finalCallback!=undefined){
                numbers = finalCallback(numbers)
            }
            const hexs = numbers.map(n => `0x${n <= 0x0f? '0': '' }${n.toString(16)}`);
            return {
                lineIndex,
                lineText: `${' '.repeat(indent)}${hexs.join(', ')},`,
            }
        });
        //? tell vscode that the line has been modified.
        vscode.postMessage({
            type: 'lines-modified',
            data,
            config,
        });
    }

    /**
     * Create a config to update the animation config 
     * @param {char} W_or_F width or framee
     * @param {number} count Amount of increment/decrement (+/-)
     */
    function buildConfig(W_or_F, count){
        const currentAnim = sprites.anims[ sprites.editingAnim ]
        const varName = W_or_F == 'F' ? currentAnim['framesVar'] : currentAnim['widthVar'];
        const config = sprites.vars[varName];
        return {
            lineIndex : config.lineIndex,
            value : Number(config.value) + count
        }
    }

    function currentAnimLineIds(){
        const currentAnim = sprites.anims[ sprites.editingAnim ]
        return currentAnim.data.map(line => line.lineIndex)
    }

    // Application setup
    
    function drawPatterns(canvasId, led){
    function drawPattern(canvasId, turnOn){
        const canvas = /** @type {HTMLElement} */ document.getElementById(canvasId);
        // canvas.setAttribute('width', `${led.width}px`)
        // canvas.setAttribute('height', `${led.width}px`)
        canvas.width = led.width;
        canvas.height = led.width;
        const context = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = centerX - led.padding;

        context.beginPath();
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = turnOn ? 'red' : '#444';
        context.fill();
        return canvas;
    }
    return [
        drawPattern(`${canvasId}-off`, false),
        drawPattern(`${canvasId}-on`, true),
    ]
    }
    sprites.patternSmall = drawPatterns('small-pat', ledSmall);
    sprites.patternBig = drawPatterns('big-pat', ledBig);
    // const env = reactive({ a: 1 }, () => console.log("changed:",arguments));
    //------------------------------------------------------------------------------
    // App Initialization
    //------------------------------------------------------------------------------
    // const env = { store: createAnimStore(), anims: [], vars: {} };
    mount(Root, document.body, {  dev: true });


    // Get a reference to the VS Code webview api.
    // We use this API to post messages back to our extension.

    // @ts-ignore
    const vscode = acquireVsCodeApi();



    // const cvPatOff = /** @type {HTMLElement} */ (document.getElementById('pat-off'));


    // const addButtonContainer = document.querySelector('.add-button');
    // // @ts-ignore
    // addButtonContainer.querySelector('button').addEventListener('click', () => {
    //     vscode.postMessage({
    //         type: 'add'
    //     });
    // })

    // const errorContainer = document.createElement('div');
    // document.body.appendChild(errorContainer);
    // errorContainer.className = 'error'
    // errorContainer.style.display = 'none'

    /**
     * Render the document in the webview. coy
     */
    function updateContent(/** @type {object} */  data) {
        console.log('data:', data)
        sprites.anims = data.anims;
        sprites.vars = data.vars;
        sprites.codes = data.codes;
        sprites.version = data.version; //signal that sprites need to repaint
        if(!sprites.editingLine){

            console.log('sprites.editingLine :=', Object.keys(data.codes)[0])
            sprites.editingLine = Object.keys(data.codes)[0]
            sprites.editingAnim =  data.anims.length > 0 ? 0 : -1;
        }
        if(sprites.nextEditingLine){
            sprites.editingLine = sprites.nextEditingLine;
            sprites.nextEditingLine = 0;
        }
        return;
    }

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'update':
                // console.log('data:',message.data)
                // const text = message.text;
                const data = message.data;

                // Update our webview's content
                updateContent(data);

                // Then persist state information.
                // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
                // vscode.setState({ text, data });

                return;
        }
    });




    // Webviews are normally torn down when not visible and re-created when they become visible again.
    // State lets us save information across these re-loads
    // const state = vscode.getState();
    // if (state) {
    //     // updateContent(state.text, state.data);
    // }
    vscode.postMessage({
        type: 'firstload'
    });
}());
