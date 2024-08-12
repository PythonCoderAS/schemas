import { type TSchema } from "@sinclair/typebox";
import { Dir } from "node:fs";
import { opendir, mkdir, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";

interface DirEntry {
  path: string;
  entry: Dir;
}

const currentFileDir = new URL(".", import.meta.url).pathname;
const schemaOutDir = "./out/schemas";

async function* walk(startDirectory: string): AsyncGenerator<DirEntry> {
  const dir = await opendir(startDirectory);
  for await (const dirent of dir) {
    const path = `${startDirectory}/${dirent.name}`;
    if (dirent.isDirectory()) {
      yield* walk(path);
    } else {
      yield {
        path,
        entry: dir,
      };
    }
  }
}

async function main() {
  for await (const { path } of walk(`${currentFileDir}/schemas`)) {
    const pathBaseName = basename(path);
    if (pathBaseName === "schema.js") {
      const outPath = path.replace(`${currentFileDir}/schemas/`, "");
      const outDir = dirname(outPath);
      await mkdir(`${schemaOutDir}/${outDir}`, { recursive: true });
      const schema: TSchema = (await import(`./schemas/${outPath}`)).default;
      const schemaStr = JSON.stringify(
        { $schema: "http://json-schema.org/draft-07/schema", ...schema },
        null,
        2
      );
      await writeFile(`${schemaOutDir}/${outDir}/schema.json`, schemaStr);
    }
  }
}

main().catch(console.error);
