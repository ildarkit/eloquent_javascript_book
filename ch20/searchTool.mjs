import { readFile, stat, readdir } from "node:fs/promises";
import { join } from "node:path";

async function testFilePath(pattern, path) {
    try {
        let files = await getFiles(path);
        if (files.length > 0) await listFiles(pattern, files);
        else {
            let content = await readFile(path, {encoding: "utf8"});
            return pattern.test(content);
        }
    } catch (err) {
        console.error(err.message);
    }
    return false;
}

async function getFiles(path) {
    let fullPath = []; 
    let stats = await stat(path);
    if (stats.isDirectory()) fullPath = await readdir(path);
    fullPath = fullPath.map(file => join(path, file));
    return fullPath;
}

async function listFiles(re, files) {
    let results = await Promise.all(
        files.map(async filePath => await testFilePath(re, filePath)));
    results.forEach((res, i) => {if (res) console.log(files[i]);});
}

async function run() {
    if (process.argv.length > 3)
        await listFiles(
            new RegExp(process.argv[2]),
            process.argv.slice(3));
}

await run();