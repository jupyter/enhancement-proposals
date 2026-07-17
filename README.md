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

```{searchfilter} .myst-listing-item
```

```{listing}
:path: [0-9]*/*.md
:columns: JEP,status,title,date,PR
:sort: date-desc
:limit: 100
```

### Withdrawn and Submitted JEPs

These JEPs were never merged, so each title links to its pull request.

```{listing}
:source: yaml
:path: withdrawn-jeps.yml
:columns: JEP,status,title
:sort: JEP-asc
```

## How do I submit a JEP?

In order to submit a JEP, first read the [Jupyter Enhancement Proposal Submission Guidelines](jupyter-enhancement-proposal-guidelines/jupyter-enhancement-proposal-guidelines.md) which describes the JEP process.

In addition, read
[the JEP proposal template](jupyter-enhancement-proposal-guidelines/JEP-TEMPLATE.md)
for guidance on the questions you should answer before officially submitting
the JEP.

## Docs hosting

We use a GitHub action to build the documentation with MyST and push it to the `gh-pages` branch of the repository.
This is then hosted at `jupyter.org/enhancement-proposals`.

We use a ReadTheDocs build to automatically generate **previews** of the documentation for Pull Requests.
However this is not the publicly-hosted version of the documentation, it is just for PRs.

## Build the enhancement proposal docs

The site is built with [MyST](https://mystmd.org), driven by [the `nox` automation tool](https://nox.thea.codes/) (which uses [`uv`](https://docs.astral.sh/uv/) for fast installs when available):

```console
$ pip install nox
$ nox -s docs        # build HTML into _build/html
$ nox -s docs-live   # live-reload server
```

Or run MyST directly: `pip install mystmd && myst start`.
