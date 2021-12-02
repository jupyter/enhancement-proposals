# Jupyter debugger protocol

| Item       | Value                                                                                                                        |
|------------|------------------------------------------------------------------------------------------------------------------------------|
| Title      | Jupyter Debugger Protocol                                                                                                    |
| Authors    | Sylvain Corlay ([@SylvainCorlay](https://github.com/SylvainCorlay)) and Johan Mabille ([@JohanMabille](https://github.com/JohanMabille))|
| Status     | Draft                                                                                                                        |
| Type       | S - [Standards Track](https://www.python.org/dev/peps/#pep-types-key) JEP                                                    |
| Created    | January 1st, 2020                                                                                                            |

## Problem

Jupyter users like to experiment in the notebook, but for more classical software development tasks such as the refactoring of a large codebase, they often switch to a general-purpose IDE. One of the main reasons for switching to other tools is the lack of a visual debugger in Jupyter, with the ability to set breakpoints, step into code, inspect variables, etc. A visual debugger for Jupyter has been a long-standing request from the community.

One available feature in the case of the IPython kernel is [%debug magic](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-debug), which can be used both interactively, or for post-mortem analysis, and provides a command-line interface to pdb in Jupyter front-ends.

The absence of a visual debugger was also one of the main pain points for users accustomed to classical IDEs, for whom the main way to enable an interactive workflow was to run their code in a debugger.

The development of a visual debugger for Jupyter required both front-end and back-end work, including additions to the Jupyter kernel protocol. We have been making strides in all aspects of the project over the past few months and made a first release of the Jupyter debugger. This Jupyter Enhancement Proposal is meant to summarize the main changes, and more importantly, to **include the extensions to the Jupyter kernel protocol in the official specification**.

## Proposed Enhancement

We propose to include the extensions to the Jupyter kernel protocol implemented in `jupyter-xeus/xeus-python` and in `jupyterlab/debugger` into the official specification for the Jupyter kernel protocol.

### New messages on the Control and IOPub channel

Current communication channels with the kernel include the **Shell** channel, which is used for *e.g.* execution requests, and the **IOPub** channel, which is a one-directional communication channel from the kernel to the client, and is used to *e.g.* forward the content of the standard output stream (stdout and stderr).

The **Control** channel is similar to Shell but operates on a **separate socket so that messages are not queued behind execution requests**, and have a higher priority.  Control was already used for Interrupt and Shutdown requests, and we decided to use the same channel for the commands sent to the debugger.

Two message types are added to the protocol:

 - the `debug_[request|reply]` to request specific actions to be performed by the debugger such as adding a breakpoint or stepping into a code, which is sent to the **Control** channel.
 - the `debug_event` uni-directional message used by kernels to send debugging events to the front-end, such as a breakpoint being reached in a thread. Debug events are sent over the **IOPub** channel.

All debugging commands and events are communicated through these event types.

### The Debug Adapter Protocol

A requirement for any addition to the Jupyter kernel protocol is to preserve the **language agnosticism** of the Jupyter architecture.

A popular language-agnostic standard for debugging is Microsoft's [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/specification) (DAP), which is a JSON-based protocol underlying the debugger of Visual Studio Code, and for which there already exist multiple language back-ends. The Debug Adapter Protocol has three main message types: `Request`, `Response`, and `Event`.

Our proposal is for the `content` attribute of the `debug_[request|reply]` to be the content of the `Request` and `Response` messages from the DAP, and for the `content` attribute of the `debug_event` to the `Event` message from the DAP.

This approach will allow kernel authors to use one of the [many implementations of the DAP](https://microsoft.github.io/debug-adapter-protocol/implementors/adapters/).

### Additions to the Debug Adapter Protocol

We make two notable additions to the Debug Adapter Protocol.

- In order to support page reloading, or a client connecting at a later stage, Jupyter kernels must store the state of the debugger (breakpoints, whether the debugger is currently stopped).
- In order to support the debugging of notebook cells and of Jupyter consoles, which are not based on source files, we also needed messages to submit code to the debugger to which breakpoints can be added.

Both message types follow the same schema as the other `debug_[request|reply]` messages ported from the Debug Adapter Protocol.

### A new field in the `kernel_info_reply` message

The kernel info reply has a new optional boolean field indicating whether the kernel implements the Jupyter Debug Protocol.

## Implementation

We provide both a front-end and a kernel implementation for the Jupyter kernel protocol. The front-end is a JupyterLab extension, which is available at URL https://github.com/jupyterlab/debugger, and the back-end is implemented as part of the xeus-python kernel, which is a kernel for the Python programming language available at URL https://github.com/jupyter-xeus/xeus-python.

Together, they provide a rather typical experience of a visual debugger in JupyterLab:

![screencast](debugger-screencast.gif)

Typescript classes for the Debug Adapter Protocol message types are available in the MIT-licensed [vscode-debugadapter-node](https://github.com/microsoft/vscode-debugadapter-node/) package, which we were able to leverage in the debugger front-end implementation.
 
## Relevant Resources (GitHub repositories, Issues, PRs)

### GitHub repositories

- The JupyterLab debugger extension: https://github.com/jupyterlab/debugger

  This is the first implementation of a debugger front-end supporting the described protocol

- The Xeus-Python Jupyter kernel: https://github.com/jupyter-xeus/xeus-python

  This is the first Jupyter kernel implementing the proposed kernel protocol extensions. Xeus-python is a kernel for the Python programming language.

### GitHub Issues

- Master issue by Johan Mabille ([@JohanMabille](https://github.com/johanmabille)) on the different steps towards supporting the Debug Adapter Protocol in Jupyter: https://github.com/jupyter/jupyter_client/issues/446

### GitHub Pull Requests

In jupyter_client:

- Adding `debug_[request|reply]` and `debug_event` to the Jupyter kernel protocol: https://github.com/jupyter/jupyter_client/pull/464
- Debug adapter protocol: https://github.com/jupyter/jupyter_client/pull/502

In jupyter_server and notebook:

- Added control channel to ZMQChannelsHandler: https://github.com/jupyter/jupyter_server/pull/56
- The same change in the classic notebook server: https://github.com/jupyter/notebook/pull/4672

In JupyterLab:

- Adds interface for messages sent on the Control channel: https://github.com/jupyterlab/jupyterlab/pull/6544
- Adding debug messages: https://github.com/jupyterlab/jupyterlab/pull/6704

In Xeus:

 - There has been a significant number of pull requests in the core xeus library for abstracting out the debug protocol and simplifying its support in other xeus-based kernels.

Old resources for past discussions on the debugger:

 - The debugger repository in the jupyter-attic repository holds a number of discussions about the implementation of a visual debugger for Jupyter. The repository has been archived.  https://github.com/jupyter-attic/debugger
 - The archived jupyterlab-debugger repository from the QuantStack organization holds the early front-end work by Jeremy Tuloup that was used for the first iterations on a JupyterLab extension: https://github.com/QuantStack/jupyterlab-debugger/

## Interested Parties

@SylvainCorlay, @JohanMabille, @Afshin, @jtpio, @martinRenou, @KsavinN
