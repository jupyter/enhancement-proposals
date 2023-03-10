---
title: Specify the Markdown cell’s markdown flavor
authors: Frederic Collonval, Steve Purves and Vincent Vankrunkelsven
issue-number: 98
pr-number: 99
date-started: 2023-03-10
---

# Summary

This is a proposition to add a new key to markdown cells defining precisely the flavor of markdown used in the cell source. The associated rendered content should be stored for compatibility with the tooling ecosystem. As a side effect, it forces us to clarify the current default markdown flavor that should be used as fallback when a client does not support the specified flavor.

The focus of this JEP is primarily on describing current behaviour.

# Motivation

<!-- Why are we doing this? What use cases does it support? What is the expected outcome? -->

The flavor of markdown cells in the notebook are currently not defined, it is not possible to describe precisely how markdown will be rendered or which syntax is supported.

Currently it might be mostly GFM.
Better define the MD flavor to set user expectations properly
Enable rendering of other markdown flavors by extension
Understand what the fallback would be

For reference, the current Markdown flavor is described in the documentation as:

> Markdown cells are used for body-text, and contain markdown, as defined in [GitHub-flavored markdown](https://help.github.com/articles/github-flavored-markdown), and implemented in [marked](https://github.com/chjj/marked).  
https://nbformat.readthedocs.io/en/latest/format_description.html#markdown-cells

> The Notebook webapp supports GitHub flavored markdown.  
https://jupyter-notebook.readthedocs.io/en/stable/examples/Notebook/Working%20With%20Markdown%20Cells.html#GitHub-flavored-markdown

Those descriptions are inaccurate especially since GitHub is quite active to extend the rendered Markdown; see for example [Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams).

# Guide-level explanation

<!-- Explain the proposal as if it was already implemented and you were
explaining it to another community member. That generally means:

- Introducing new named concepts.
- Adding examples for how this proposal affects people's experience.
- Explaining how others should *think* about the feature, and how it should impact the experience using Jupyter tools. It should explain the impact as concretely as possible.
- If applicable, provide sample error messages, deprecation warnings, or migration guidance.
- If applicable, describe the differences between teaching this to existing Jupyter members and new Jupyter members.

For implementation-oriented JEPs, this section should focus on how other Jupyter
developers should think about the change, and give examples of its concrete impact. For policy JEPs, this section should provide an example-driven introduction to the policy, and explain its impact in concrete terms. -->

This proposal will introduce a new key `mimetype` to the markdown cell. It is not mandatory to allow backward compatibility. And therefore, this proposal is introducing a _fallback value_ (TBD).

Then the markdown cell can have a single `output` storing the rendered content as a mime bundle. If for example the mime bundle is providing text/html rendered content, a tool like nbconvert could inject that html directly when converting the notebook to HTML.

Due to the markdown fragmentation, a side effect of this JEP is the need to define a fallback Markdown flavor. From what is out there, the best path seen is to create and maintain an integration test suite for the fallback supported syntax. This will clarify the supported syntax and the associated rendered HTML. This is similar to what [CommonMark](https://spec.commonmark.org/) and [GFM](https://github.github.com/gfm/) are defining.
A starting point would be that [pull request](https://github.com/jupyterlab/benchmarks/pull/97). But moving it into [nbformat](https://github.com/jupyter/nbformat) repository. The open-source tools will need to be aligned - in particular the question of aligning Python based renderers like nbconvert and web based renderers like JupyterLab/Notebook must be tackled?


# Reference-level explanation

<!-- This is the technical portion of the JEP. Explain the design in
sufficient detail that:

- Its interaction with other features is clear.
- It is reasonably clear how the feature would be implemented.
- Corner cases are dissected by example.

The section should return to the examples given in the previous section, and explain more fully how the detailed proposal makes those examples work. -->

**nbformat 4.5** 

```json
"markdown_cell": {
    "description": "Notebook markdown cell.",
    "type": "object",
    "additionalProperties": false,
    "required": ["id", "cell_type", "metadata", "source"],
    "properties": {
        "id": { "$ref": "#/definitions/cell_id" },
        "cell_type": {
            "description": "String identifying the type of cell.",
            "enum": ["markdown"]
        },
        "metadata": { … },
        "attachments": { "$ref": "#/definitions/misc/attachments" },
        "source": { "$ref": "#/definitions/misc/source" }
    }
},
```

**proposal**

```diff
  "markdown_cell": {
      "description": "Notebook markdown cell.",
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "cell_type", "metadata", "source"],
      "properties": {
          "id": { "$ref": "#/definitions/cell_id" },
          "cell_type": {
              "description": "String identifying the type of cell.",
              "enum": ["markdown"]
          },
          "metadata": { … },
          "attachments": { "$ref": "#/definitions/misc/attachments" },
          "source": { "$ref": "#/definitions/misc/source" },
+         "mimetype": {
+             "type": "string",
+             "pattern": "^text/markdown"
+         },
+         "output": {
+             "description": "Rendered Markdown source",
+             "type": "object",
+             "additionalProperties": false,
+             "required": ["data", "metadata"],
+             "properties": {
+                 "data": { "$ref": "#/definitions/misc/mimebundle" },
+                 "metadata": { "$ref": "#/definitions/misc/output_metadata" }
+             }
+         }
      }
  },
```

The structure of the mime type must follow the standard defined in [RFC7763](https://www.rfc-editor.org/rfc/rfc7763): `text/markdown;variant=<variant name>` (variant parameter is optional).
If the key is not defined, its value should be considered as the fallback: _TBD_.

> The best candidate seen as fallback value is CommonMark or Jupyter flavor. GFM is not seen as a good candidate as it evolves without us able to catch up and by breaking behavior; e.g. the mermaidjs broke the rendering of a mermaidjs code block and the [current proposal for admonition](https://github.com/community/community/discussions/16925) will break the current rendering.

The `output` key will have the same data and metadata keys as the notebook output of type `display_data`. The `output` key is fully optional and should be considered or ignored at the consumer discretion. For example, a client like JupyterLab may want to render all the Markdown cells discarding the output. But a tool like nbconvert may use it when transforming a notebook to another format.

References:
[RFC7763 text/markdown Media Type](https://www.rfc-editor.org/rfc/rfc7763)
[RFC7764 Guidance on Markdown: Design Philosophies, Stability Strategies, and Select Registrations](https://www.rfc-editor.org/rfc/rfc7764)


# Rationale and alternatives

<!--
- Why is this choice the best in the space of possible designs?
- What other designs have been considered and what is the rationale for not choosing them?
- What is the impact of not doing this?
-->

Specifying the markdown format should leverage the concept already used in the notebook document. It feels therefore natural to choose a mimetype to specify the source format. The notion of transient output exists already for code cell. Leveraging a similar structure for markdown cell sounds like the natural choice.

Adding this feature to the notebook file has the risk of increasing incompatibility between clients. But this has already started as client extensions extending or replacing the markdown renderer in JupyterLab already exists:
- [jupyterlab-myst](https://github.com/executablebooks/jupyterlab-myst): MyST functionality in Jupyter Lab
- [jupyterlab-markup](https://github.com/agoose77/jupyterlab-markup): JupyterLab extension to enable markdown-it rendering, with support for markdown-it plugins 

They result in an uncontrolled document when shared with users lacking those extensions. Explicit specification of the source flavor will allow all clients to be informed about potential incompatibility - to be dealt with at their discretion. The optional rendered output will ease clients to have nice fallback.
That said, we should constrain the input to be Markdown flavors to limit incompatibility to poorly rendered text fragments (like MyST admonition in CommonMark). If we were to allow any mimetype, clients could set totally different markup languages that will even break other clients.


# Prior art

<!--
Discuss prior art, both the good and the bad, in relation to this proposal.
A few examples of what this can include are:

- Does this feature exist in other tools or ecosystems, and what experience have their community had?
- For community proposals: Is this done by some other community and what were their experiences with it?
- For other teams: What lessons can we learn from what other communities have done here?
- Papers: Are there any published papers or great posts that discuss this? If you have some relevant papers to refer to, this can serve as a more detailed theoretical background.

This section is intended to encourage you as an author to think about the lessons from other languages, provide readers of your JEP with a fuller picture.
If there is no prior art, that is fine - your ideas are interesting to us whether they are brand new or if it is an adaptation from other languages.
-->

Unknown to the authors

# Unresolved questions

<!--
- What parts of the design do you expect to resolve through the JEP process before this gets merged?
- What related issues do you consider out of scope for this JEP that could be addressed in the future independently of the solution that comes out of this JEP?
-->

What are the current markdown rendering capabilities? And can we start a consistent way of determining and tracking those? 
* i.e. an empirical/ integration test approach, based on testing actual features for a given frontend or renderer and reporting on this (e.g. https://caniuse.com/?search=serviceworkers)
* A starting point: the JupyterLab benchmark [pull request](https://github.com/jupyterlab/benchmarks/pull/97).

There is a single `mimetype` registered for markdown [text/markdown](https://www.iana.org/assignments/media-types/text/markdown) and the registration points to `net.daringfireball.markdown` this is classed as "original".

The ecosystem of extended markdown flavors does not seem to utilize mimetypes to identify flavors even though the official registration for text/markdown provides for an optional variant parameter. 

From the official spec:

_Optional parameters:_

* _variant: An optional identifier of the specific Markdown variant
    that the author intended. **The value serves as a "hint" to the
    recipient, meaning that the recipient MAY interpret the Markdown
    as that variant, but is under no obligation to do so.** When
    omitted, there is no hint; the interpretation is entirely up to
    the receiver and context. This identifier is plain US-ASCII and
    case-insensitive. To promote interoperability, identifiers can be
    registered in the registry defined in Section 6. If a receiver
    does not recognize the variant identifier, the receiver MAY
    present the identifier to a user to inform him or her of it._

The resulting fully specified `mimetype` would be `text/markdown;variant=GFM`

The [RFC7763](https://www.rfc-editor.org/rfc/rfc7763.html) specifies a [registry provided by IANA](https://www.iana.org/assignments/markdown-variants/markdown-variants.xhtml).

Current registry includes:

| Identifier | Name | Expiration Date | References |
| --- | --- | --- | --- |
| [Original](https://www.iana.org/assignments/markdown-variants/Original) | Markdown | [[RFC7763](https://www.iana.org/go/rfc7763)] |
| [MultiMarkdown](https://www.iana.org/assignments/markdown-variants/MultiMarkdown) | MultiMarkdown | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [GFM](https://www.iana.org/assignments/markdown-variants/GFM) | GitHub Flavored Markdown | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [pandoc](https://www.iana.org/assignments/markdown-variants/pandoc) | Pandoc | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [Fountain](https://www.iana.org/assignments/markdown-variants/Fountain) | Fountain | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [CommonMark](https://www.iana.org/assignments/markdown-variants/CommonMark) | CommonMark | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [kramdown-rfc2629](https://www.iana.org/assignments/markdown-variants/kramdown-rfc2629) | Markdown for RFCs | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [rfc7328](https://www.iana.org/assignments/markdown-variants/rfc7328) | Pandoc2rfc | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [Extra](https://www.iana.org/assignments/markdown-variants/Extra) | Markdown Extra | [[RFC7764](https://www.iana.org/go/rfc7764)] |
| [SSW](https://www.iana.org/assignments/markdown-variants/SSW) | Markdown for SSW | [[Paulina_Ciupak](https://www.iana.org/assignments/markdown-variants/markdown-variants.xhtml#Paulina_Ciupak)] |


So as a formal mechanism exists to specify a particular markdown flavor this could be used in a `mimetype` key to identify the flavor in use in the notebook.

Open questions: 

- Should the default be `text/markdown`? And the fallback be Original Markdown?
- Should clients update the mimetype key to match what they are rendering/supporting after editing?
- Should frontend only change a markdown `mimetype`  in an edited cell, and only change that cell?
- Is it ok for a notebook to have cells in a different format?
- Should it be specified as document level key and interpreted as a **hint**, i.e. a frontend serializing the notebook could write a mimetype into the notebook to communicate how clients **should try** to interpret markdown cells and then make best efforts to do so (similar to the kernel information).
- Should there be a single output or an array of outputs to align better with code cells? In the second case:
  - what to do if there are more than 1 output
  - should we force the output type to a single value? And if yes, the most appropriate seems [display_data](https://github.com/jupyter/nbformat/blob/16b53251aabf472ad9406ddb1f78b0421c014eeb/nbformat/v4/nbformat.v4.5.schema.json#L331)


# Future possibilities

<!--
Think about what the natural extension and evolution of your proposal would
be and how it would affect the Jupyter community at-large. Try to use this section as a tool to more fully consider all possible
interactions with the project and language in your proposal.
Also consider how the this all fits into the roadmap for the project
and of the relevant sub-team.

This is also a good place to "dump ideas", if they are out of scope for the
JEP you are writing but otherwise related.

If you have tried and cannot think of any future possibilities,
you may simply state that you cannot think of anything.

Note that having something written down in the future-possibilities section
is not a reason to accept the current or a future JEP; such notes should be
in the section on motivation or rationale in this or subsequent JEPs.
The section merely provides additional information.
-->

This JEP is seen as an intermediate step to improve the current schema in a backward compatible way preparing the ground for a new format fully oriented toward generic cell types based on mime type (discussion is ongoing; see that [issue](https://github.com/jupyter/enhancement-proposals/issues/95)).
