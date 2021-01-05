# Replace PUB socket with XPUB socket

## Problem

A Jupyter kernel uses a PUB socket as a broadcast channel where it publishes various messages (incoming requests, outputs, events). Any client that wants to be notified of what happens in the kernel can simply subscribe to this channel via a SUB socket. The issue with this simple PUB - SUB pattern is that the kernel has no mean to detect client subscriptions, and it will broadcast messages whether a client has subscribed or not.

This is particularly problematic when a client needs to send a bunch of execution requests just after starting a kernel (a typical use case is the "Restart Kernel and execute all" command of Jupyter Lab, or opening a Notebook with Voilà). In that case, the client needs to ensure that its SUB socket is connected to the PUB socket of the kernel before sending any execution request, otherwise it may miss some outputs. The kernel, on its side, will not emit any event until it receives a request.

## Current solution

The current solution consists of sending `kernel_info` requests until a `kernel_info` reply is received on the SHELL and an idle status message is received on the SUB socket. If the client receives a `kernel_info` reply but not the idle status message before a timeout, this means that the SUB socket has not connected yet. The client discards the reply and send a new `kernel_info` request.

This solution makes the implementation of a Jupyter client more complicated than required. Indeed, ZeroMQ provides a publisher socket that is able to detect new subscriptions.

## Proposed Enhancement

We propose to replace the PUB socket of the kernel with an XPUB socket. When it detects a new subscriber, the kernel sends a welcome message to the client. This way, the connecting sequence of the client is simplified: it only has to wait for a `kernel_info` reply and a welcome message on the SUB socket.

The welcome message should have empty parent header, metadata and content.

### Impact on existing implementations

Although this enhancement requires changing all the existing kernels, the impact should be limited. Indeed, most of the kernels are based on the kernel wrapper approach, or on xeus.

Most of the clients are based on the Jupyter Server. Therefore,
the changes should be limited to this repository and to the notebook.

A transition period where clients support both mechanisms should allow kernels to gradually migrate to the new version of the protocol.

## Relevant Resources (GitHub repositories, Issues, PRs)

### GitHub repositories

- Jupyter Client: https://github.com/jupyter/jupyter_client
The Jupyter protocol client APIs
- Jupyter Server: https://github.com/jupyter-server/jupyter_server
The backend to Jupyter web applications
- Jupyter Notebook: https://github.com/jupyter/notebook
The Jupyter interactive notebook
- IPyKernel: https://github.com/ipython/ipykernel
IPython kernel for Jupyter
- Xeus: https://github.com/jupyter-xeus/xeus
The C++ implementation of the Jupyter kernel protocol

### GitHub Issues

- Main issue in jpuyter_client: SUB sockets take time to subscribe to the IOPub channel and miss important messages (https://github.com/jupyter/jupyter_client/issues/593)
- Related issue in Xeus for implementation detail: Implement Last Value Cache pattern for iopub (https://github.com/jupyter-xeus/xeus/issues/266)

### GitHub Pull Requests

- in jupyter_client: retry kernel_info_requests in wait_for_ready (https://github.com/jupyter/jupyter_client/pull/592)
- in jupyter_server: Nudge kernel with info request until we receive IOPub messages (https://github.com/jupyter-server/jupyter_server/pull/361)
- in notebook: ensure iopub subscriptions propagate prior to accepting websocket connections (https://github.com/jupyter/notebook/pull/5908)
