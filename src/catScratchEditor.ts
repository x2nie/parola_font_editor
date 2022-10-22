import * as vscode from 'vscode';
import { getNonce } from './util';

/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class CatScratchEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new CatScratchEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(CatScratchEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'catCustoms.catScratch';

	private static readonly scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		const getData = () => {
			return this.getDataForWebview(document);
		};

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
				// vsdoc: document,
				data: getData(),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				console.log('DOC-changed-by outer. e:', e);
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'add':
					this.addNewScratch(document);
					return;

				case 'delete':
					this.deleteScratch(document, e.id);
					return;

				case 'line-modified':
					this.updatetDocumentLine(document, e.index, e.data);
					return;

				case 'firstload':
					updateWebview();
					return;
			}
		});

		// updateWebview();
	}

	private updatetDocumentLine(document: vscode.TextDocument, lineIndex: number, line:string) {
		const edit = new vscode.WorkspaceEdit();
		const range = document.lineAt(lineIndex).range;
		console.log('line-edit:', line, '@', lineIndex, 'range:',range);

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			// new vscode.Range(lineIndex, 0, lineIndex, range.character),
			range,
			// JSON.stringify(json, null, 2)
			line
		);

		return vscode.workspace.applyEdit(edit);
	}

	private getDataForWebview(vsdoc: vscode.TextDocument): object {
		
		
		const text = vsdoc.getText();
		let regEx = /const\s+uint8_t\s+PROGMEM\s(\w+)\s*\[(\w+)\s*\*\s*(\w+)\]/g;
		// console.log('vsdoc:',vsdoc)
		const eol = vsdoc.eol == 1 ? '\n' : '\r\n';
		const lines = text.split(eol);
		const linesCount = lines.length;

		const getMatrix = (lineIndex:number):{lineIndex:number, line:string}[] => {
			const ret:{lineIndex:number, line:string}[] = [];

			let i = lineIndex;
			while(i < linesCount && !lines[i].startsWith('}')) {
				if (lines[i].startsWith('{')) {
					i++;
					continue;
				}
				const lineText = {
					lineIndex: i,
					line: lines[i]
				};
				ret.push(lineText);
				i++;
			}

			return ret;
		};

		const anims : Array<object> = [];
		const codes : {[key:number]:string} ={};
		let word;
		while ((word = regEx.exec(text))) {
			const startPos = vsdoc.positionAt(word.index);
			// line = lines[startPos.line+2];
			const data = getMatrix(startPos.line +1);
			data.forEach(code => {
				codes[code.lineIndex] = code.line;
			});
			const ani = {
				name: word[1],
				heightVar: word[2],
				widthVar: word[3],
				data,
			};
			anims.push(ani);

			//array
		}

		// VARS
		const vars : {[key:string] : any} = {};
		regEx = /const\s+uint8_t\s+(\w+)\s*=\s*([0-9a-fA-Fx]+)\s*;/g;
		while ((word = regEx.exec(text))) {
			// console.log('var:',word);
			// const startPos = vsdoc.positionAt(word.index);
			// line = lines[startPos.line+2];
			const ani = {
				name: word[1],
				heightVar: word[2],
				widthVar: word[3],
			};
			vars[word[1]] = word[2];

			//array
		}

		return {
			vars,
			anims,
			codes,
		};
	}



	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'catScratch.js'));
		// const owlUri = webview.asWebviewUri(vscode.Uri.joinPath(
		// 	this.context.extensionUri, 'media', 'owl.js'));
		const owlUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'owl.iife.runtime.js'));
		const owlTemplateUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'templates', 'templates.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'reset.css'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'vscode.css'));

		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'catScratch.css'));

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />

				<title>Cat Scratch</title>
			</head>
			<body>
				<div class="hidden-assets">
					<canvas id="small-pat-on"></canvas>
					<canvas id="small-pat-off"></canvas>
					<canvas id="big-pat-on"></canvas>
					<canvas id="big-pat-off"></canvas>
				</div>
					<div class="add-button">
						<button>Scratch!</button>
					</div>
				
				<script nonce="${nonce}" src="${owlUri}"></script>
				<script nonce="${nonce}" src="${owlTemplateUri}"></script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	/**
	 * Add a new scratch to the current document.
	 */
	private addNewScratch(document: vscode.TextDocument) {
		const json = this.getDocumentAsJson(document);
		const character = CatScratchEditorProvider.scratchCharacters[Math.floor(Math.random() * CatScratchEditorProvider.scratchCharacters.length)];
		json.scratches = [
			...(Array.isArray(json.scratches) ? json.scratches : []),
			{
				id: getNonce(),
				text: character,
				created: Date.now(),
			}
		];

		return this.updateTextDocument(document, json);
	}

	/**
	 * Delete an existing scratch from a document.
	 */
	private deleteScratch(document: vscode.TextDocument, id: string) {
		const json = this.getDocumentAsJson(document);
		if (!Array.isArray(json.scratches)) {
			return;
		}

		json.scratches = json.scratches.filter((note: any) => note.id !== id);

		return this.updateTextDocument(document, json);
	}

	/**
	 * Try to get a current document as json text.
	 */
	private getDocumentAsJson(document: vscode.TextDocument): any {
		const text = document.getText();
		if (text.trim().length === 0) {
			return {};
		}

		try {
			return JSON.parse(text);
		} catch {
			throw new Error('Could not get document as json. Content is not valid json');
		}
	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			JSON.stringify(json, null, 2));

		return vscode.workspace.applyEdit(edit);
	}
}
