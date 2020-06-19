# Jupyter Kernel Gateway Incorporation

## Problem

People are creating novel applications and libraries that use Jupyter kernels as interactive code execution engines. For example:

* [pyxie](https://github.com/oreillymedia/pyxie-static) uses kernels to evaluate code from a text area on a web page
* [Thebe](https://github.com/oreillymedia/thebe) uses kernels to evaluate code from multiple input areas on a web page
* [gist exec](https://github.com/rgbkrk/gistexec) uses kernels to evaluate code from GitHub gists rendered as web pages
* [Atom Notebook](https://github.com/jupyter/atom-notebook) uses kernels to enable a notebook experience in the Atom text editor
* [Eclairjs](https://github.com/EclairJS/eclairjs-node) uses the Apache Toree kernel as a means of executing Apache Spark jobs defined in JavaScript
* [Jupyter dashboard server](https://github.com/jupyter-incubator/dashboards_nodejs_app) uses kernels to evaluate code from notebooks rendered as interactive dashboards

These applications have two important properties in common:

1. They spawn kernels using provisioning APIs that run separate, and often remote, from the user-facing applications themselves.
2. They communicate with kernels using Websockets rather than directly with ZeroMQ.

Some of these application have spawned (or still do spawn) entire Jupyter Notebook servers on the backend in order to request kernels using notebook HTTP API and communicate with them over Websockets. This approach is less than ideal, however, for various reasons:

1. The notebook UI is exposed, but only the programmatic UI is used
2. The notebook authentication mechanism is form- and cookie-based and meant for humans, not programmatic clients
3. The notebook transport mechanisms and APIs serve the notebook user experience, and are not meant to be replaced or extended to support other clients

## Proposed Enhancement

The incubating [Jupyter Kernel Gateway project](https://github.com/jupyter-incubator/kernel_gateway) has matured to the point where it addresses the issues noted above, and others. It should be considered for incorporation into the main Jupyter organization as an official Subproject.

## Detailed Explanation

The kernel gateway is a web server that supports mechanisms for spawning and communicating with Jupyter kernels. Currently, it supports two such mechanisms:

1. A 100% Jupyter Notebook server compatible API for:
    * Creating, listing, and deleting Jupyter kernels via HTTP
    * Communicating with those kernels using the [Jupyter kernel protocol](http://jupyter-client.readthedocs.org/en/latest/messaging.html) via Websockets
2. A notebook-defined API that maps HTTP verbs (e.g., `GET`, `POST`) and resources (e.g., `/foo/:bar`) to code to execute on a kernel

The server launches kernels in its local process/filesystem space. It can be containerized and scaled out using common technology like [tmpnb](https://github.com/jupyter/tmpnb), [Cloud Foundry](https://github.com/cloudfoundry), and [Kubernetes](http://kubernetes.io/).

### Current and Potential Use Cases

* Provide a web-friendly, interactive API for defining, executing, and updating Apache Spark jobs
* Enable non-notebook web clients to provision and use kernels via libraries like  [jupyter-js-services](https://github.com/jupyter/jupyter-js-services))
* Scale Jupyter kernels independently from clients (e.g., via [tmpnb](https://github.com/jupyter/tmpnb), [Binder](https://mybinder.org), your favorite cluster manager)
* Provision and connect to kernels on a remote cloud provider from a local Jupyter Notebook server
* Deploy notebooks as [RESTful microservices](http://blog.ibmjstart.net/2016/01/28/jupyter-notebooks-as-restful-microservices/)

### Current Features

The ["What It Gives You" section of the project README](https://github.com/jupyter-incubator/kernel_gateway#what-it-gives-you) details the currently implemented features. The [jupyter-incubator/kernel_gateway_demos](https://github.com/jupyter-incubator/kernel_gateway_demos) repository contains many runnable examples.

### Criteria for Incorporation

#### Have an active developer community that offers a sustainable model for future development.

The kernel gateway reuses and extends classes from the Jupyter `notebook` Python package. By virtue of this implementation, it is largely sustained by development of the `jupyter/notebook` project. Minimal maintenance is required to ensure the kernel gateway codebase continues to interoperate with future releases of the `notebook` package.

#### Have an active user community.

Kernel gateway is already a required component of the `jupyter/atom-notebook` and `EclairJS/eclairjs-node` projects, a key component letting notebooks with layout defined by  `jupyter-incubator/dashboards` run as standalone web applications, and a swap-in replacement for the whole-notebook approach used by `oreillymedia/thebe` and `rgbkrk/gistexec`.

#### Use solid software engineering with documentation and tests hosted with appropriate technologies.

The kernel gateway has a suite of unit and integration tests that are run automatically on Travis on every PR and merge to master.

The documentation for the kernel gateway currently resides in a single README. The document links to docs for various other Jupyter projects to explain the details of the Jupyter protocol and REST APIs. If and when the documentation becomes significantly larger, it can easily migrate to ReadTheDocs or another appropriate site.

#### Demonstrate continued growth and development.

See "Have an active developer community that offers a sustainable model for future development."

#### Integrate well with other official Subprojects.

The kernel gateway is a `jupyter/jupyter_core#Application` that uses programmatic APIs from `jupyter/notebook` to enable communication with Jupyter kernels like `ipython/ipykernel`. By definition, it integrates with other official Subprojects.

#### Be developed according to the Jupyter governance and contribution model.

The kernel gateway is in the Jupyter Incubator, and under the Jupyter governance and contribution model since its inception.

#### Have a well-defined scope.

The purpose of the kernel gateway is to provide web-friendly means of accessing kernels. Only features that fit this definition have been included.

#### Be packaged using appropriate technologies such as pip, conda, npm, bower, docker, etc.

The kernel gateway is packaged using setup tools, released in both source and wheel format on PyPI, and installable using `pip`. There is also a `jupyter/minimal-kernel` Docker image that can be used as a base image for combining the kernel gateway with any Jupyter kernel.

## Pros and Cons

* Pro: All of the complex functionality for spawning and bridging Websocket to ZeroMQ comes from the Jupyter `notebook` package and is not reimplemented here.
* Con: The kernel gateway does not yet support a clean interface for plugging in additional APIs, transports, and protocols for accessing kernels. The two existing modes are "baked in".

## Interested Contributors

@parente, @rgbkrk
