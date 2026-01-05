const vscode = require("vscode");

const tokenTypes = ["xmlAngleOdd", "xmlAngleEven"];
const legend = new vscode.SemanticTokensLegend(tokenTypes, []);

function activate(context) {
  console.log("XML semantic highlighter ACTIVE");

  const provider = {
    provideDocumentSemanticTokens(document) {
      const builder = new vscode.SemanticTokensBuilder(legend);
      const text = document.getText();

      let depth = 0;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === "<") {
          const isClosing = text[i + 1] === "/";
          const isSelfClosing =
            text.slice(i).match(/^<[^>]+\/>/);

          // Closing tag: decrease depth FIRST
          if (isClosing) {
            depth = Math.max(depth - 1, 0);
          }

          const pos = document.positionAt(i);
          const typeIndex = depth % 2 === 0 ? 0 : 1;

          builder.push(
            pos.line,
            pos.character,
            1,
            typeIndex,
            0
          );

          // Opening tag: increase depth AFTER
          if (!isClosing && !isSelfClosing) {
            depth++;
          }
        }

        if (text[i] === ">") {
          const pos = document.positionAt(i);
          const typeIndex = (depth - 1) % 2 === 0 ? 0 : 1;

          builder.push(
            pos.line,
            pos.character,
            1,
            typeIndex,
            0
          );
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

module.exports = { activate, deactivate };
