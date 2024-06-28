---
title: Incorporate `jupyter-book` as a Jupyter sub-project
authors: choldgraf, gregcaporaso, jstac, rowanc1
issue-number: 122
pr-number: 123
date-started: 2024-05-21
---

# Incorporate Jupyter Book as a Jupyter Sub-project

## Summary

_One paragraph explanation of the proposal._

We propose the incorporation of a new Jupyter community sub-project: Jupyter Book (hereafter, `jupyter-book`). This sub-project is dedicated to building tools and standards that facilitate authoring, reading, and publishing workflows for computational narratives. The new sub-project would act as the steward of several successful technology and standards projects currently stewarded by the `executablebooks/` project, most notably `Jupyter Book` and the `MyST` documentation engine, document standard, and markdown syntax. This will allow these tools to further enhance interoperability with the broader Jupyter stack of tools and to enable extensions that improve the state of authoring, reading, and publishing across the Jupyter ecosystem.

## Motivation

_Why are we doing this? What use cases does it support? What is the expected outcome?_

The Jupyter Book project is a heavily-used user-facing tool for combining multiple computational narratives into an interactive book-like format. It was first created as a Jupyter repository (based on Jekyll), and was then moved into the [`executablebooks/` organization](https://github.com/executablebooks) when the Jupyter Book project received funding from the Sloan Foundation. The Jupyter Book stack was originally based on Sphinx, which was largely driven by development in the first half of the grant's timeline. It now seeks to [migrate to a JavaScript-based document engine with MyST](https://executablebooks.org/en/latest/blog/2024/2024-05-20-jupyter-book-myst/).

In the past two years, Jupyter Book has shifted its technical strategy to focus on a modern, future-proof foundation for authoring and reading computational narratives. It has invested project resources into developing a TypeScript-based documentation engine that can serve as the backbone of Jupyter Book. This documentation engine, called [MyST](https://mystmd.org) (for Markedly Structured Text, the same name as its flavor of markdown syntax), is designed to be web-native, and to more naturally interact with the web-based tools in the Jupyter ecosystem and beyond.

The `executablebooks/` GitHub organization is an artifact of the Sloan Foundation grant that originally funded its operations. This grant is winding down, and we are seeking a longer-lasting and organizationally-neutral home for the vision, strategy, tools, and standards of this modern version of the Jupyter Book toolchain.

The Jupyter project has a technical strategy that often discusses computational narratives. For example, many use Jupyter Notebooks to share data narratives and workflows around them (and in fact, this is one of the original driving use-cases for Jupyter Book). While Jupyter tends to focus on the computational and interactive aspects of the data science workflow first, we believe that `jupyter-book` would serve as a good “narrative-first” counterpart. By focusing on the content authoring, reading, and sharing aspects of the Jupyter ecosystem, `jupyter-book` could meet a unique set of use-cases that are relevant to the project. For example, improving Jupyter’s functionality for blogs, scholarship, data science education, software documentation, and community knowledge bases.

For these reasons, we believe that the Jupyter Project would be a natural home for the parts of the `executablebooks/` ecosystem that intersect Jupyter's mission around technology and standards for interactive computing. Below we provide more context for what this could look like.

## Guide-level explanation

_Explain the proposal as if it was already implemented and you were explaining it to another community member._

At a strategic level: the `jupyter-book` sub-project focuses on **web-native workflows for authoring, reading, and publishing narratives with computation**, as well as integrating with existing Jupyter sub-projects. The sub-project assumes responsibility for defining the strategy that guides future development of `jupyter-book` and its related projects, getting the resources necessary to carry out this strategy, and stewarding an open community.

At a team capacity level: the `jupyter-book` sub-project is currently maintained with the following team: A three-person Steering Council: Chris Holdgraf ([@choldgraf](https://github.com/choldgraf)), Greg Caporaso ([@gcaporaso](https://github.com/gregcaporaso)), Rowan Cockett ([@rowanc1](https://github.com/rowanc1)), as well as an additional three engineering team members: Angus Hollands ([@agoose77](https://github.com/agoose77)), Franklin Koch ([@fwkoch](https://github.com/fwkoch)), Steve Purves ([@stevejpurves](https://github.com/stevejpurves)). There have been over [30 additional contributors to the project](https://github.com/executablebooks/mystmd/graphs/contributors) as well, and we intend on growing the accessibility of the project to new contributors moving forward.

At a functionality level: Jupyter Book allows users to build beautiful, publication-quality books and documents from computational content. The authoring experience works [directly in the JupyterLab interface](https://github.com/executablebooks/jupyterlab-myst) to enhance narrative content with cross-references and specialized markups (like exercises, proofs, theorems, etc.). A Jupyter Book can either be a static-renderer or integrate to computation from existing Jupyter projects that are local, collaborative (JupyterHub), ephemeral (Binder), or browser-based (JupyterLite). A Jupyter Book can be exported to many existing PDF templates used in scientific publishing. The underlying components work with existing Jupyter standards for notebooks and provide ways to write structured content in Markdown that can be accessed by scientific publishing workflows and documentation tool-chains.

We’ve identified a subset of the `executablebooks/` repositories that fit within this strategic focus, and that we propose transferring to a newly-created Jupyter sub-project called `jupyter-book`. [See the appendix below for a list of projects and their proposed homes.](#appendix-repositories)

We’ve selected repositories based on the likelihood that they integrate and interoperate cleanly with other major projects in the Jupyter ecosystem, and that they follow Jupyter's strategy for standards and protocols. For example, repositories that are largely based on web technologies (in order to integrate with tools like JupyterLab/Lite, Voila, etc), that integrate with Jupyter's underlying server and computation infrastructure (like Jupyter server and Binder), and that define and re-use standards for third-party communities to build on top of (like the MyST Markdown syntax or the notebook format).

The remaining repositories that are _not_ transferred into the `jupyter-book` organization will remain under the governing structures of the `executablebooks/` project. The steering council of that project will continue to steward those repositories or identify alternative homes for them, but the Jupyter project will not have any responsibility or oversight over this process.

## Reference-level explanation

We wish to:

- Create a GitHub organization called `jupyter-book`.
- Transfer over ownership of these repositories to this new organization (see [](#appendix-repositories)).
- List this organization as being the home of a "Jupyter sub-project" called `jupyter-book`.
- Define a steering council of the following people (in alphabetical order):
  - Chris Holdgraf
  - Greg Caporaso
  - Rowan Cockett
- Define the necessary representatives for `jupyter-book` in the SSC.
- Define a team-compass for Jupyter Book at `jupyter-book/team-compass`.
- Begin operations as a Jupyter sub-project.

This proposal does _not_ include any ideas around changes to technology or standards, both within `jupyter-book` and in its relation to the broader Jupyter community.

## Rationale and alternatives

### Why Jupyter?

Jupyter is a natural home for the `jupyter-book` project for several key reasons described below:

1. The strategy of `jupyter-book` aligns heavily with the broader goals of the Jupyter ecosystem. While Jupyter builds technology and standards for interactive computing workflows, Jupyter Book focuses on the "authoring, reading, and publishing" aspects of interactive computing, with an emphasis on traditional publishing workflows like "books", "articles", "knowledge bases", etc.
2. The technical direction for `jupyter-book` aligns heavily with Jupyter's broader technical direction and standards, and being a sub-project will create more opportunities for integrations, re-using components and standards, and generally connecting with the Jupyter stack in a way that is greater than the sum of its parts.
3. The proposed Steering Council of the `jupyter-book` project each have extensive experience in the open source ecosystem and understand how to build healthy open source communities aligned with Jupyter's principles.
4. Some members of the Steering Council (Chris Holdgraf) have extensive experience with other Jupyter sub-projects. For example, Chris was part of the inaugural Distinguished Contributor cohort and has served on the JupyterHub and Binder steering council for more than 5 years.
5. Jupyter Book (the technology project) began within the `jupyter/` organization, and was originally framed as "a way to publish collections of `.ipynb` files as a web-based book".
6. MyST Markdown (the markdown syntax) was initially brainstormed within the Jupyter community, with several then-Steering Council members serving as key catalysts in the creation of MyST.

### Why split the `executablebooks/` repositories into two homes?

We believe that the `executablebooks/` repositories naturally fall into two technical directions: one based on `docutils` and `sphinx` (with heavy overlap with the broader developer documentation community), and one based on Javascript (with heavy overlap with scientific computing and authoring workflows).

The technical direction and user-focus of each is distinct enough that it is natural to split them into two projects. This will allow each organization to define their own set of target users and strategies to serve them.

Note that, initially, the Steering Council of `executablebooks/` and that of the `jupyter-book` organization will be the same. This will allow us to coordinate the direction of projects in each organization for the immediate future, and minimize the friction associated with having two organizational homes. Over time, we intend for the strategy and governance of each organization to begin to evolve independent of one another.

### What other options do we have?

The most natural alternative is to define `executablebooks/` as its own standalone open source community, and request incorporation under a fiscal sponsor like NumFocus. We believe that this is a perfectly reasonable direction, but also believe that there is a unique opportunity to empower the workflows and users we care about by building a deeper relationship with the Jupyter community.

Alternatively, we could decide to take no action, and retain `executablebooks/`'s current status as a project-focused GitHub organization with a governing body defined in its team compass, but with no formal organizational status. We believe that this would hinder the project's ability to grow its community, to define an organizationally-neutral place to host its tools and strategy, and to raise funds needed to sustain and grow the community's operations.

## Prior art

This proposal is similar to other JEP proposals to incorporate new Jupyter sub-projects from pre-existing technology.

In each case, a team independently defined the strategy, direction, and early development to bring technology projects to a more "stable" state. They then proposed incorporation as a sub-project once the key ideas that drove these projects solidified, and when it became clear that there was a natural overlap at a technical and strategic level with the Jupyter ecosystem. In these cases, the leaders of the project were also leaders within the Jupyter project, which facilitated the flow of information and collaboration across Jupyter and the new sub-project.

We believe that the `jupyter-book/` project follows the same pattern described here. For examples of previous JEPs similar to the one proposed here, see [Voila incorporation JEP](https://github.com/jupyter/enhancement-proposals/tree/master/42-voila-incorporation), and the [Xeus incorporation JEP](https://github.com/jupyter/enhancement-proposals/tree/master/44-xeus-incorporation).

## Unresolved questions

This JEP does not propose any new ideas for the technical future of the `jupyter-book` project or any other part of the Jupyter ecosystem. There may be many new directions to consider if `jupyter-book` is incorporated as a subproject, but this can be discussed and iterated on in the future. This proposal is only about defining the organizational structure of the `jupyter-book` subproject and its initial set of repositories.

## Future possibilities

There are many ways that the `jupyter-book` project could connect and integrate with the broader Jupyter community. For example:

- By further-developing JupyterLab-MyST, which brings the functionality of MyST Markdown into the JupyterLab interface. For example, we could leverage JupyterLab's user interface to facilitate multi-document authoring and references, or to provide real-time previews of rendered MyST documents that leverage computation and notebooks.
- By integrating the interactive aspects of MyST and Jupyter Book with computational machinery provided by other Jupyter technology, such as JupyterHub and BinderHub (via a tool like `thebe/`).
- By integrating the MyST documentation engine into Jupyter services such as `nbviewer` or `Binder`.
- By improving the kernel execution frameworks within Jupyter that power Jupyter Book's functionality around executing content as part of the book building process.
- By better-integrating the interactive interfaces and outputs in the Jupyter ecosystem (ipywidgets, voila, RISE, etc) into Jupyter Book and MyST.
- By improving the `ipynb` specification and format in order to promote re-usability and composability in Jupyter Book and MyST.

## Appendix: Frequently Asked Questions (FAQs)

**Why is the Jupyter Book CLI being moved, given that it depends on the Sphinx stack?**

Our intention is to gradually swap the back-end of Jupyter Book to use the mystmd backend instead of Sphinx. For this reason, it will be aligned at a technical strategy level with the rest of the web-native stack. This will likely take several months or more, as we slowly bring the MyST document engine up to feature parity with the Jupyter Book stack, and we plan on coordinating with the Executable Books community throughout this process (and note that initially the leadership of this sub-project, and Executable Books, will be the same in order to make this easier).

**Does that mean the Sphinx stack is being abandoned?**

No! The Sphinx-focused repositories will remain inside the `executablebooks/` organization and governance. Those projects will continue to be useful to the Sphinx community, as they’ve been designed to work independently of Jupyter Book and have a large user base without it (from the developer community in Sphinx). This will continue to grow/evolve as an independent GitHub organization with its own developer community. We think that it’s better to have a Sphinx-focused stack in its own space, so that the Jupyter project can reduce its extra maintenance burden, and focus on the web-native nature of its technology stack.

**Does this involve other JS-based repositories like Papyri?**

Not right now. We think Papyri is awesome and would love to find ways to integrate more with it and potentially include it in this organization. Right now we’d like to keep the decision relatively simple and tightly scoped to Executable Books repositories.

**What about reading-focused Jupyter services like NBConvert?**

Same idea as above. We’re open to talking about how Jupyter Book could support, integrate and/or help steward services like these, but want to focus this decision on bringing “Jupyter Book” into existence as a sub-project just with our current list of repositories.

## Security considerations

The main content for Jupyter Book is text-based and images, and can also include interactive Jupyter outputs that can potentially be untrusted vectors for abuse. Currently, the Jupyter Book and MyST Markdown tools are primarily intended and used for stand-alone sites that do not have authentication. There is the possibility to include user-generated content through Jupyter and other untrusted output that could provide a problem in an authenticated environment. The project uses React for rendering HTML, which provides some assurances around not rendering untrusted or arbitrary HTML, all content is stored as JSON data, and transformed on the fly to HTML. The Jupyter outputs are using the same components as the JupyterLab project. Currently deployed projects can be connected to a remote Jupyter kernel in a JupyterHub or BinderHub (using Thebe), these have the same security concerns as those tools, which is mitigated by having containerized environments. It is possible, when running locally, to connect to arbitrary user environments in Jupyter, this is always initiated through a user action through the terminal ([documentation](https://mystmd.org/guide/execute-notebooks)).

## Accessibility considerations

The Jupyter Book team is committed to making its interfaces accessible, and believes that building on modern web frameworks is a good foundation to begin with. It does not have accessibility expertise itself, although we have sponsored some of our team members to attend web-accessibility courses. The Jupyter Book team will need guidance and resourcing (at the least in a consulting/assessment capacity) from the Jupyter community in order to identify and implement accessibility improvements.

From a technology standpoint, we are adopting tools that have a good accessibility track record (e.g. RadixUI, see [accessibility docs for Radix](https://www.radix-ui.com/primitives/docs/overview/accessibility)). This allows us to implement rather than reinvent accessibility best-practices. The interactive Jupyter components are inherited directly from the JupyterLab ecosystem, so improvements to accessibility there will directly improve MyST Markdown and Jupyter Book. We discuss some of the accessibility considerations in the [MyST Markdown project here](https://mystmd.org/guide/accessibility-and-performance).

(appendix-repositories)=
## Appendix: List of `executablebooks/` repositories to incorporate under `jupyter-book`

(note the "last updated" field is out of date, and reflects when this draft first started in early March 2024)

```{csv-table} 
:file: repositoriestoinclude.csv
``` 