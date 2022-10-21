// Script run within the webview itself.
(function () {
    // @ts-check

    // @ts-ignore
    // In this implementation, we use the owl reactivity mechanism.
    const { Component, useState, mount, useRef, onPatched, onMounted, reactive, useEnv, useEffect } = owl;

    // function useStore() {
    //     const env = useEnv();
    //     return useState(env.store);
    // }

    const sprites = reactive({ anims: [], vars: {} }, () => console.log("changed"));

    //------------------------------------------------------------------------------
    // Anim store
    //------------------------------------------------------------------------------
    /*
    class AnimList {
        constructor(anims) {
            this.anims = anims || [];
            const taskIds = this.anims.map((t) => t.id);
            this.nextId = taskIds.length ? Math.max(...taskIds) + 1 : 1;
        }

        replaceAnims(anims) {
            this.anims = anims
            for (let index = 0; index < anims.length; index++) {
                if (arr[index] === 'a') {
                    arr[index] = 'z';
                    break;
                }
            }
        }

        // addAnim(text) {
        //     text = text.trim();
        //     if (text) {
        //         const anim = {
        //             id: this.nextId++,
        //             text: text,
        //             isCompleted: false,
        //         };
        //         this.anims.push(anim);
        //     }
        // }

        toggleAnim(anim) {
            anim.isCompleted = !anim.isCompleted;
        }

        toggleAnim(id) {
            const anim = this.anims.find(t => t.id === id);
            anim.isCompleted = !anim.isCompleted;
        }

        toggleAll(value) {
            for (let anim of this.anims) {
                anim.isCompleted = value;
            }
        }

        clearCompleted() {
            const anims = this.anims.filter(t => t.isCompleted);
            for (let anim of anims) {
                this.deleteAnim(anim);
            }
        }

        deleteAnim(id) {
            const index = this.anims.findIndex((t) => t.id === id);
            this.anims.splice(index, 1);
        }

        updateAnim(id, text) {
            const value = text.trim();
            if (!value) {
                this.deleteAnim(id);
            } else {
                const anim = this.anims.find(t => t.id === id);
                anim.text = value;
            }
        }
    }

    function createAnimStore() {
        const saveAnims = () => localStorage.setItem("todoapp", JSON.stringify(taskStore.anims));
        const initialAnims = JSON.parse(localStorage.getItem("todoapp") || "[]");
        const taskStore = reactive(new AnimList(initialAnims), saveAnims);
        saveAnims();
        return taskStore;
    }
    */


   

    const numberExp = /([0-9a-fA-Fx]+)/g;
    const led = {width: 15, padding:2}

    class Sprite extends Component {
        static template = "Sprite"

        setup() {
            this.state = useState({ changing:true, lineIndex: -1, indent: 0, cols: [] });
            this.att = useState({width: this.state.cols.length * led.width , 
                height: 8 * led.width})
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
                    this.att.width = this.state.cols.length * led.width 
                },
                () => [this.props.line]
            );
            useEffect(
                () => {                    
                    this.draw();
                },
                () => [this.att]
            );
        }

        get att0(){
            return {width: this.state.cols.length * led.width , 
                    height: 8 * led.width}
            return {width: `${this.state.cols.length * (led.width )}px`, 
                    height: `${8 * (led.width)}px`}
        }

        draw(){
            // console.log('canvas:', this.canvas);
            if(!this.canvas.el) return;
            let canvas = this.canvas.el;
            canvas.width = this.att.width;
            canvas.height = this.att.height;
            const ctx = canvas.getContext("2d");
            // ctx.fillStyle = "#FF0000";
            ctx.fillStyle = ctx.createPattern(sprites.patternOff, "repeat");
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // console.log('drawing canvas @:', canvas.width, canvas.height);
            // canvas = null;
        }

        toggle(i) {
            this.state.cols[i] = this.state.cols[i] === 0 ? 0xff : 0;
            const hexs = this.state.cols.map(n => `0x${n <= 0x0f? '0': '' }${n.toString(16)}`)
            vscode.postMessage({
                type: 'line-modified',
                index: this.state.lineIndex,
                data: `${' '.repeat(this.state.indent)}${hexs.join(', ')},`
            });
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
    }

    // Main root component
    class Root extends Component {
        static components = { Anim };
        static template = "Root"

        setup() {
            this.state = useState({ name: 'World' });
            this.env = useState(sprites);
        }
        get raw_anims(){
            return JSON.stringify(this.env.anims)
        }
    }


    // Application setup
    
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
    sprites.patternOn = drawPattern('pat-on', true);
    sprites.patternOff = drawPattern('pat-off', false);
    // const env = reactive({ a: 1 }, () => console.log("changed:",arguments));
    //------------------------------------------------------------------------------
    // App Initialization
    //------------------------------------------------------------------------------
    // const env = { store: createAnimStore(), anims: [], vars: {} };
    mount(Root, document.body, {  dev: false });


    // Get a reference to the VS Code webview api.
    // We use this API to post messages back to our extension.

    // @ts-ignore
    const vscode = acquireVsCodeApi();



    // const cvPatOff = /** @type {HTMLElement} */ (document.getElementById('pat-off'));


    const addButtonContainer = document.querySelector('.add-button');
    // @ts-ignore
    addButtonContainer.querySelector('button').addEventListener('click', () => {
        vscode.postMessage({
            type: 'add'
        });
    })

    const errorContainer = document.createElement('div');
    document.body.appendChild(errorContainer);
    errorContainer.className = 'error'
    errorContainer.style.display = 'none'

    /**
     * Render the document in the webview. coy
     */
    function updateContent(/** @type {string} */ text, /** @type {object} */  data) {
        console.log('data:', data)
        sprites.anims = data.anims;
        sprites.vars = data.vars;
        return;
    }

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'update':
                // console.log('data:',message.data)
                const text = message.text;
                const data = message.data;

                // Update our webview's content
                updateContent(text, data);

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
