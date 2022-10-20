// @ts-check

// Script run within the webview itself.
(function () {

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
		data.anims.forEach(anim => {
			
			const element = document.createElement('li');
			// element.className = 'note';
			// console.log('found:',word)
			element.innerText = anim.name;
			notesContainer.appendChild(element);

			//array
			const textContent = document.createElement('span');
			textContent.innerText = `${anim.heightVar}`;
			element.appendChild(textContent);
			
			
		});
		return;



		let json;
		try {
			if (!text) {
				text = '{}';
			}
			json = JSON.parse(text);
		} catch {
			notesContainer.style.display = 'none';
			errorContainer.innerText = 'Error: Document is not valid json';
			errorContainer.style.display = '';
			return;
		}
		notesContainer.style.display = '';
		errorContainer.style.display = 'none';

		// Render the scratches
		notesContainer.innerHTML = '';
		for (const note of json.scratches || []) {
			const element = document.createElement('div');
			element.className = 'note';
			notesContainer.appendChild(element);

			const text = document.createElement('div');
			text.className = 'text';
			const textContent = document.createElement('span');
			textContent.innerText = note.text;
			text.appendChild(textContent);
			element.appendChild(text);

			const created = document.createElement('div');
			created.className = 'created';
			created.innerText = new Date(note.created).toUTCString();
			element.appendChild(created);

			const deleteButton = document.createElement('button');
			deleteButton.className = 'delete-button';
			deleteButton.addEventListener('click', () => {
				vscode.postMessage({ type: 'delete', id: note.id, });
			});
			element.appendChild(deleteButton);
		}

		// @ts-ignore
		notesContainer.appendChild(addButtonContainer);
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
