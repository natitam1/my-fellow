import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith(".ts")) {
      callback(dirPath);
    }
  });
}

const srcDir = path.join(__dirname, "src");

walkDir(srcDir, (filePath) => {
  const code = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );

  const printer = ts.createPrinter({ removeComments: true });
  const result = printer.printFile(sourceFile);

  // Format the file slightly? Actually we can just write it.
  fs.writeFileSync(filePath, result, "utf8");
  console.log(`Removed comments from: ${filePath}`);
});
