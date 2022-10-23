import * as vscode from 'vscode';
import { CatScratchEditorProvider } from './parolaSpriteEditor';

export function activate(context: vscode.ExtensionContext) {
	const openWithCommand = vscode.commands.registerCommand("parola.spriteEditor.openFile", () => {
		const activeTabInput = vscode.window.tabGroups.activeTabGroup.activeTab?.input as { [key: string]: any, uri: vscode.Uri | undefined };
		if (activeTabInput.uri) {
			vscode.commands.executeCommand("vscode.openWith", activeTabInput.uri, "parola.spriteEditor");
		}
	});
	// Register our custom editor providers
	context.subscriptions.push(openWithCommand);
	context.subscriptions.push(CatScratchEditorProvider.register(context));
}
