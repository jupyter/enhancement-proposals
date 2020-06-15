---
title: Voilà Incorporation
authors: SylvainCorlay
issue-number: XX
pr-number: 42
date-started: "2019-10-14"
type: S - [Standards Track](https://www.python.org/dev/peps/#pep-types-key)
---

# Voilà Incorporation

## Problem

Interactive notebooks are not the best communication tool for *all* audiences. While they have proven invaluable to provide a *narrative* alongside the source, effectively implementing the *literate programming* concept, they are not ideal to address **non-technical readers** who may be put off by the presence of code cells or the need to run the notebook to see results. Besides, following the order of the code often results in the most interesting content to be at the end of the document.

Another challenge with sharing notebooks is the **security model**. How can we offer the interactivity of a notebook making use of e.g. Jupyter widgets without allowing arbitrary code execution by the end-user?

The goal of the [Voilà](https://github.com/voila-dashboards/voila) project is to solve these challenges by providing tools to transform interactive notebooks into standalone web applications.

## Proposed Enhancement

We propose to make the Voilà project officially part of Jupyter, alongside the other projects of the voila-dashboards organization.

If this incorporation is accepted, the different projects will be modified to reflect this affiliation. Links to the governance documents, code of conduct, and contributing guidelines will be added to the readme and the documentation. The voilà public meeting calendar will be added to the calendar of public Jupyter video meetings.

Voilà and related projects would remain in the voila-dashboards organization that would effectively become a Jupyter-affiliated GitHub organization.

## Criteria for Incorporation

The [Jupyter Governance - New Subproject Process](https://github.com/jupyter/governance/blob/master/newsubprojects.md) lists the criteria used to evaluate projects for incorporation into the official Jupyter organization. We address each of these criteria below.

### Have an active developer community

**Contributors**

The Voilà project is split across several repositories in the [voila-dashboards](https://github.com/voila-dashboards/) GitHub organization

 - The main [Voilà](https://github.com/voila-dashboards/voila) repository holds the core package, which had contributions from **25** people, with five regular contributors.
 - The [Gallery](https://github.com/voila-dashboards/gallery) project has **10** contributors.
 - We also have a [Compass](https://voila-dashboards.github.io/) project that holds the calendar for the weekly public team meeting and the minutes of previous meetings.

Other repositories in the organization include "Voilà templates", and various utilities for authoring plugins for the Voilà project. We should mention the notable [voila-vuetify](https://github.com/voila-dashboards/voila-vuetify) project which holds a vuetifyjs-based template that produces applications suitable to mobile devices.

**Growth of the contributor base**

While the project was initially started by QuantStack, the team now comprises developers from Bloomberg, UC Berkeley, JP Morgan, and Cal Poly San Luis Obispo. OVH has been supportive of the project by kindly providing the free hosting of the gallery on their infrastructure.

We believe that the *multi-stakeholder* nature of the Voilà project is well-suited for the Jupyter organization.

### Have an active user community

The Voilà project has a very rapidly growing user base. The initial release of the project was announced on June 2019. As of today, (October 14th, 2019), the project has **1223 stars** on GitHub.

The team strives to grow the user and developer communities with the organization of workshops and presentations at various venues. Since the initial announcement, we have presented Voilà at PyConDE, PyData Paris, Scipy Austin, EuroScipy, GeoPython, and CICM.

We keep finding users at institutions when we visit them or meet them at conferences.

### Demonstrate continued growth and development

The adoption and development of the Voilà project have only been accelerating since the original release, which was announced with a [medium post](https://blog.jupyter.org/and-voil%C3%A0-f6a2c08a4a93) in June 2019.

Handling the growing adoption is one of the main motivations for moving to an open-governance model for the project - and we think that Jupyter is the natural home of the project.

### Integrate well with other official Subprojects.

**Built upon Jupyter Components**

The Voilà project is largely built upon Jupyter subprojects and standards.

 - The standard **notebook file format** is the main entry point to voilà.
 - **nbconvert** is used for the conversion to progressively-rendered HTML.
 - naturally, we use **jupyter_client** for handling the execution of notebook cells
 - **jupyter_server** is the default backend.
 - **jupyterhub** is at the foundation of the voila-gallery project.
 - **jupyterlab** components (mime renderers, input and output areas) are used in the front-end implementation.
 - **ipywidgets** and custom jupyter widget libraries such as bqplot, ipyvolume, ipyleaflets provide the bulk of the interactivity of Voilà applications.

In fact, Voilà is more a *remix* of existing Jupyter components (with changes to enable that use case) than a completely new application.

**Integrating improvements upstream**

The Voilà team, which includes several maintainers of Jupyter subprojects strives to improve the underlying components to enable the Voilà use case instead of having Voilà bolted upon the project or duplicate features.

 - The Voilà gallery is a **JupyterHub** extension.
 - The Voilà front-end was designed as a **server extension** to jupyter_server or the classic notebook server.
 - The Voilà template system extends that of **nbconvert** and there is ongoing work to upstream the template system of voilà.
 - Voilà includes a "preview" extension for **JupyterLab** that lets users see what their notebook would look like in the form of a voilà dashboard.
 - The front-end of voilà itself reuses several javascript components from jupyterlab, including the theming capability.

The Voilà use case motivated a lot of work in jupyter_server. Besides, the main developers of the projects are maintainers of Jupyter subprojects.

**The Jupyter philosophy: language agnosticism**

Built upon the Jupyter stack, the Voilà project remains **agnostic to the programming language**. This is demonstrated by the presence in the gallery of voilà applications based on the xeus-cling kernel and the xleaflet C++ backend to ipyleaflet.

The language-agnosticism of Voilà makes it singular compared to other dashboarding systems such as Dash or Panel.

**The relationship with jupyter-dashboards**

The jupyter-dashboards project which provided dashboarding capabilities to jupyter is now unmaintained. The rich layout capability of jupyter-dashboards was based on the GridStackJS library. Unfortunately, jupyter-dashboards is not maintained anymore.

The voila-dashboards GitHub organization includes a template for laying out notebook cells using the GridStackJS library, [voila-gridstack](https://github.com/voila-dashboards/voila-gridstack). We intend to make voila-gridstack able to read the same layout specification as the original jupyter-dashboards project.

### Use solid software engineering with documentation and tests hosted with appropriate technologies

Voilà is continuously tested with TravisCI.

We also continuously build the documentation of Voilà which is hosted on ReadTheDocs at URL https://voila.readthedocs.io.

The documentation provides extensive resources on how to deploy Voilà on various services such as binder, Heroku, google app engine, etc.

Similarly, the gallery project that powers the voila-gallery.org public instance can easily be deployed on various infrastructures.

### Have a well-defined scope.

Voilà is a tool meant to *present* read-only notebooks, possibly with a different layout, but *without* the ability to execute arbitrary code. The scope is defined by the content that the notebook file format can hold.

### License

The Voilà project is licensed under the BSD-3-Clause license.

We use a shared copyright model that enables all contributors to maintain the copyright on their contributions.

