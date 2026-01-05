const vscode = require("vscode");

const tokenTypes = ["xmlAngleOdd", "xmlAngleEven"];
const legend = new vscode.SemanticTokensLegend(tokenTypes, []);

function activate(context) {
  const provider = {
    provideDocumentSemanticTokens(document) {
      const builder = new vscode.SemanticTokensBuilder(legend);

      const text = document.getText();
      let depth = 0;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === "<") {
          const pos = document.positionAt(i);
          depth++;

          builder.push(
            pos.line,
            pos.character,
            1,
            depth % 2 === 1 ? 0 : 1,
            0
          );
        }

        if (char === ">") {
          const pos = document.positionAt(i);

          builder.push(
            pos.line,
            pos.character,
            1,
            depth % 2 === 1 ? 0 : 1,
            0
          );

          depth = Math.max(depth - 1, 0);
        }
      }

      return builder.build();
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: "xml" },
      provider,
      legend
    )
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
