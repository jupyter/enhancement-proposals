---
title: Jupyter Notebook version 7
authors: Fernando Pérez (@fperez), Jeremy Tuloup (@jtpio), Sharan Foga (@sharanf), Afshin Darian (@afshin), Brian Granger (@ellisonbg), Sylvain Corlay (@SylvainCorlay), Jason Grout (@jasongrout), Zach Sailer (@Zsailer), Kevin Goldsmith (@KevinGoldsmith).
issue-number: NN
pr-number: NN
date-started: 2021-11-12
---

**Note on the status of this document:** this is a very early draft, still not ready even for public vote. It supersedes the existing two open issues [#6210](https://github.com/jupyter/notebook/issues/6210) and [#6220](https://github.com/jupyter/notebook/issues/6220), we aim to collect input and feedback so we can rapidly identify any major remaining concerns and focus energy on implementing this plan. We note that so far feedback on the main plan has been very positive, so we expect to move forward with the main plan, but want to identify specific details and issues that may have been overlooked, to ensure the smoothest transition possible.


# Jupyter Notebook version 7

This JEP presents a path forward for the evolution of the Jupyter Notebook application in a way that is technically consistent with the rest of our tools and thus more sustainable, while meeting the needs of our users.

This document proposes that the next major release of the [Jupyter Notebook](https://jupyter-notebook.readthedocs.io) application, version 7, will be based on the JupyterLab codebase, but will provide an equivalent user experience to the current (version 6) application.  Jupyter Notebook version 7 ("Notebook v7" henceforth) will achieve this by using the current version of [RetroLab](https://github.com/jupyterlab/retrolab). The following three key ideas are central to this planned transition:

**The Notebook as a document-centric user experience:** The Jupyter Notebook application offers a _document-centric user experience_. That is, in the Notebook application, the landing page that contains a file manager, running tools tab, and a few optional extras, is a launching point into opening standalone, individual documents. This document-centric experience is important for many users, and that is the first key point this proposal aims to preserve. Notebook v7 will be based on a different JavaScript implementation than v6, but _it will preserve the document-centric experience, where each individual notebook opens in a separate browser tab and the visible tools and menus are focused on the open document_.

**Extensions critical to the Notebook user community:** Furthermore, for many users, certain widely used extensions are critical to their workflow. While we can not port every Notebook v6 extension ourselves (a list of widely-used community extensions is [here](https://github.com/ipython-contrib/jupyter_contrib_nbextensions)), we will identify some critical extensions (listed below) which, on day 1 of the Notebook v7 release, should work with similar functionality that users currently enjoy. We will engage with the developers of those extensions to identify a concrete technical plan and resources to implement this transition. We will also engage with the broader extension-authoring community to provide resources to ease the transition of other extensions.

**The body of existing content relying on the Notebook application experience:** Finally, the Notebook v6 community depends on widely-used educational content using the core Notebook application (such as tutorials, textbooks, videos), and these _will not be invalidated_ by the transition. Educators who have such materials online will not need to update their content. While we can not expect a pixel-perfect match between versions 6 and 7 of the Notebook, we will make every effort to ensure that the gap between the visual and operational experience (menu items, available tools and actions, etc.) is small enough that any user can reasonably bridge it without assistance.

These three concerns will drive our transition; their specific implications are detailed below in the form of concrete user stories.

## Extensions

The Notebook ecosystem for extensions is rich and varied, and some of those are critical to major deployments, especially in educational and institutional contexts. Since the internal APIs of JupyterLab are entirely different from those of Notebook v6, existing extensions written for v6 will not work on v7 out of the box. Here we detail the plan for how to minimize the disruption caused by this transition and how to support the community in the process.

There is a [community repository of unofficial Notebook extensions](https://jupyter-contrib-nbextensions.readthedocs.io), along with [corresponding documentation](https://jupyterlab-contrib.github.io/migrate_from_classical.html) indicating which of these extensions have analogs or ports in JupyterLab. Some of the functionalities provided by these unofficial Notebook extensions are now built-in features in JupyterLab: code folding, collapsible headings, the keyboard shortcuts editor, the table of contents, and many others.

### Critical extensions needed for Notebook v7

The following Notebook v6 extensions have been flagged by the community as critical to several major deployments and widely-used workflows. We will work with the extension developers to help port these (or help make new equivalent extensions) for Notebook v7:

- [nbgrader](https://github.com/jupyter/nbgrader)
- [RISE](https://github.com/damianavila/RISE)
- [Jupytext](https://github.com/mwouts/jupytext/issues/271)
- IPython Parallel (filebrowser tab)

### Extensions whose functionality will be built into Notebook v7

The following extensions will have largely equivalent experiences shipping in core Notebook v7 and JupyterLab. We will need to track whether there are any remaining differences in their functionality that are either regressions, or potentially disrupting or confusing to existing users.

- [Table of Contents](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/toc2)
- [Collapsible headings](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/collapsible_headings)

## Major new features in Notebook v7

In addition to having parity with the Notebook v6 user experience and widely-used extensions, Notebook v7 will inherit major new features that have been developed in the JupyterLab project, thus providing automatically a number of improvements to Notebook users as they transition to v7:

- Debugger
- Real-time collaboration
- Theming and dark mode
- Internationalization
- Improved Accessibility
- Support for many JupyterLab extensions, including Jupyter LSP (Language Server Protocol) for enhanced code completions

## Technical details

- [RetroLab](https://github.com/jupyterlab/retrolab) running on [Jupyter Server](https://github.com/jupyter-server/jupyter_server) will be the basis for Notebook v7.
- The current [RetroLab](https://github.com/jupyterlab/retrolab) commit history will be grafted into the [Jupyter Notebook repository](https://github.com/jupyter/notebook) in a pull request.
- Notebook v7 will continue to be released as the `notebook` Python package.
- Issues and PRs in the [Notebook repository](https://github.com/jupyter/notebook) will be triaged in this transition.

## Timeline

We anticipate that Notebook v7 will be released in 2022.

Jupyter Notebook v6 will be maintained with critical security fixes for two years following the release of Jupyter Notebook v7.

The [`nbclassic`](https://github.com/jupyterlab/nbclassic) Python package (which provides Jupyter Notebook version 6 on top of Jupyter Server) will also be maintained with critical security fixes for two years following the release of Notebook v7. 


## User Stories
These user stories are guiding principles for the experience of using Notebook v7. They are not specific deliverables if the JEP is approved.

- As a user, when I install JupyterLab or Jupyter Notebook, I get both experiences, so I can choose between them as I work.
- As a user, when I start the application using `jupyter notebook` or `jupyter lab`, the default view that I see will correspond to notebook or lab respectively. The handler is also updated accordingly to point to that application.
- As a user, when I am using the lab or notebook interface, I can easily move back and forth within the UI using easily-discoverable menu items, context menus, buttons, etc.
    - Open this document in the notebook interface
    - Open this document in the lab interface
    - Open this directory in the notebook file browser
    - Etc.
- As a user, when I am using Notebook v7, the visual design strongly matches what I am used to in Notebook v6.
    - As a user, I want the visual design of the notebook interface to get better over time, so my user experience improves over time.
    - As a user, I want the visual design of Notebook and JupyterLab to be closely aligned, so I know that I am using a single, unified experience.
    - As a user I want the UI to not change dramatically so that my tutorials and class materials do not get out of date.
- As a user, I want extensions for the file browser page of Notebook to be able to add new tabs that sit alongside the file browser (such as the Running Panel).
- As a user, I want extensions that need a left/right/bottom/status area to work in Notebook, but I want those areas to be entirely hidden by default, so I can have the document-oriented notebook experience that I am used to.
- As a user, I want to know all of the great new things I am getting with Notebook v7, so I can make an informed decision to upgrade.
- As a user, I want the most common notebook extensions to work in both the notebook and lab interfaces, so I can move back and forth without missing functionality (see below).
-   As a user, I want this user experience to work seamlessly with the [Jupyter Desktop](https://blog.jupyter.org/jupyterlab-desktop-app-now-available-b8b661b17e9a)
    - As a user, I can double-click on an `.ipynb` file on my local computer (Mac, Win, Linux) to open the notebook as a single document which I can edit, run, etc.
    - As a user, I want to be able to go from the document-centric experience to the full JupyterLab Desktop application, so I can get a more IDE-centric experience, including file management, terminals, and more.
    - As a user, I can open notebooks via the command-line or open JupyterLab in a particular directory.
    - As a user, I want Jupyter Desktop to let me open my Jupyter editor (with any extensions I may have installed) as a single application and the Jupyter Console.
    - As a user, I can use other Jupyter-based tools in the native desktop experience, such as Consoles attached to Notebooks, in their own Native window.
    - As a user, I want Jupyter Desktop to be able to authenticate to and connect to any local or remote Jupyter Server, so I can have the same native Desktop experience against remote resources.

## Decision making principles

As we move forward with this plan and begin to make decisions about how to handle the visual design, functionality, and UX of Notebook V7 (how elements are styled, how do they behave, etc.) there will be tension between two paths:

* **Option A**: Making Notebook V7 work and look exactly like Notebook v6
* **Option B**: Making Notebook V7 work and look exactly like JupyterLab V4

There will always be tradeoffs between these two options. To help us make these tradeoffs, we propose to look at the following questions:

* Is Option A or Option B be more accessible?
* If we were to design this from scratch today, would our design work and look more like Option A or Option B?
* Is Option A or Option B more maintainable?
* Is Option A or Option B be more secure?
* Will Option A confuse or cause friction Jupyter users who work in both Notebook V7 and JupyterLab v4?
* What is best for future Jupyter users who have never used either any version of Notebook or JupyterLab?
* Have we done everything possible to minimize the experience gap for users of Notebook v6 (while recognizing, given other constraints, that we can't always eliminate it completely)?

## Links and resources

- This JEP was originally posted by @fperez [as a comment in the original discussion opened by @zsailer](https://github.com/jupyter/notebook/issues/6210#issuecomment-957169113).
- The blockers for transitioning Berkeley's Data 8 course to RetroLab are tracked [here](https://github.com/berkeley-dsep-infra/datahub/issues/2422).
- The [community-contributed Notebook extensions have their own repository](https://github.com/ipython-contrib/jupyter_contrib_nbextensions).

## Questions

**Q:** What implications does this transition have for the notebook `.ipynb` format?
**A:** _None_. The file format remains unchanged. This JEP is about the Jupyter Notebook application, not the Jupyter notebook `.ipynb` file format.

**Q:** I wrote a Notebook extension that I'd like to update. Where can I find resources and/or support for that?
**A:** We will strive to assist the community throughout the transition to the new extension system. There will be a central location with information on how to port extensions for others to do so in the future. We will also host office hours to assist extension developers.

**Q:** What will I need to do to get my JupyterLab extension working with Notebook v7?
**A:** Both JupyterLab and Notebook v7 will use the same extension system and it is our intention to enable extension authors to create extensions that work in both JupyterLab and Notebook v7. We are still working out the technical details of that and will update our documentation with links as more information is available.
**A:** ...
