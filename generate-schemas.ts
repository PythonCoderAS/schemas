import { type TSchema } from "@sinclair/typebox";
import { Schema, Validator } from "jsonschema";
import { Dir } from "node:fs";
import { opendir, mkdir, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import jsonSchema from "./json-schema.json" with { type: "json" };

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
  const validator = new Validator();
  for await (const { path } of walk(`${currentFileDir}/schemas`)) {
    const pathBaseName = basename(path);
    if (pathBaseName === "schema.js") {
      const outPath = path.replace(`${currentFileDir}/schemas/`, "");
      const outDir = dirname(outPath);
      await mkdir(`${schemaOutDir}/${outDir}`, { recursive: true });
      const schema: TSchema = (await import(`./schemas/${outPath}`)).default;
      const title = outDir.replace("/schema.js", "");
      const extendedSchema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: `https://pythoncoderas.github.io/schemas/${outDir}/schema.json`,
        title,
        description: `Schema for ${title}`,
        ...schema,
      };
      // TODO: Fix this once upstream fixes their types
      if (
        !validator.validate(extendedSchema, jsonSchema as unknown as Schema)
          .valid
      ) {
        throw new Error(`Schema for ${outPath} is invalid.`);
      }
      const schemaStr = JSON.stringify(extendedSchema, null, 2);
      await writeFile(`${schemaOutDir}/${outDir}/schema.json`, schemaStr);
    }
  }
}

main().catch(console.error);
