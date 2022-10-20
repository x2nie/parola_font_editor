// @ts-check

// @ts-ignore
const { Component, reactive, useState, mount,xml } = owl;

// console.log('OWL:', owl.__info__)

class Greeter extends Component {
    static template = "Greeter";
    
    setup() {
        this.state = useState({ word: 'Hello bosZ!' });
        // this.a = useState(th)
    }

    toggle() {
        this.state.word = this.state.word === 'Hi' ? 'Hello' : 'Hi';
        // this.env.a ++;
    }
}

// Main root component
class Root extends Component {
    static components = { Greeter };
    static template = "Root"

    setup() {
        this.state = useState({ name: 'World'});
    }
}


// Script run within the webview itself.
(function () {

    // Application setup
    const env = reactive({ a: 1 }, () => console.log("changed:",arguments));
    mount(Root, document.body, { env, dev: true });

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
        notesContainer.innerText = '';
        console.log('data:',data)
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
                vscode.setState({ text, data });

                return;
        }
    });

    // Webviews are normally torn down when not visible and re-created when they become visible again.
    // State lets us save information across these re-loads
    const state = vscode.getState();
    if (state) {
        updateContent(state.text, state.data);
    }
}());
