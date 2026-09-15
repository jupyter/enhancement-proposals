// JEP frontmatter stores each PR as a full URL; the listing table renders it
// as plain text. This transform turns those URLs into "#N"-style links.
const PR_URL = /^https:\/\/github\.com\/jupyter\/enhancement-proposals\/pull\/(\d+)$/;

const prLinks = {
  name: "jep-pr-links",
  doc: "Render JEP pull-request URLs as #N links.",
  // Use document stage so MyST's link resolver (which runs at start of project stage)
  // still enriches these links with GitHub hover previews.
  stage: "document",
  plugin: (_opts, utils) => (tree) => {
    for (const cell of utils.selectAll("tableCell", tree)) {
      cell.children = cell.children?.map((node) => {
        const m = node.type === "text" && node.value?.match(PR_URL);
        if (!m) return node;
        return { type: "link", url: node.value, children: [{ type: "text", value: `#${m[1]}` }] };
      });
    }
  },
};

const plugin = { name: "JEP helpers", transforms: [prLinks] };
export default plugin;
