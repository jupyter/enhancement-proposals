// MyST's csv-table directive has a ":file:" option upstream, but it is commented
// out in mystmd 1.10.1, so a CSV file cannot be rendered as a table with it.
// Using "{include}" instead does not help: MyST parses the included CSV as
// markdown and collapses the whole file into a single paragraph.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

function projectRoot(start) {
  let dir = start;
  while (!existsSync(join(dir, "myst.yml"))) {
    const parent = dirname(dir);
    if (parent === dir) return start;
    dir = parent;
  }
  return dir;
}

const csvTableFile = {
  name: "csv-table-file",
  doc: "Render a CSV file as a table.",
  arg: {
    type: String,
    doc: "Path to the CSV file, relative to the directory that holds myst.yml.",
  },
  options: {
    "header-rows": {
      type: Number,
      doc: "Number of leading rows of the file to use as the table header. Defaults to 0.",
    },
  },
  run(data, vfile, ctx) {
    const start = vfile?.path ? dirname(vfile.path) : process.cwd();
    const csv = readFileSync(resolve(projectRoot(start), data.arg), "utf8")
      .replace(/\r\n/g, "\n")
      .trim();
    // Use more backticks than the data holds, so a cell containing code cannot
    // close the directive early.
    const backticks = [...csv.matchAll(/`+/g)].map((match) => match[0].length);
    const fence = "`".repeat(Math.max(2, ...backticks) + 1);
    const headerRows = data.options?.["header-rows"] ?? 0;
    const source = `${fence}{csv-table}\n:header-rows: ${headerRows}\n${csv}\n${fence}`;
    return ctx.parseMyst(source, 0).children ?? [];
  },
};

const plugin = { name: "CSV table from a file", directives: [csvTableFile] };
export default plugin;
