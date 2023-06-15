---
title: Replace PUB socket with XPUB socket
authors: Johan Mabille (@JohanMabille)
issue-number:
pr-number: 65
date-started: 2021-01-05
---

# Replace PUB socket with XPUB socket

## Problem

A Jupyter kernel uses a PUB socket as a broadcast channel where it publishes various messages (incoming requests, outputs, events). Any client that wants to be notified of what happens in the kernel can simply subscribe to this channel via a SUB socket. The issue with this simple PUB - SUB pattern is that **there is no simple mechanism for clients to wait for their iopub subscription to be established.**

This is particularly problematic when a client needs to send a bunch of execution requests just after starting a kernel (a typical use case is the "Restart Kernel and execute all" command of Jupyter Lab, or opening a Notebook with Voilà). In that case, the client needs to ensure that its SUB socket is connected to the PUB socket of the kernel before sending any execution request, otherwise it may miss some outputs. The kernel, on its side, will not emit any event until it receives a request.

## Current solution

The current solution consists of sending `kernel_info` requests until a `kernel_info` reply is received on the SHELL and an idle status message is received on the SUB socket. If the client receives a `kernel_info` reply but not the idle status message before a timeout, this means that the SUB socket has not connected yet. The client discards the reply and send a new `kernel_info` request.

This solution makes the implementation of a Jupyter client more complicated than required. Indeed, ZeroMQ provides a publisher socket that is able to detect new subscriptions.

## Proposed Enhancement

We propose to replace the PUB socket of the kernel with an XPUB socket. XPUB sockets receive the following events:
- subscribe (single frame messages with `\1{subscription-topic}`)
- unsubscribe (single frame messages with `\0{subscription-topic}`)

When the IOPub XPUB socket receives an event indicating a new subscription, it shall send an `iopub_welcome` message with no parent header and the received
subscription in the `subscription` field, *with the given subscription topic*:

```
identity_prefix: ["subscription-topic"]
parent_header: {}
header: {
    "msg_type": "iopub_welcome"
}
content: {
    "subscription": "subscription-topic"
}
metadata: {}
```

Notes:

- The identity prefix may contain extra information about the message, such as the kernel id, according to the convention used in the IPython kernel:
```kernel.{u-u-i-d}.subscription-topic```.
- Subscriptions can be empty (this is almost always the case). An empty subscription means subscribing to all IOPub messages.
- Subscriptions shall be UTF-8 encoded. Non-utf8 subscriptions shall be ignored, and not produce a welcome message.
- Every subscribed client will receive every other client's welcome message, assuming they match existing subscriptions (e.g. empty strings)
- Welcome messages do not and cannot identify the client whose subscription is being received. Receipt of an iopub_welcome message with your subscription does not mean it is in response to your own subscription. However, receiving a message does mean that a matching subscription has been registered for your client, otherwise no message will be received. So if only one subscription is registered, as is normally the case, receiving any welcome message is sufficient to indicate that your client's subscription is fully established. The gist is that receiving a welcome message is a sufficient condition to establish the subscription-propagation event, and additional welcome messages should be expected and ignored.
- Unsubscribe events are ignored.

### Impact on existing implementations

Although this enhancement requires changing all the existing kernels, the impact should be limited. Indeed, most of the kernels are based on the kernel wrapper approach, or on xeus.

Regarding clients, this change is backward-incompatible only when they start assuming a welcome message will come. Clients not aware of
the new message will just get an unrecognized iopub message they can safely ignore.

Most of the clients are based on the Jupyter Server. Therefore, the changes should be limited to this repository and to the notebook. The new
recommended starting procedure is:

1. always probe with a single `kernel_info_request` (required for protocol adaptation)
2. check protocol version in reply
    i. if welcome message is supported, wait for it on iopub
    ii. if not:
        a. use current request & wait loop (recommended, especially for current clients that already have this implemented)
        b. accept and warn about possible loss of early iopub messages for 'old' kernels ((increasingly common over time as protocol updates can be more safely assumed, especially for new clients


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

- Main issue in jupyter_client: SUB sockets take time to subscribe to the IOPub channel and miss important messages (https://github.com/jupyter/jupyter_client/issues/593)
- Related issue in Xeus for implementation detail: Implement Last Value Cache pattern for iopub (https://github.com/jupyter-xeus/xeus/issues/266)

### GitHub Pull Requests

- in jupyter_client: retry kernel_info_requests in wait_for_ready (https://github.com/jupyter/jupyter_client/pull/592)
- in jupyter_server: Nudge kernel with info request until we receive IOPub messages (https://github.com/jupyter-server/jupyter_server/pull/361)
- in notebook: ensure iopub subscriptions propagate prior to accepting websocket connections (https://github.com/jupyter/notebook/pull/5908)
