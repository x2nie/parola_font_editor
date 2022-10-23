import * as vscode from 'vscode';
import { getNonce } from './util';

interface SpriteConfig {
	lineIndex: number,
	value : number,
}
interface LineData {
	lineIndex: number,
	lineText: string,
}
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

	private static readonly viewType = 'parola.spriteEditor';
	private lastLine = -1;

	// private static readonly scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];

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
				// text: document.getText(),
				// vsdoc: document,
				data: getData(),
				// version: document.version,
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
				// case 'add':
				// 	this.addNewScratch(document);
				// 	return;

				case 'line-delete':
					this.deleteDocumentLine(document, e.index, e.config);
					return;

				case 'line-modified':
					this.updatetDocumentLine(document, e.index, e.data, e.config);
					return;

				case 'lines-modified':
					this.updateDocumentLines(document, e.data, e.config);
					return;

				case 'line-insert':
					this.insertDocumentLine(document, e.index, e.data, e.config);
					return;

				case 'firstload':
					updateWebview();
					return;
				case 'new-anim':
					this.newAnim(document);
					return;
			}
		});

		// updateWebview();
	}

	private updateAnimConfig(document: vscode.TextDocument, edit: vscode.WorkspaceEdit, config:SpriteConfig) {
		console.log('config:', config);
		const textLine = document.lineAt(config.lineIndex);
		const regEx = /=\s*([0-9a-fA-Fx]+)\s*;/;
		const line = textLine.text.replace(regEx, `= ${config.value};`);

		edit.replace(
			document.uri,
			textLine.range,
			line
		);
	}

	private updatetDocumentLine(document: vscode.TextDocument, lineIndex: number, line:string, config:SpriteConfig|undefined) {
		// console.log('line-edit 1:', `"${line}"`, '@', lineIndex);
		const edit = new vscode.WorkspaceEdit();
		const range = document.lineAt(lineIndex).range;
		// console.log('line-edit:', typeof line, '@', lineIndex, 'range:',range);

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			// new vscode.Range(lineIndex, 0, lineIndex, range.character),
			range,
			// JSON.stringify(json, null, 2)
			line
		);

		if(config){
			this.updateAnimConfig(document, edit, config);
		}

		return vscode.workspace.applyEdit(edit);
	}

	private updateDocumentLines(document: vscode.TextDocument, data: LineData[], config:SpriteConfig|undefined) {
		console.log('lines-edit data:', `"${data}"`, '@', config);
		const edit = new vscode.WorkspaceEdit();

		data.forEach(lineData => {

			const range = document.lineAt(lineData.lineIndex).range;
			edit.replace(
				document.uri,
				range,
				lineData.lineText
			);
		});

		if(config){
			this.updateAnimConfig(document, edit, config);
		}

		return vscode.workspace.applyEdit(edit);
	}
	private insertDocumentLine(document: vscode.TextDocument, lineIndex: number, line:string, config:SpriteConfig|undefined) {
		// console.log('line-insert 1:', `"${line}"`, '@', lineIndex);
		const edit = new vscode.WorkspaceEdit();
		const range = document.lineAt(lineIndex).range.start;
		// console.log('line-insert:', typeof line, '@', lineIndex, 'range:',range);
		const eol = document.eol == 1 ? '\n' : '\r\n';

		edit.insert(
			document.uri,
			range,
			line + eol,
		);

		if(config){
			this.updateAnimConfig(document, edit, config);
		}

		return vscode.workspace.applyEdit(edit);
	}

	private deleteDocumentLine(document: vscode.TextDocument, lineIndex: number, config:SpriteConfig|undefined) {
		// console.log('line-insert 1:', `"${line}"`, '@', lineIndex);
		const edit = new vscode.WorkspaceEdit();
		const range = document.lineAt(lineIndex).rangeIncludingLineBreak;

		edit.delete(
			document.uri,
			range,
		);

		if(config){
			this.updateAnimConfig(document, edit, config);
		}

		return vscode.workspace.applyEdit(edit);
	}

	private async newAnim(document: vscode.TextDocument) {
		const spriteName = await vscode.window.showInputBox({
            placeHolder: 'pacman3',
            prompt: 'Name',
            validateInput: (val) => {
                if (val==='') {
                    return 'Please enter a name for the app!';
                }
                if (val.indexOf(' ') >=0) {
                    return 'Name cannot contains space';
                }
            },
        });
		if(spriteName==undefined) return;

		const edit = new vscode.WorkspaceEdit();
		const range = document.lineAt(this.lastLine + 1).range.start;
		// console.log('line-insert:', typeof line, '@', lineIndex, 'range:',range);
		const NAME = spriteName?.toUpperCase();
		const eol = document.eol == 1 ? '\n' : '\r\n';
		const lines = [
			'',
			`const uint8_t F_${NAME} = 1;`,
			`const uint8_t W_${NAME} = 8;`,
			`const uint8_t PROGMEM ${spriteName}[F_${NAME} * W_${NAME}] =  // ${spriteName}`,
			`{`,
			`	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,`,
			`};${eol}`,
			
		];

		edit.insert(
			document.uri,
			range,
			lines.join(eol),
		);

		return vscode.workspace.applyEdit(edit);
	}


	private getDataForWebview(vsdoc: vscode.TextDocument): object {
		
		
		const text = vsdoc.getText();
		let regEx = /const\s+uint8_t\s+PROGMEM\s+(\w+)\s*\[(\w+)\s*\*\s*(\w+)\]/g;
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
			this.lastLine = i;

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
				framesVar: word[2],
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
			const startPos = vsdoc.positionAt(word.index);
			// line = lines[startPos.line+2];
			const avar = {
				name: word[1],
				lineIndex: startPos.line,
				value: word[2],
			};
			vars[word[1]] = avar;

			//array
		}

		return {
			vars,
			anims,
			codes,
			version: vsdoc.version
		};
	}



	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'parolaSprite.js'));
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

				<title>Parola Editor</title>
			</head>
			<body>
				<div class="hidden-assets">
					<canvas id="small-pat-on"></canvas>
					<canvas id="small-pat-off"></canvas>
					<canvas id="big-pat-on"></canvas>
					<canvas id="big-pat-off"></canvas>
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
	// private addNewScratch(document: vscode.TextDocument) {
	// 	const json = this.getDocumentAsJson(document);
	// 	const character = CatScratchEditorProvider.scratchCharacters[Math.floor(Math.random() * CatScratchEditorProvider.scratchCharacters.length)];
	// 	json.scratches = [
	// 		...(Array.isArray(json.scratches) ? json.scratches : []),
	// 		{
	// 			id: getNonce(),
	// 			text: character,
	// 			created: Date.now(),
	// 		}
	// 	];

	// 	return this.updateTextDocument(document, json);
	// }

	/**
	 * Delete an existing scratch from a document.
	 */
	// private deleteScratch(document: vscode.TextDocument, id: string) {
	// 	const json = this.getDocumentAsJson(document);
	// 	if (!Array.isArray(json.scratches)) {
	// 		return;
	// 	}

	// 	json.scratches = json.scratches.filter((note: any) => note.id !== id);

	// 	return this.updateTextDocument(document, json);
	// }

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
