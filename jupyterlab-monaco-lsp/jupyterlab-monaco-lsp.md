# Add language server (LSP) support to notebook server/jupyter-server and jupyterlab-monaco

## Problem

> There is an `m * n` complexity problem of providing a high-level of support for any programming language in any editor, IDE, or client endpoint (e.g. jupyterlab, jupyter notebook, nteract).

The [Language Server protocol](https://langserver.org) is a protocol for programming languages to provide code intelligence such as _auto complete_, _go to definition_, and _find all references_ to client applications such as code editors (like [VS Code](https://code.visualstudio.com/)) and code managers (like [Sourcegraph](https://sourcegraph.com) and Sourcegraph for Github). 

Once a language server is created for a programming language (e.g. [Python language server](https://github.com/palantir/python-language-server)), it becomes an `m + n` problem because each client application must only build an integration with the server (e.g. [Python for VS Code](https://code.visualstudio.com/docs/languages/python)) vs. building the code intelligence parts and the integration. 

The overall complaint is that the JupyterLab/Jupyter Notebooks code editing experience is missing many of the luxuries of modern code editors and IDEs, like static code analysis for features like autocomplete for unexecuted code, type checking, linting, formatting, go to definition, and find all references. For a popular review of these complaints, see slides 60-71 from [I Don't Like Notebooks](https://docs.google.com/presentation/d/1n2RlMdmv1p25Xy5thJUhkKGvjtV-dkAIsUXP-AL4ffI/edit#slide=id.g3cb1319227_1_33).

## Proposed Enhancement

The [monaco-editor](https://github.com/Microsoft/monaco-editor) is an
open-source text editor written in Javascript and used in [VS
Code](https://code.visualstudio.com/).

[jupyterlab-monaco](https://github.com/jupyterlab/jupyterlab-monaco) is a JupyterLab
extension that allows users to edit documents using monaco-editor.

monaco-editor ships with language features for
TypeScript, JavaScript, CSS, LESS, SCSS, JSON, HTML. In order to support other
languages (e.g. Python), it must connect to a language server (e.g. Python language
server).

## TODO

- [ ] Create a notebook server extension to allow clients to connect with language servers
  - Provide HTTP interface for clients to communicate with language servers via websockets
    - e.g. `/lsp/python/` or `/lsp/r/`.
- [ ] Add a new set of classes to
    [@jupyterlab/services](https://github.com/jupyterlab/jupyterlab/tree/master/packages/services)
    that provide a client-side interface to those endpoints?
- Add LSP support to monaco-editor in jupyterlab-monaco 
  - Using classes from @jupyterlab/services?

## Notes

### Libraries

- [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient):
  NPM module to connect Monaco editor with language servers

### Reference implementations

- [WIP] changes to import monaco-lsp code into jupyterlab-monaco ([jupyterlab-monaco#12](https://github.com/jupyterlab/jupyterlab-monaco/pull/12))
- [Theia](https://github.com/theia-ide/theia)
- [Gitpod](https://github.com/gitpod-io/gitpod)
- [R-Brain](https://github.com/R-Brain/jupyterlab/blob/master/packages/monaco-extension/src/index.ts)

### References

- [Language servers](https://langserver.org/#implementations-server)
- [Python language server](https://github.com/palantir/python-language-server)
- [monaco-editor](https://github.com/Microsoft/monaco-editor)
