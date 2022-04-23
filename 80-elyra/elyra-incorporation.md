---
title: Elyra Incorporation
authors: LucianoResende
issue-number: 80
pr-number: 42
date-started: "2022-04-09"
type: S - [Standards Track](https://www.python.org/dev/peps/#pep-types-key)
---

# Elyra Incorporation


## Problem

When building large and complex workloads, there is usually a desire to decompose these into smaller and more manageable tasks where the right tools can be used for the right task, but with that also comes the requirement to reassemble and configure each of these tasks into a complete pipeline that can be scheduled or run as one piece.

[Elyra](https://github.com/elyra-ai/elyra) focuses on extending the Jupyter Ecosystem, providing an AI/ML workspace based on JupyterLab with the goal to help data scientists, machine learning engineers, and AI developers through the model development lifecycle complexities.

## Proposed Enhancement

We propose to make the Elyra project officially part of Jupyter, alongside the other projects of the Elyra-AI GitHub organization.

If this incorporation is accepted, Elyra will be relicensed to the BSD-3-Clause license required by Jupyter and the different projects will be modified to reflect this affiliation. Links to the governance documents, code of conduct, and contributing guidelines will be added to the readme and the documentation. The Elyra public meeting calendar will be added to the calendar of public Jupyter video meetings.

Elyra and related projects would remain in the Elyra-AI GitHub organization that would effectively become a Jupyter-affiliated organization.

## Criteria for Incorporation

The [Jupyter Governance - New Subproject Process](https://github.com/jupyter/governance/blob/master/newsubprojects.md) lists the criteria used to evaluate projects for incorporation into the official Jupyter organization. We address each of these criteria below.


### Have an active developer community

**Contributors**

The Elyra project is split across several repositories in the [Elyra-AI](https://github.com/elyra-ai) GitHub organization

 - The main [Elyra](https://github.com/elyra-ai/elyra) repository holds the core package, which had contributions from **48** people, with eight regular contributors.
 - The [Canvas](https://github.com/elyra-ai/canvas) project has **16** contributors.

Other repositories in the organization include "Examples", "Pipeline Editor" and a "Community" repository for global community-related information.

**Growth of the contributor base**

While the project was initially started by IBM, the contributor's list now comprises developers from IBM, Apple, Google, Red Hat, and Cal Poly San Luis Obispo.

We believe that the *multi-stakeholder* nature of the Elyra project is well-suited for the open governance of the Jupyter organization.

### Have an active user community

The Elyra project has a very rapidly growing user base. The initial release of the project was announced in April 2020 as a blog post on IBM Developer website. As of today, (April  15th, 2022), the project has **1301 stars** on GitHub.

The team strives to grow the user and developer communities with the organization of workshops and presentations at various venues. Since the initial announcement, we have presented Elyra at multiple conferences including PyData global, PyData Montreal, PyData São Paulo, and PyLadies Southwest Florida, among others.

We keep finding users at institutions when we visit them or meet them at conferences.

### Demonstrate continued growth and development

The adoption and development of the Elyra project have only been accelerating since the original release, which was announced with an [IBM Developer blog post](https://developer.ibm.com/blogs/open-source-elyra-ai-toolkit-simplifies-data-model-development/) in April 2020.

Handling the growing adoption is one of the main motivations for moving to an open-governance model for the project - and we think that Jupyter is the natural home of the project.

### Integrate well with other official Subprojects.

**Built upon Jupyter Components**

The Elyra project is largely built upon Jupyter subprojects and standards.

 - Elyra provides AI-centric extensions to **JupyterLab**.
 - Elyra natively supports **Jupyter Notebooks** as pipeline tasks.
 - **Jupyter Server** is the default backend.
 - **Jupyter Enterprise Gateway** is used for executing/integrating into remote environments.
 - **Jupyter Hub** is at the foundation for providing Elyra as a self-service service.

In fact, Elyra is more a *distribution* of existing Jupyter components with additional functionality to cover AI/ML requirements.

**Integrating improvements upstream**

The Elyra team, which includes several maintainers of Jupyter subprojects strives to improve the underlying components to enable the Elyra use case instead of having Elyra bolted upon the project or duplicate features.

 - The new Elyra functionality is built as **JupyterLab** extensions.
 - The front-end of Elyra itself reuses several javascript components from JupyterLab, including the theming capability.
 - The Elyra backend was designed as a **Jupyter Server** extension.

The Elyra use case motivated a lot of work in JupyterLab, Jupyter Enterprise Gateway, and Jupyter Server. Besides, the main developers of the projects are maintainers of Jupyter subprojects.

**The Jupyter philosophy: language agnosticism**

Built upon the Jupyter stack, the Elyra project remains **agnostic to the programming language**. This is demonstrated by the ability to support not only multi-language Jupyter Notebooks as well as different scripts as part of the workflows.

### Use solid software engineering with documentation and tests hosted with appropriate technologies

Elyra is continuously tested with GitHub Actions CI.

We also continuously build the documentation of Elyra which is hosted on ReadTheDocs at the URL https://elyra.readthedocs.io.

The documentation provides extensive resources on how to run/deploy Elyra on Docker, or various services such as JupyterHub, binder, Kubernetes flavors on multiple cloud providers or locally, etc.

### Have a well-defined scope.

Elyra is a tool that provides AI-centric extensions to JupyterLab. It aims to help data scientists, machine learning engineers, and AI developer’s through the model development life cycle complexities.

### License

The ELyra project is currently licensed under the Apache License 2.0 and upon incorporation to Jupyter will relicense it to the BSD-3-Clause license.

We use a shared copyright model that enables all contributors to maintain the copyright on their contributions.
