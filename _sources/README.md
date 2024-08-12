# Jupyter Enhancement Proposals

This repository contains enhancement proposals for the Jupyter ecosystem, known as Jupyter Enhancement Proposals or JEPs. Jupyter Enhancement Proposals will be used when presenting changes or additions that affect multiple components of the Jupyter ecosystem OR changes to a single key component.

See [the Enhancement Proposal Guidelines](jupyter-enhancement-proposal-guidelines/jupyter-enhancement-proposal-guidelines.md)
for more information.

Nicely rendered version of the JEPs: <https://jupyter.org/enhancement-proposals>

## Index of JEPs

Below is a list of JEPs that have been Submitted in the past.

If a JEP is in the **Submitted** state, a pull-request is currently open for conversation and comments. If a JEP
is in the **Accepted** state, the JEP has been merged into this repository, and work is
encouraged to commence on the topic.

| Number | Status | Title | PR |
|--------|--------|-------|----|
| 0004   | Withdrawn | New Notebook Format for improved workflow integration | [#04](https://github.com/jupyter/enhancement-proposals/pull/4) |
| 0007   | Withdrawn | Jupyter Extension Generator | [#07](https://github.com/jupyter/enhancement-proposals/pull/07) |
| 0008 | Implemented | [Diffing and Merging Notebooks](08-notebook-diff/notebook-diff.md) | [#08](https://github.com/jupyter/enhancement-proposals/pull/08) |
| 0012 | Implemented | [Kernel Gateway](12-jupyter-kernel-gateway-incorporation/jupyter-kernel-gateway-incorporation.md) | [#12](https://github.com/jupyter/enhancement-proposals/pull/12) |
| 0014 | **Submitted** | Kernel Nanny | [#14](https://github.com/jupyter/enhancement-proposals/pull/14) |
| 0015 | Withdrawn | Layout Namespaces and Discovery | [#15](https://github.com/jupyter/enhancement-proposals/pull/15) |
| 0016 | **Submitted** | Notebook Translation and Localization | [#16](https://github.com/jupyter/enhancement-proposals/pull/16) |
| 0017 | Implemented | [Dashboards Notebook Extension](17-jupyter-dashboards-extension-incorporation/jupyter-dashboards-extension-incorporation.md) | [#17](https://github.com/jupyter/enhancement-proposals/pull/17) |
| 0018 | Implemented | [Declarative Widgets Extension](18-jupyter-declarativewidgets-incorporation/jupyter-declarativewidgets-extension-incorporation.md) | [#18](https://github.com/jupyter/enhancement-proposals/pull/18) |
| 0022 | Implemented | [Move Dashboards Deployment Projects from Incubator to Attic](22-jupyter-dashboards-deployment-attic/jupyter-dashboards-deployment-attic.md) | [#22](https://github.com/jupyter/enhancement-proposals/pull/22) |
| 0023 | **Submitted** | Jupyter Template as Metadata | [#23](https://github.com/jupyter/enhancement-proposals/pull/23) |
| 0024 | **Submitted** | Simplifying Error Reporting in Jupyter Protocol | [#24](https://github.com/jupyter/enhancement-proposals/pull/24) |
| 0025 | Implemented | [Enterprise Gateway](25-jupyter-enterprise-gateway-incorporation/jupyter-enterprise-gateway-incorporation.md) | [#25](https://github.com/jupyter/enhancement-proposals/pull/25) |
| 0026 | Withdrawn | Add Language Server Support to Jupyter Server and jupyterlab-monaco | [#26](https://github.com/jupyter/enhancement-proposals/pull/26) |
| 0028 | Implemented | [Standalone Jupyter Server](28-jupyter-server/jupyter-server.md) | [#28](https://github.com/jupyter/enhancement-proposals/pull/28) |
| 0029 | Implemented | [Jupyter Enhancement Proposal updates](29-jep-process/jep-process.md) | [#29](https://github.com/jupyter/enhancement-proposals/pull/29) |
| 0042 | Implemented | [Voila Incorporation](42-voila-incorporation/voila-incorporation.md) | [#43](https://github.com/jupyter/enhancement-proposals/pull/43) |
| 0044 | Implemented | [Xeus Incorporation](44-xeus-incorporation/xeus-incorporation.md) | [#44](https://github.com/jupyter/enhancement-proposals/pull/44) |
| 0047 | Implemented | [Jupyter Debugger Protocol](47-jupyter-debugger-protocol/jupyter-debugger-protocol.md) | [#47](https://github.com/jupyter/enhancement-proposals/pull/47) |
| 0062 | Implemented | [Cell ID Addition to Notebook Format](62-cell-id/cell-id.md) | [#62](https://github.com/jupyter/enhancement-proposals/pull/62) |
| 0065 | **Accepted** | [Replace PUB socket with XPUB socket](65-jupyter-xpub/jupyter-xpub.md) | [#65](https://github.com/jupyter/enhancement-proposals/pull/65) |
| 0066 | **Accepted** | Kernel Handshaking pattern[](66-jupyter-handshaking/jupyter-handshaking.md) | [#66](https://github.com/jupyter/enhancement-proposals/pull/66) |
| 0072 | **Accepted** | [Language server protocol (LSP)](72-language-server-protocol/language-server-protocol.md) | [#72](https://github.com/jupyter/enhancement-proposals/pull/72) |
| 0079 | Implemented | [Build Jupyter Notebook v7 off of JupyterLab components](79-notebook-v7/notebook-v7.md) | [#79](https://github.com/jupyter/enhancement-proposals/pull/79) |
| 0108 | **Accepted** | [Subdomain and repository for publishing schemas under jupyter.org](108-jupyter-subdomain-for-schemas/jupyter-subdomain-for-schemas.md) | [#108](https://github.com/jupyter/enhancement-proposals/pull/108) |
| 0122 | **Accepted** | [Incorporate Jupyter Book as a subproject](./122-jupyter-book-incorporation/jupyter-book-incorporation.md) | [#123](https://github.com/jupyter/enhancement-proposals/pull/123) |

## How do I submit a JEP?

In order to submit a JEP, first read the [Jupyter Enhancement Proposal Submission Guidelines](jupyter-enhancement-proposal-guidelines/jupyter-enhancement-proposal-guidelines.md) which describes the JEP process.

In addition, read
[the JEP proposal template](jupyter-enhancement-proposal-guidelines/JEP-TEMPLATE.md)
for guidance on the questions you should answer before officially submitting
the JEP.

## Docs hosting

We use a GitHub action to build the documentation with Sphinx and push it to the `gh-pages` branch of the repository.
This is then hosted at `jupyter.org/enhancement-proposals`.

We use a ReadTheDocs build to automatically generate **previews** of the documentation for Pull Requests.
However this is not the publicly-hosted version of the documentation, it is just for PRs.

## Build the enhancement proposal docs

The Enhancement Proposal documentation is structured as a [Sphinx documentation site](https://www.sphinx-doc.org/) that uses a them and configuration inspired by [Jupyter Book](https://jupyterbook.org).

To build the documentation locally, use [the `nox` automation and environment management tool](https://nox.thea.codes/).
Follow these steps:

- Install `nox`:

  ```console
  $ pip install nox
  ```
- Build the docs from the `enhancement-proposals` folder:

  ```console
  $ nox -s docs
  ```

This will automatically install the environment needed to build the documentation, and then place the output HTML in the `_build/html` folder.

To build the documentation with a live reload server, run:

```console
$ nox -s docs-live
```

To manually install and build the documentation with Sphinx, install the requirements in `requirements.txt` and then run `sphinx-build . _build/html`.
