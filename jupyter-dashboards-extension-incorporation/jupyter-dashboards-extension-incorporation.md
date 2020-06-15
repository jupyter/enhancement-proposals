# Jupyter Dashboards Extension Incorporation

## Problem

> "Data science enables the creation of data products." – Mike Loukides in [What is data science?](https://www.oreilly.com/ideas/what-is-data-science)

Alice is a Jupyter Notebook user. Alice prototypes data access, modeling, plotting, interactivity, etc. in a notebook. Now Alice needs to deliver a dynamic dashboard for non-notebook users. Today, Alice must step outside Jupyter Notebook and build a separate web application. Alice cannot simply do the following:

* Select notebook content (widgets, plots, images, markdown, etc.) to show in a dashboard
* Arrange the dashboard content in a grid- or report-style layout
* Publish the dashboard layout as a standalone web application
* Push updates to the published web app when the notebook changes
* Secure the web app separate from the notebook authoring environment

## Proposed Enhancement

The incubating [dashboards layout extension for Jupyter Notebook](https://github.com/jupyter-incubator/dashboards) (hereafter, *dashboards extension*) is one of three incubation projects that, together, address the issues above. The community should consider incorporating the dashboards extension as an official Jupyter Subproject as a first step toward a robust dashboarding solution.

## Detailed Explanation

The full jupyter-incubator dashboards effort covers:

1. Arranging notebook outputs in a grid- or report-like layout (https://github.com/jupyter-incubator/dashboards)
2. Bundling notebooks and associated assets for deployment as dashboards https://github.com/jupyter-incubator/dashboards_bundlers)
3. Serving notebook-defined dashboards as standalone web apps (https://github.com/jupyter-incubator/dashboards_serve

The effort has close ties to https://github.com/jupyter-incubator/declarativewidgets which provides one way (but not the only way) of enabling rich interactivity in notebook-defined dashboards.

**N.B.** - Per the discussion at the spring 2016 dev meeting and steps noted in the [jupyter/roadmap](https://github.com/jupyter/roadmap#graduate-jupyterdashboards-from-incubator), this document covers the graduation of the `jupyter-incubator/dashboards` project alone. We will submit proposals for the other related projects in the near future.

### Current and Potential Use Cases

The dashboards extension supports the following use cases:

* Dashboard layout mode for arranging notebook cell outputs in a grid- or report-like fashion
* Dashboard view mode for interacting with an assembled dashboard within the Jupyter Notebook
* Ability to share notebooks that have dashboard layout metadata in them with other Jupyter Notebook users for layout and viewing

When used with the other incubating dashboard projects, it supports the following workflow:

1. Alice authors a notebook document using Jupyter Notebook. She adds visualizations and interactive widgets.
2. Alice arranges her notebook cells in a grid- or report-like dashboard layout.
3. Alice one-click deploys her notebook and associated assets to a Jupyter Dashboards server.
4. Bob visits the dashboards server and interacts with Alice's notebook-turned-dashboard application.
5. Alice updates her notebook with new features and redeploys it to the dashboards server.

![End-to-end dashboards workflow](https://raw.githubusercontent.com/wiki/jupyter-incubator/dashboards/images/workflow.png)

For example,
[here is an animation](https://ibm.box.com/shared/static/t9zfbloipanirdm8u0vg3ggbmp5c1q8p.gif) of a user arrange portions of a notebook into a dashboard and deploying it to a dashboard server.

### Current Features

The ["What It Gives You" section of the project README](https://github.com/jupyter-incubator/dashboards#what-it-gives-you) details the currently implemented features. The [notebooks directory](https://github.com/jupyter-incubator/dashboards/tree/master/etc/notebooks) in the project contains numerous examples.

### Design and Implementation

The dashboards extension is a pure JavaScript extension for the Jupyter Notebook frontend. It adds a toolbar and menu items for switching between three views: notebook, dashboard layout, and dashboard preview. It also adds a set of menu items for quickly adding/removing all cells to/from the dashboard layout. Help for creating dashboard layouts appears in situ in the layout mode.

The extension currently supports two types of layout: grid and report. The user moves, resizes, and shows/hides notebook cell widgets/outputs in a responsive grid in the former. The user simply shows/hides cell widgets/outputs in top-down notebook order in the latter. The extension [persists information about the layouts within the notebook document](https://github.com/jupyter-incubator/dashboards/wiki/Dashboard-Metadata-and-Rendering).

Both the notebook extension and the notebook document specification are extensible. They may grow support for additional kinds of layout in the future (e.g., fixed grids, paged wizards).

The extension is compatible with notebook version 4.0 through 4.2. Users install it using pip and manage it via the `jupyter` command line interface.

### Criteria for Incorporation

The [Jupyter Governance - New Subproject Process](https://github.com/jupyter/governance/blob/master/newsubprojects.md) lists the criteria used to evaluate projects for incorporation in to the official Jupyter organization. We address each of these criteria below.

#### Have an active developer community that offers a sustainable model for future development.

The project has contributions from 12 developers on GitHub and has been under active development over the past 10 months. We foresee future development of the extension taking the following primary forms:

1. Fixes for reported issues
2. Compatibility updates for new versions of Jupyter Notebook (e.g., 4.3, 4.4, ...)
3. Contributed enhancements to the existing extension within the scope of the project
4. Enhancements to the metadata spec and layout authoring options to remain compatible with future dashboard features in Jupyter Lab

The first two are straightforward and can be handled by current or future maintainers. The third, if and when it happens, can be integrated by current and future maintainers project as well. The fourth will be driven by future Jupyter Lab efforts to support dashboards.

#### Have an active user community.

The `jupyter-incubator/dashboards` repository has 151 stars and 30 watchers on GitHub. We have received questions, bug reports, and enhancement requests on GitHub, the Google Group, and Gitter.

#### Use solid software engineering with documentation and tests hosted with appropriate technologies.

The extension has a small suite of frontend smoke tests that use Selenium to drive the UI additions to the Notebook server. The tests run on SauceLabs via Travis CI on every PR merge.

User and developer documentation about the extension resides on ReadTheDocs at http://jupyter-dashboards-layout.readthedocs.io. We plan to migrate additional information to these docs from https://github.com/jupyter-incubator/dashboards/wiki.

#### Demonstrate continued growth and development.

See "Have an active developer community that offers a sustainable model for future development."

#### Integrate well with other official Subprojects.

The dashboards extension is a [properly packaged Jupyter Notebook extension](http://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html) with [documentation about its extensible, versioned metadata](https://github.com/jupyter-incubator/dashboards/wiki/Dashboard-Metadata-and-Rendering) so that other Jupyter tools may render its dashboard layouts (e.g., [dashboards server](https://github.com/jupyter-incubator/dashboards_server) now, Jupyter Lab in the future).

#### Be developed according to the Jupyter governance and contribution model.

The dashboards extension is in the Jupyter Incubator, and under the Jupyter governance and contribution model since its inception.

#### Have a well-defined scope.

The purpose of the dashboards extension is to provide a user interface for arranging notebook cells into interactive dashboard layouts. We have separated features beyond this scope into other projects (e.g., serving dashboards as standalone web applications &rarr; jupyter-incubator/dashboards_server project) and have recommended similar actions for community requests (e.g., support for dashboard layouts when converting to PDF &rarr; add support for dashboard metadata to nbconvert).

#### Be packaged using appropriate technologies such as pip, conda, npm, bower, docker, etc.

The dashboards extension is packaged using setuptools, released on PyPI, and installable using `pip`. Users manage the extension after `pip install` via the `jupyter` CLI.

## Pros and Cons

* Pro: Gives Jupyter users an avenue for creating dashboard layouts in Jupyter notebooks today.
* Pro: Works with the other incubating projects to enable deployment of dashboard-notebooks as standalone web applications.
* Pro: Defines a spec for storing layout metadata in notebook documents and steps for rendering those layouts.
* Pro: Serves as a test bed and reference implementation for future dashboard efforts in Jupyter Lab.
* Con: There is currently [no consensus on a light proposal](https://github.com/jupyter/enhancement-proposals/pull/15) for where to store layout metadata in notebooks, let alone a single layout metadata spec to be shared across all tools (including those beyond the dashboards use case).

## Interested Contributors

@parente
