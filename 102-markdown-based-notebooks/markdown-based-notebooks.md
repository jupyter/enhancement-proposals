---
title: Official support for Markdown-based notebooks
authors: Nicolas M. Thiéry @nthiery, Steve Purves @stevejpurves, Andrey Lisin @avli
contributors: Jason Grout @jasongrout, Sylvain Corlay @sylvain.corlay, Vladimir Lagunov @vladimirlagunov
issue-number: xxx
pr-number: 102
date-started: 2023-03-01
---

# Official support for Markdown-based notebooks

## Summary

This JEP proposes an alternative Markdown-based serialization syntax for Jupyter notebooks, with file
extension `.nb.md`, to be adopted as an official standard by the Jupyter community, and describes steps to make it
supported by most tools in the ecosystem.

It is meant as one of several steps towards offering flexibility in how to represent notebooks to simultaneously:

- support an extensive range of use cases with various balances of priority between conciseness and readability and
  lossless conversion to and from `.ipynb` files;
- foster standardization by being opinionated on some of the low-level choices.

## Motivation

The [Jupyter notebook format](https://nbformat.readthedocs.io/en/latest/) is currently defined by a data structure, a
serialization syntax (JSON), and a syntax for rich text cells (some variant of Markdown). This format has tremendously
supported the community in having a lingua franca to exchange computational narratives. Yet over the years, the
community has recurrently expressed the need for:

1. The simplicity of the mental model for end users: "A notebook is just a glorified Markdown file".
2. Human readability and editability of the plain file.
3. Natural interoperability with version control systems
   and [software forges](https://en.wikipedia.org/wiki/Forge_(software)) (GitHub, GitLab, etc), e.g. readable diffs and
   merges, quick online edition with forges' editor.
4. Interoperability with standard text tools to browse, edit, power-edit, author, mass search and replace, tags, macros,
   etc.
5. Interoperability with existing notebook formats.
6. Efficient handling of large data blobs like
   outputs.
7. Streaming - enable progressive loading of a notebook, where a partially received file remains usable/viewable (this
   is not possible in JSON).
8. Natural integration in larger bodies of contents: e.g. books built out of a combination of plain Markdown files and
   notebooks.
9. Complex IDEs like PyCharm or Visual Studio Code and complex text editors like Vim or Emacs are optimized for working
   with text files.

Meanwhile, there is a long track record of using text-based notebooks, both outside the Jupyter ecosystem (
narrative-centric: R Markdown, org-mode, and others;
code-centric: [MATLAB](https://www.mathworks.com/products/matlab.html), [Visual Studio Code](https://code.visualstudio.com/docs/python/jupyter-support-py#_jupyter-code-cells), [Spyder](https://docs.spyder-ide.org/3/editor.html#defining-code-cells), [PyCharm and DataSpell](https://www.jetbrains.com/help/pycharm/matplotlib-support.html#console)),
and within the Jupyter ecosystem, notably with [Jupytext](https://jupytext.readthedocs.io/en/latest/)
and [Jupyter Book](https://jupyterbook.org/). The wide adoption of such solutions highlights their suitability in many
use cases.

Though the existing text-based formats go a long way toward supporting the need of the community, they share a
significant pain-point: the inability to represent outputs and attachments.

Other pain points are:

- Jupytext needs to hack its way in the Jupyter(Lab) content manager to support opening and saving text notebooks
  seamlessly; this also takes some configuration steps for the user;
- most other tools in the ecosystem (e.g. nbconvert, nbgrader) can't read or write text notebooks, forcing the users to
  convert their notebooks back and forth using `.ipynb` format;
- there are many text notebook formats or implementations out there, each of which brings a combination of coupled
  choices between distinct aspects: which syntax is used for serialization syntax, which syntax is used for rich text,
  which information can be or is stored, etc. Proper decoupling between these aspects to maximize flexibility together
  with opinionated standardization on the basics would benefit the community by covering a variety of use cases;
- the content-type discovery currently relies on
  a combination of looking at the extension and at the metadata inside the file.

## Guide-level explanation

This JEP provides a standard syntax for representing a Jupyter notebook as a Markdown file. We call such a file a
Markdown Jupyter notebook. Here is a minimal Markdown Jupyter notebook that could typically be authored manually:

    ---
    metadata:
        kernelspec:
          display_name: Python 3 (ipykernel)
          language: python
          name: python3
    ---
    # A minimal Markdown Jupyter notebook

    This is a text cell

    ```{jupyter.code-cell}
    1+1
    ```

    This is another text cell

    +++

    And another one

Note that this file contains only the minimal information required to reconstruct a valid notebook. In particular, there
are no cell IDs, outputs, execution counts.

Here is a Markdown Jupyter notebook containing a lossless representation of a full-featured Jupyter notebook with (cell)
metadata, outputs, attachments, etc. As this example is long form it has been
posted [in this example repository](https://github.com/stevejpurves/jep-text-based-format-example) along with the
accompanying `.ipynb` file.

## Reference-level explanation

### Design goals

The proposed syntax was designed to satisfy the following requirements:

- The syntax should allow for lossless serialization of any Jupyter
  Notebook data structure. This includes:
    - notebook metadata;
    - text and code cells, with metadata and parameters (e.g. cell IDs);
    - outputs, with mime-times, metadata, etc;
    - cell attachments;
    - widget states.
- The serialized notebook should be a valid Markdown file.
- Should aim for reasonable human readability and editability: text, code, raw cells, and metadata should be
  human-readable and editable. Large chunks of data like output cells or attachments should be as non-obtrusive as
  possible.
- Should aim for reasonable support by version control.
- Should aim for reasonable rendering by typical Markdown viewers.
- Should be similar to existing popular formats; ideally should be one of the existing popular formats.

In addition, the following are good to have:

- Enable reading similar notebook formats to ease the transition.
- Enable third-party extensions to implement and declare alternative serialization syntaxes so that most tools natively
  support them. This helps with interoperability: think of a third-party extension to treat R Markdown notebooks as
  native Jupyter notebooks.

### Serialization syntax description

This section describes the proposed syntax for serializing Jupyter notebooks in Markdown. Then, we detail the steps
needed for this syntax to be supported by most tools in the Jupyter ecosystem.

#### Top-level structure

A Jupyter Markdown notebook consists of an optional metadata header followed by Markdown representing a sequence of text
cells, code cells, outputs, raw cells, etc.

#### Metadata header

The notebook metadata is represented by a YAML 1.2.2 header at the top of the document, surrounded by `---` delimiters:

```yaml=
    ---
    metadata:
      kernel_info:
        name: the name of the kernel
      language_info:
        name: the programming language of the kernel
        version: the version of the language
        codemirror_mode: The name of the codemirror mode to use [optional]
    nbformat: 4
    nbformat_minor: 0
    ---
```

The metadata structure mirrors that of
the [Jupyter Notebook format](https://nbformat.readthedocs.io/en/latest/format_description.html).

#### Code cells

Jupyter Markdown notebooks use fenced code blocks with backticks to represent code cells (like Pandoc, Jupytext
Markdown, Myst Markdown):

    ```{jupyter.code-cell}
    print('hi')
    ```

where the [info string](https://spec.commonmark.org/0.30/#info-string) `{jupyter.code-cell}` specifies that this is a
code cell.

Cell parameters `execution_count` and `id` must be encoded as such when specified:

    ```{jupyter.code-cell execution_count=N id=...}
    print('hi')
    ```

Cell metadata, if present, can be represented by an optional YAML 1.2.2 block between `---` delimiters at the beginning
of the code block (same as Myst Markdown):

    ```{jupyter.code-cell execution_count=42 id=1234abcd}
    ---
    key:
      more: true
    tags: [hide-output, show-input]
    ---
    print('hi')
    ```

Alternatively, non-nested metadata may be represented using the [*short-hand option
syntax*](https://myst-parser.readthedocs.io/en/latest/syntax/roles-and-directives.html#parameterizing-directives) (same
as Myst Markdown):

    ```{jupyter.code-cell}
    :tags: [hide-output, show-input]

    print('hi')
    ```

Finally, metadata may also be represented by a single line JSON blob in the info-string:

    ```{jupyter.code-cell metadata={json blob}}
    :tags: [hide-output, show-input]

    print(Hello!")
    ```

For compatibility with the Jupytext and Myst notebook formats, parsers may accept `{code-cell}` instead
of `{jupyter.code-cell}`.

#### Code cell outputs

Once executed, a code cell may have zero or more outputs. When stored, the output(s) of the code cell appear(s)
immediately after the code cell. The syntax resembles that of a code cell but also provides the different types of
output specified in the `.ipynb` format: `stream`, `error`, `execute_result`, and `display_data`.

All types include the `output_type` field which has been included as a `command` on the first line of the directive.

##### `output_type: stream`

The JSON format of a `stream` output includes two additional fields `name` and `text`. The value of the `text` field can
potentially be long and reproduced in the body of the directive to improve readability.

````
# .ipynb
```
{
    "output_type": "stream",
    "name": "stdout",
    "text": [
        "This is the stream content that was in the *text* field\n",
        "of the original json output\n"
    ]
}
```
````

````
# text-based .md
```{jupyter.output output_type=stream}
---
name: stdout
---
This is the stream content that was in the *text* field
of the original json output
```
````

##### `output_type: error`

The JSON format of an `error` output includes 3 additional fields `ename`, `evalue` and `traceback`. The value of
the `traceback` field is reproduced in the body of the directive to improve readbility.

````
# .ipynb
{
    "output_type": "error",
    "ename": "ReferenceError",
    "evalue": "x is unknown",
    "traceback": [
        "The *traceback* field rendered as content\n",
    ]
}

# text-based .md
```{jupyter.output output_type=error}
---
ename: ReferenceError
evalue: x is a unknown
---
The *traceback* field rendered as content
```
````

##### `output_type: display_data` and `output_type: execute_result`

These two output types are both "MIME bundles" and share a similar structure, with the output data being stored in
the `data` field. Cell outputs of type `execute_result` contain an additional `execute_count` field.

Consider for example these two cell outputs as represented in the original JSON-based `.ipynb` format:

```
{
    "output_type": "display_data",
    "metadata": {
        some-metadata-key: "some-value"
    },
    "data": {
        "text/html": "<div>Some HTML Content</div>",
        "image/png": "base-64-encoded-image"
    }
},
...,
{
    "output_type": "execute_result",
    "execute_count": 2,
    "metadata": {
        some-metadata-key: "some-value"
    },
    "data": {
        "text/html": "<div>Some HTML Content</div>",
        "image/png": "base-64-encoded-image"
    }
}
```

These output cells are represented as such in Markdown:

````
```{jupyter.output output_type=display_data}
---
some_metadata_key: some-value
---
{ "text/html": "<div>Some HTML Content</div>" }
{ "image/png": "base-64-encoded-image" }
```

```{jupyter.output output_type=execute_result execute_count=42}
---
some_metadata_key: 'some-value'
---
{ "text/html": "<div>Some HTML Content</div>" }
{ "image/png": "base-64-encoded-image" }
```
````

Explanations:

- Cell metadata, if present, is represented as a top YAML block of the directive.
- The MIME type keyed entries from the output's `data` attribute are represented as individual objects, consistent with
  JSON lines format, each MIME type occupying a separate line and serialized without any newline formatting to improve
  the behavior of text-based diffs.  
  Organization of the MIME type data into separate objects on single lines improves readability and ensures that each
  line is a valid self-contained JSON object. On parsing the directive, a **_merge_** operation should be performed to
  construct a single `data` object containing all `mimetype` keys.
- Other cell attributes, like `output_type` or `execute_count` for `execute_result` cell outputs, are represented in the
  info-string of the directive.

#### Raw cells

Raw cells are represented in a similar fashion:

    ```{jupyter.raw-cell}
    ---
    raw_mimetype: text/html
    ---
    <b>Bold text<b>
    ```

with the same syntax for parameters and metadata as for code-cells.

For compatibility with the Jupytext and Myst notebook formats, parsers may accept `{raw-cell}` instead
of `{jupyter.raw-cell}`.

#### Text cells

Implicitly, the chunks of Markdown around and in between code/output/raw cells are considered Markdown cells: thus,
the whole document behaves as a single flowing Markdown document, interspersed with code/output/raw cells (same as MyST
Markdown).

    A text cell
    ```{jupyter.code-cell}
    1 + 1
    ```
    
    Another text cell
    ```{jupyter.code-cell}
    1+2
    ```

The chunks of Markdown may be broken up into several text cells by means of a [**thematic break
**](https://spec.commonmark.org/0.30/#thematic-breaks) `+++` (as
in [MyST Markdown](https://myst-tools.org/docs/spec/blocks#block-breaks)):

    A text cell
    +++
    Another text cell

Text cell metadata can be provided by mean of a YAML 1.2.2 block, shorthand notation, or a single line JSON
representation:

    +++ { "slide": true }
    A text cell
    +++
    ---
    foo: bar
    ---
    Another text cell
    +++
    :foo: bar
    A third text cell

Note that the leading thematic break does not introduce a leading empty text cell.

#### Cell attachments

Cell attachments are embeded as fenced code blocks in the Markdown of the cell:

    Here is some text.

    And now ![an attachment](image.png).

    ```{jupyter.attachment}
    :label: image.png
    {json blurb}
    ```

For multiple attachments, use several fenced code blocks.

### Implementation

1. Generalize the `nbformat` specification to accept several serialization syntaxes.
2. Implement an extension mechanism in `nbformat` so that:
    - extensions can register a pair of serializers/deserializers attached to a file extension;
    - `nbformat` chooses accordingly the appropriate serializers / deserializers.
3. Implement a serializer/deserializer for Jupyter Markdown notebooks. Make this implementation a dependency
   of `nbformat`, and register it in nbformat for extension `.nb.md`.
4. As needed, design a similar plugin mechanism for JavaScript-based tools (e.g. JupyterLab front-end).
5. Let the Jupyter server serve `.nb.md` files with the `application/x-ipynb+md` MIME type and document that the new
   MIME type in
   the [Jupyter documentation](https://docs.jupyter.org/en/latest/reference/mimetype.html?#custom-mimetypes-used-in-jupyter-and-ipython-projects).
6. Review existing tools to check whether further adaptation is needed (e.g. they may have hard coded assumptions that a
   notebook file has the `.ipynb` extension). Interesting candidate: Pandoc.
7. Encourage Jupytext to be refactored to use the above extension mechanism(s).

## Rationale and alternatives

## Prior art

### Some narrative-centric text based notebook formats

- [R Markdown](https://bookdown.org/yihui/rmarkdown/)
- [Quarto](https://quarto.org/)
- [MyST Markdown notebooks](https://myst-nb.readthedocs.io/en/v0.9.0/use/markdown.html). An example of a notebook
  converted to MyST Notebook cab be seen [here](https://gist.github.com/stevejpurves/8c6d129c7bb8b0dacb8460f0e42582c2)
- `org-mode` notebooks: look for a notebook in https://orgmode.org/features.html
  and [this discussion](https://news.ycombinator.com/item?id=16842786);
- ReST: e.g. all the Sage documentation was written in ReST and could be converted to Sage notebooks. And later, in a
  lossy way to Jupyter notebooks with [rst2ipynb](https://pypi.org/project/rst2ipynb/) (lossy because ReST and Sage
  notebooks allowed for cells nested anywhere in the document structure).

In the Jupyter ecosystem, [Jupytext](https://jupytext.readthedocs.io/) lets users convert notebooks between different
formats, including `.ipynb` and most of the aforementioned text-based formats. See the documentation, which nicely
recaps
the [formats](https://jupytext.readthedocs.io/en/latest/formats.html).

### Some code-centric notebook formats

In these formats, the notebook is a code file that can be run as-is.

Existing formats that use `# %%` as a cell delimiter:

* [JupyText percent format](https://jupytext.readthedocs.io/en/latest/formats.html#the-percent-format)
* [Visual Studio Code](https://code.visualstudio.com/docs/python/jupyter-support-py#_jupyter-code-cells)
* [Spyder](https://docs.spyder-ide.org/3/editor.html#defining-code-cells)
* [PyCharm and DataSpell](https://www.jetbrains.com/help/pycharm/matplotlib-support.html#console)

Implementations that use other delimiters:

* [Jupytext light format](https://jupytext.readthedocs.io/en/latest/formats.html#the-light-format) use `# +`in Python
  and Julia script

None of these formats describe any way to encode outputs, metadata, or text cells.

### Use Cases

#### Teaching Scenario

Course material tends to target non Jupyter experts, be narrative-heavy, iteratively and collaboratively authored as
part of a larger body of material, and bear lightweight computations. Thereby, in this use case, the priority is on
human readability and writability, conciseness, statelessness, and compatibility with version control, text tools and
other material (typically written in Markdown). Outputs and widget states are typically best discarded, also to save
space. Metadata is typically either handcrafted for dedicated tools (slides, grading tools, ...) or best discarded. This
is orthogonal to this JEP, but rich text support is a must.

#### Authoring in notebooks

- Users who author manuscripts, papers, and technical documents using Jupyter tend to produce notebooks that are
  predominantly text but contain outputs and code relevant to the document's content or publication.
- Authors prefer to utilize notebooks as they allow results, figures, tables, and other computational outputs to be
  reproduced as an integral part of the document.
- Authors work interactively and collaboratively, moving a draft manuscript toward a final polished article in steps
  including drafting, peer review, commenting, and revision.
- Authors and their collaborators may be scientists or researchers in any scientific or technical field and typically
  can have various technical abilities.
- Although the iterative nature of document preparation lends itself to a versioning process, the use of a version
  control system for sharing and collaboration may not be the norm, and collaboration typically occurs by sharing via
  mechanisms like cloud storage, email, etc.
- Code relevant to the subject of the document may be limited (e.g. to key algorithms), so most code cells will likely
  be hidden in the final paper, and authors may work to minimize the amount of code directly included in the notebook.
- Authoring scientific papers and technical manuscripts requires the use of rich document features such as rich text,
  cross-referencing, citations, equations, and figures with captions and numbering. Where these are not directly
  supported, authors may contrive to replicate them in the document manually.
- Notebooks will be used as the content for a publication. This either involves the creation of a PDF that links to a
  published version of the notebook via Digital Object Identifier on a service such as Zenodo or directly publishing the
  notebook in HTML form.

#### Frontend serialization scenario

- A user in JupyterLab saves a notebook “as text”, e.g. by setting its name to `foo.nb.md`.
- JupyterLab then always saves `foo.nb.md` as a text file.
- Better version control and diffing.
- This text file is completely self-contained and 100% compatible with `.ipynb`. It can be shared as an `.ipynb` file.
  Outputs that can be expensive (e.g. GPU/HPC) or hard to reproduce (e.g. complex software stacks) are preserved. Widget
  states that may depend on non-reproducible user interaction are also preserved.
- Opportunity for better stream-based loading.

## Frequently Asked Questions

> What's the rationale for the support of lossless serialization of any notebook, when serializing large data chunks
> like outputs or attachments will anyway harm the readability of the file?

A successor to the current notebook format should allow current users to use the new format flawlessly.

Most of the current userbase creates their content in the notebook user interfaces, and picking one format over another
in the preferences should not harm the ability to use existing extensions. If the new format does not allow to preserve
the current behavior, we will lose the confidence of our userbase.

> Why support several syntaxes for metadata?

- The one-line JSON blob syntax is compact and unobtrusive.
- The YAML block syntax is human-readable and editable.
- The shorthand colon syntax is human-readable, editable, and very compact at the price of not supporting nested
  metadata.

Enabling all three syntaxes supports both use cases where metadata is small and should be readable and editable **and**
use cases where one wants to preserve metadata while making it as unobtrusive as possible. It also enables importing
files that use either convention, helping with interoperability and migration.

> How to validate the plain text format notebooks, especialy against the emerging ideas around including JSON schemas
> for validation?

Serialize to JSON and validate the JSON.

> What happens if people insert text (or any whitespace) between a cell's input and output blocks(s)?

The output block(s) will still be recognised provided only whitespace characters inserted between.

> How do we split a large body of Markdown into several Markdown cells (in other words, can we have cell breaks )?

Use thematic breaks `+++`. These allow individual Markdown cell boundaries to be idenitified and can include metadata
enabling a lossless roundtrip between text-based and `ipynb` format.

> How to store large widget states? With the current format, widgets states will be stored in the notebook metadata,
> that is in the YAML header which will soon become very large. Should widget states be moved to outputs instead?

Large widget state is notebook metadata. The requirement on back and forth convertibility gives an indication of where
this goes. Also, we cannot store it in widget output because outputs only hold views of widget state, and the same
widget can be displayed multiple times.

## Unresolved questions

The following part of the design are expected to be resolved through the JEP process before it gets merged:

- Final pinning of the syntax of the info-string for fenced
  cells: `{jupyter.code-cell}`, `{code-cell}`, `{jupyter:code-cell}`, `{.code}`
    - having a namespaced directive is a good idea;
    - one can optionally prefix the info-string with a language name, as in `python {jupyter.code-cell}`, as a hint for
      syntax highlighting in Markdown viewers and editors. This language name is purely advisory for Markdown editors,
      and carries no semantic meaning for Jupyter.
- How far do we want to support closely related formats for interoperability and ease of transition?
- The final decision about file extension `.nb.md`.
- Currently, all the examples above start a notebook with some Markdown content, without an initial thematic break.
  This assumes that any initial content implicitly defined a Markdown cell. However, what happens where the first cell
  in the notebook is a code cell? and if there are newlines or whitspace between the notebook frontmatter block and the
  first code cell? a Markdown cell would not be inserted here? how would someone insert an empty Markdown cell as the
  first cell in the notebook? by inserting an explicit thematic break?

### Other open questions

Would there be possible programming languages that conflict with the metadata syntax for cells? For example, a
programming language that has syntax like `:variable: value`?

## Future possibilities

The following issues and lines or actions are **out of scope** for this JEP and could be addressed in the future
independently of the solution(s) that comes out of this JEP:

- Markdown syntax within rich text cells: enrich the current Markdown flavor? Support alternative flavors like MyST? The
  meaning of "Markdown" in terms of jupyter's support for that within th format is the subject of another JEP,
  see [this issue to track that discussion](https://github.com/jupyter/enhancement-proposals/issues/98).
- Syntax for output previews.
- Enable indirect storage of outputs and attachments: external.
  URL, [content-id url](https://www.rfc-editor.org/rfc/rfc2111) to another part of the same multipart mime bundle,
  reference to some attachment at the end of the notebook file. See
  this [document](https://hackmd.io/jxU8UzZASwax8MfVsGlDcw) discussing
  a potential JEP.
- Encourage tooling or configuration thereof to be opiniated about how certain pieces of information should be handled
  upon saving, to support various use case. E.g.
    - specify that outputs and cell ids shall be discarded when readability and conciseness is the priority;
    - specify that outputs should be stored at the end;
    - specify that metadata should be stored concisely as one-line json blobs.
- After some time and experimentation, define official notebook metadata specifying how these pieces of information
  should be handled upon saving.
- Standardize ways to provide directory-wide/project-wide notebook metadata (typical use cases: specify that
  outputs shall be discarded for all notebooks in a directory; define project-wide RISE configuration, etc).
