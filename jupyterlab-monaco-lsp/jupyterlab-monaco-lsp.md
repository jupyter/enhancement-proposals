# Langage server support in  notebook server, jupyterlab, and jupyterlab-monaco

## Problem

The [monaco-editor](https://github.com/Microsoft/monaco-editor) is an
open-source text editor written in Javascript and used in [VS
Code](https://code.visualstudio.com/).

[jupyterlab-monaco](https://github.com/jupyterlab/jupyterlab-monaco) is a JupyterLab
extension that allows users to edit documents using monaco-editor.

monaco-editor ships with language features for
TypeScript, JavaScript, CSS, LESS, SCSS, JSON, HTML. In order to support other
languages (e.g. Python), it must connect to a language server (e.g. Python language
server).

## Proposed Enhancement

- Create a notebook server extension to allow clients to connect with language servers
  - Provide HTTP interface for clients to communicate via websockets
    - e.g. `/lsp/python/` or `/lsp/r/`.
  - Add a new set of classes to
    [@jupyterlab/services](https://github.com/jupyterlab/jupyterlab/tree/master/packages/services)
    that provide a client-side interface to those endpoints
- Integrate monaco-editor in jupyterlab-monaco with classes in @jupyterlab/services

## Notes

### Libraries

- [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient):
  NPM module to connect Monaco editor with language servers

### Reference implementations

- [WIP] changes to import monaco-lsp code into jupyterlab-monaco ([jupyterlab-monaco#12](https://github.com/jupyterlab/jupyterlab-monaco/pull/12))
- [Theia](https://github.com/theia-ide/theia)
- [Gitpod](https://github.com/gitpod-io/gitpod)
- [R-Brain](https://github.com/R-Brain/jupyterlab/blob/master/packages/monaco-extension/src/index.ts)

### Documentation

- [Language servers](https://langserver.org/#implementations-server)
