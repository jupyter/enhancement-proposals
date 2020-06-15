---
title: Xeus Incorporation
authors: SylvainCorlay
issue-number: XX
pr-number: 44
date-started: "2019-11-30"
---

# Xeus Incorporation

## Problem

The [Xeus](https://github.com/QuantStack/xeus/) project is a C++ implementation of the [Jupyter kernel protocol](https://jupyter-client.readthedocs.io/en/stable/messaging.html). Xeus is not a kernel, but a library meant to facilitate the authoring of kernels.

Several Jupyter kernels have been created with Xeus:

 - [xeus-cling](https://github.com/QuantStack/xeus-cling), a kernel for the C++ programming language, based on the Cling C++ interpreter. The [cling](https://github.com/root-project/cling) project comes from CERN and is at the foundation of the [ROOT](https://github.com/root-project/root.git) project.
 - [xeus-python](https://github.com/QuantStack/xeus-python), a kernel for the Python programming language, embedding the Python interpreter.
 - [xeus-calc](https://github.com/QuantStack/xeus-calc), a calculator kernel, meant as an educational example on how to make Jupyter kernels with Xeus.

Beyond these three kernels built on top of Xeus by the Xeus authors, third-parties have developed other Jupyter kernels with Xeus:

 - [JuniperKernel](https://github.com/JuniperKernel/JuniperKernel), a kernel for the R programming language by Spencer Aiello.
 - [xeus-fift](https://github.com/atomex-me/xeus-fift), a kernel for the fift programming language by Michael Zaikin. The fift programming language was developed by Telegram to create TON blockchain contracts.
 - [SlicerJupyter](https://github.com/Slicer/SlicerJupyter), a kernel for the Python programming language by Kitware which integrates into the Qt event loop of the Kitware "Slicer" project.

Finally, the xeus-python kernel is used as the backend for the [Jupyter debugger](https://github.com/jupyterlab/debugger/) project. Indeed, xeus-python enables the [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) over the Control channel through new debug request/reply and debug event messages.

- While Xeus started as a side project for QuantStack engineers, the project now has several stakeholders who depend on it. We think that moving the project to an open governance organization may be a better way to reflect this situation.
- Both JuniperKernel and SlicerJupyter take advantage of Xeus' pluggable concurrency model, which makes it possible to override the concurrency model. The debugger use case required for the control channel messages to be processed while code is being executed by the kernel and makes use of threading for that purpose, and the SlicerJupyter kernel required plugging into another event loop.

## Proposed Enhancement

We propose to make the Xeus project officially part of Jupyter, alongside other related projects from QuantStack, namely xeus-python, xeus-cling, and xeus-calc. Some utility packages used by these kernels may also be moved with xeus, such as [xhale](https://github.com/QuantStack/xhale) which is used by xeus-cling for the quick help mechanism.

If this incorporation is accepted, the different projects will be modified to reflect this affiliation. Links to the governance documents, code of conduct, and contributing guidelines will be added to the readme and the documentation.

Xeus and the projects listed above would be moved to the [jupyter-xeus](https://github.com/jupyter-xeus) GitHub organization.

The [xwidgets](https://github.com/QuantStack/xwidgets), [xplot](https://github.com/QuantStack/xplot), [xleaflet](https://github.com/QuantStack/xleaflet), and [xthreejs](https://github.com/QuantStack/xthreejs) would also be moved to the same organization. Xwidgets is a C++ implementation of the Jupyter widgets protocol built upon xeus. xplot, xleaflet, and xthreejs are C++ backends to the bqplot, ipyleaflet, and PythreeJS Jupyter widget packages.

## Criteria for Incorporation

The [Jupyter Governance - New Subproject Process](https://github.com/jupyter/governance/blob/master/newsubprojects.md) lists the criteria used to evaluate projects for incorporation into the official Jupyter organization. We address each of these criteria below.

### Have an active developer community

**Contributors**

The core Xeus package has 12 contributors, 524 GitHub stars. Xeus-cling is slightly more popular with over 1000 stars on GitHub. As mentioned earlier, there are several other kernels built upon Xeus by third parties.

### Have an active user community

The Xeus project has a steadily growing user base. The C++ kernel, in particular, is very popular as it is used for teaching the C++ programming language at several universities. Most notably, the [Introduction to Computer Science](http://nicolas.thiery.name/Enseignement/Info111/) course by Nicolas Thiery at University Paris Sud has over 350 students every year who typed their first lines of C++ in a Jupyter notebook.

### Demonstrate continued growth and development

Beyond the xeus-based kernels, there is a new push in the project motivated by the development of the JupyterLab visual debugger. We think that the core xeus library is fairly complete already and that most of the work already done will apply to other xeus-based language kernels such as xeus-cling.

### Integrate well with other official Subprojects.

**Integrating with other Jupyter Components**

- Xeus *is* an implementation of a Jupyter protocol.
- Xeus-python and xeus-cling offer backends to the *Jupyter widgets protocol* and support *Jupyter rich mime type rendering*.
- Xeus-python is used as a foundation for the JupyterLab debugger project.
- Xeus-cling is co-developed with users who make use of it for teaching C++. A lot of the work in the latest versions has been done to enable the use of *nbgrader* with the C++ kernel.

**The Jupyter philosophy: language agnosticism**

We believe that offering a non-python implementation of the kernel protocol will help communicate about the language agnosticism of the Jupyter project. Unlike the one available in ipykernel, the implementation of the protocol of xeus is standalone and may serve as an example for other implementation in e.g. Java or C-Sharp.

### Use solid software engineering with documentation and tests hosted with appropriate technologies

Xeus is continuously tested on multiple platforms with TravisCI and Appveyor.

We also continuously build the documentation of Xeus which is hosted on ReadTheDocs at URL https://xeus.readthedocs.io. The same holds for xeus-python and xeus-cling.

### Have a well-defined scope.

The scope of xeus is very well defined in that it is limited to the implementation of the Jupyter kernel protocol.

### License

The Xeus project is licensed under the BSD-3-Clause license.

We use a shared copyright model that enables all contributors to maintain the copyright on their contributions.

