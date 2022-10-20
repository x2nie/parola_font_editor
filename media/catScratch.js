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
    class Sprite extends Component {
        static template = "Sprite"

        setup() {
            this.state = useState({ indent: 0, cols: [] });
            useEffect(
                () => {
                    const line = this.props.line.line;
                    this.state.indent = line.length - line.replace(/^\s+/, '').length;
                    const numbers = [];
                    let word;
                    while ((word = numberExp.exec(line))) {
                        const n = word[1];
                        numbers.push(Number(n));
                    }
                    this.state.cols = numbers;
                },
                () => [this.props.line]
            );
        }
    }

    class Anim extends Component {
        static components = { Sprite };
        static template = "Anim"

        setup() {
            this.state = useState({ name: 'World' });
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
    }


    // Application setup
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


    const notesContainer = /** @type {HTMLElement} */ (document.querySelector('.anims'));

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
        sprites.anims = data.anims;
        sprites.vars = data.vars;
        return;
        // const env = useEnv();
        // env.anims.state = data.anims;
        notesContainer.innerText = '';
        console.log('data:', data)
        const vars = data.vars;
        data.anims.forEach(anim => {

            const element = document.createElement('li');
            // element.className = 'note';
            // console.log('found:',word)
            element.innerText = anim.name;
            notesContainer.appendChild(element);

            //array
            const textContent = document.createElement('span');
            textContent.innerText = ` ${vars[anim.heightVar]} x ${vars[anim.widthVar]}`;
            element.appendChild(textContent);


        });
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
                vscode.setState({ text, data });

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
