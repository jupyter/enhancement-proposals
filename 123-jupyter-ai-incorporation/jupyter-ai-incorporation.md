---
title: Jupyter AI Incorporation
authors: Zsailer (zachsailer@gmail.com)
issue-number: XXX
pr-number: XXX
date-started: "2026-04-15"
---

# Jupyter AI Incorporation

## Summary

We propose incorporating **Jupyter AI** as an official Jupyter sub-project. Jupyter AI is a collection of modular tools that bring AI collaboration into Jupyter environments — chat interfaces, model integrations, personas, tool-use frameworks, and MCP support.

Most of this work already lives in the [`jupyter-ai-contrib`](https://github.com/jupyter-ai-contrib) GitHub organization, which would be renamed to [`jupyter-ai-project`](https://github.com/jupyter-ai-project) and become the official home of the sub-project. Two existing repositories — [`jupyterlab/jupyter-ai`](https://github.com/jupyterlab/jupyter-ai) and [`jupyterlite/ai`](https://github.com/jupyterlite/ai) — would also transfer into this organization.

## Motivation

AI-assisted workflows are rapidly becoming part of how people write code, analyze data, and learn. Jupyter's interactive, multi-language, web-based model makes it a great place for this kind of work, and the community has been investing heavily here over the past couple of years.

The problem is that this investment is scattered. The main `jupyter-ai` package lives under the `jupyterlab` org. JupyterLite's AI support is in `jupyterlite/ai`. And a growing collection of modular AI extensions — chat commands, personas, routing, MCP integration — lives in `jupyter-ai-contrib`, which isn't an official Jupyter organization at all.

This makes it harder than it should be to coordinate strategy, share components across projects, and give contributors a clear place to show up. A dedicated sub-project would fix that by:

1. Bringing AI-related Jupyter work under a single governance structure.
2. Enabling coordinated development across the stack, from server-side model integrations to frontend experiences.
3. Giving contributors a clear, official home for AI work in Jupyter.
4. Making Jupyter's AI story more visible and coherent to the broader community.

The `jupyter-ai-contrib` organization already has an active contributor base, a set of stable repositories, weekly community meetings (Wednesdays at 8:30 AM Pacific), and a governance council with members from three organizations. This proposal formalizes what's already happening.

## Reference-level explanation

We propose to:

1. **Rename** the `jupyter-ai-contrib` GitHub organization to [`jupyter-ai-project`](https://github.com/jupyter-ai-project).
2. **Transfer `jupyterlab/jupyter-ai`** and **`jupyterlite/ai`** into `jupyter-ai-project` (see [Repositories](#repositories) below).
3. **List `jupyter-ai-project`** as the home of a Jupyter sub-project called "Jupyter AI".
4. **Define a Steering Council** (see [Governance](#governance)).
5. **Create a team-compass** at `jupyter-ai-project/team-compass`.
6. **Add the weekly meeting** (Wednesdays, 8:30 AM Pacific) to the Jupyter public meeting calendar.
7. **Update transferred repositories** with links to Jupyter governance documents, code of conduct, and contributing guidelines.

(governance)=
### Governance

The following people currently govern the `jupyter-ai-contrib` organization and would form the inaugural Steering Council (alphabetical order):

- **Brian Granger** ([@ellisonbg](https://github.com/ellisonbg))
- **David Qiu** ([@dlqqq](https://github.com/dlqqq))
- **Jeremy Tuloup** ([@jtpio](https://github.com/jtpio))
- **Piyush Jain** ([@3coins](https://github.com/3coins))
- **Zach Sailer** ([@Zsailer](https://github.com/Zsailer))

This group has been governing `jupyter-ai-contrib` using a consensus-seeking model aligned with the [Jupyter Decision Making Guide](https://jupyter.org/governance/decision_making.html).

(repositories)=
### Repositories

Two repositories would transfer from other Jupyter organizations into `jupyter-ai-project`:

| Repository | Current Home | Description |
|---|---|---|
| `jupyter-ai` | `jupyterlab/jupyter-ai` | The Jupyter AI chat interface for JupyterLab |
| `ai` | `jupyterlite/ai` | AI capabilities for JupyterLite |

The existing repositories in `jupyter-ai-contrib` that are ready for production use would carry over when the organization is renamed to `jupyter-ai-project`. The council will decide which specific repositories transfer as part of the incorporation process.

We intend to keep `jupyter-ai-contrib` around as a community incubator — a place where experimental extensions and early-stage ideas can develop without the overhead of official Jupyter governance. As projects mature and prove useful, the council can promote them into the official `jupyter-ai-project` organization. This gives the community a low-friction way to contribute new ideas while keeping the official sub-project focused on stable, well-maintained tools.

## Rationale and alternatives

### Why a dedicated sub-project?

AI work in Jupyter now spans server extensions, frontend plugins, model integrations, protocol implementations, persona systems, and tool-use frameworks. That's a lot of surface area to coordinate, and it doesn't fit neatly into any existing sub-project. The `jupyter-ai-contrib` organization was set up specifically to bring this work together, and its governance was designed from the start to follow Jupyter's principles. Making it official is the natural next step.

### Why move `jupyter-ai` out of JupyterLab?

`jupyter-ai` started as a JupyterLab extension, but it has grown beyond that. It now includes server-side components, model integrations, and infrastructure that other projects depend on. Putting it alongside the rest of the AI work makes it easier to develop these pieces together and keeps the JupyterLab sub-project focused on the frontend platform.

### Why move `jupyterlite/ai`?

Same logic — consolidating AI work under one roof means shared architecture, consistent APIs, and a better experience for contributors who want to work across deployment targets.

### What happens if we don't do this?

AI work stays fragmented. `jupyter-ai-contrib` remains unofficial. It's harder to attract contributors, harder to coordinate, and harder to tell a clear story about AI in Jupyter.

## Unresolved questions

- **Organization name:** We'd like to use `jupyter-ai-project` (since `jupyter-ai` is taken on GitHub). Another option is `jupyter-artificial-intelligence`, though that's quite long. We'd welcome community input here.
- **SSC representation:** We'll need to determine who represents Jupyter AI on the Software Steering Council as part of the incorporation process.
- **Transfer logistics:** The timing and process for moving `jupyter-ai` from `jupyterlab` and `ai` from `jupyterlite` will need coordination with those sub-project councils.

## Criteria for Incorporation

The [Jupyter Governance - New Subproject Process](https://github.com/jupyter/governance/blob/master/newsubprojects.md) lists criteria for evaluating projects. Here's how we stack up.

### Active developer community

The `jupyter-ai-contrib` organization has contributors across multiple repositories, a five-person council from three organizations, and weekly community meetings every Wednesday. The `jupyter-ai` project itself has over 100 contributors.

### Active user community

`jupyter-ai` is one of the most popular JupyterLab extensions, widely used in academic, research, and enterprise settings. The newer modular extensions in `jupyter-ai-contrib` are gaining adoption as people build on the composable architecture.

### Continued growth and development

The `jupyter-ai-contrib` organization was created in 2025 and has grown quickly. Development is active, with regular releases and new projects being added. AI-assisted computing is one of the fastest-moving areas in the Jupyter ecosystem right now.

### Integration with other sub-projects

Jupyter AI builds on Jupyter Server for backend services, provides extensions for JupyterLab and JupyterLite, uses Jupyter protocols for kernel communication, implements MCP for external tool access, and follows Jupyter packaging and plugin conventions throughout.

### Solid engineering practices

Repositories use CI, automated tests, and published documentation. Stable repos are held to a high bar for reliability before being marked production-ready.

### Well-defined scope

Jupyter AI covers tools and extensions for human-AI collaboration in Jupyter — model integrations, chat, personas, tool-use, and protocol implementations like MCP. It does not cover general-purpose ML libraries or training infrastructure.

### License

All repositories use the BSD 3-Clause license, consistent with the rest of Jupyter. We use a shared copyright model so contributors retain copyright on their work.
