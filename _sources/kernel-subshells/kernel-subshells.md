---
title: Jupyter kernel subshells
authors: David Brochart (@davidbrochart), Sylvain Corlay (@SylvainCorlay), Johan Mabille (@JohanMabille), Ian Thomas (@ianthomas23)
issue-number: XX
pr-number: 91
date-started: 2022-12-15
---

# Summary

This JEP introduces kernel subshells to allow for concurrent shell requests.

# Motivation

Users have been asking for ways to interact with a kernel while it is busy executing CPU-bound code,
for the following reasons:
- inspect the kernel's state to check the progress or debug a long-running computation (e.g.
  through a variable explorer).
- visualize intermediary results before the final result is computed.
- request [completion](https://jupyter-client.readthedocs.io/en/stable/messaging.html#completion) or
  [introspection](https://jupyter-client.readthedocs.io/en/stable/messaging.html#introspection).
- process
  [Comm messages](https://jupyter-client.readthedocs.io/en/stable/messaging.html#custom-messages)
  immediately (e.g. for widgets).
- execute arbitrary code in parallel.

It is currently not possible to do so because the kernel processes shell requests sequentially.
Since the control channel has had its own thread it has been possible to use the control channel
for such interactions, but this is considered bad practice as it should only be used for control
purposes, and the processing of those messages should be almost immediate.

The goal of this JEP is to offer a way to process shell requests concurrently.

# Proposed enhancement: kernel subshells

The proposal is to support extra threads within a kernel as a JEP 92
[optional feature](https://github.com/jupyter/enhancement-proposals/blob/master/92-jupyter-optional-features/jupyter-optional-features.md) so that whilst the main thread is performing a long blocking task it
will be possible for other threads to do something useful within the same process namespace.

When a kernel that supports subshells is started it will have a single subshell and this is referred
to as the parent subshell to distinguish it from the other optional subshells which are referred to
as child subshells.

A new child subshell thread is started using a new `create_subshell_request` control message rather
than via the REST API. Each subshell has a `subshell_id` which is a unique identifier within that
kernel. The `subshell_id` of a child subshell is generated when the subshell is created and
returned in the `create_subshell_reply` message. The parent subshell has a `subshell_id` of `None`.
[Shell messages](https://jupyter-client.readthedocs.io/en/stable/messaging.html#messages-on-the-shell-router-dealer-channel)
include the `subshell_id` as an optional field in the message header to indicate which subshell the
message should be sent to; if this is not specified or is `None` then the parent
subshell is targeted. Use of a `subshell_id` that is not recognised will raise an error.
Subshells are thus multiplexed on the shell channel through the `subshell_id`, and it is the
responsibility of the kernel to route the messages to the target subshell according to the
`subshell_id`.

Note a kernel that does not support `subshell_id` will just ignore the field if it is present and
run in the main thread.

[Stdin messages](https://jupyter-client.readthedocs.io/en/stable/messaging.html#messages-on-the-stdin-router-dealer-channel)
will also include the extra optional `subshell_id` field so that it is possible for a subshell to
request and receive stdin independently of other subshells.

Each subshell will store its own execution count and history.

## Modifications to existing messages

### Identify optional feature

Clients identify if a kernel supports subshells via the
[optional feature API](https://github.com/jupyter/enhancement-proposals/blob/master/92-jupyter-optional-features/jupyter-optional-features.md):

Message type: `kernel_info_reply`:

```py
content = {
    ...
    'supported_features': [
        'kernel subshells',
        ...
    ]
}
```

The full API for optional features is still to be determined, so the details here may change.
In particular, there is probably the need for a version specifier here to allow future changes to
the kernel subshells specification.

## New control channel messages

### Create subshell

Message type: `create_subshell_request`: no content.

Message type: `create_subshell_reply`:

```py
content = {
    # 'ok' if the request succeeded or 'error', with error information as in all other replies.
    'status': 'ok',

    # The ID of the subshell.
    'subshell_id': str,
}
```

### Delete subshell

Message type: `delete_subshell_request`:

```py
content = {
    # The ID of the subshell.
    'subshell_id': str
}
```

Message type: `delete_subshell_reply`:

```py
content = {
    # 'ok' if the request succeeded or 'error', with error information as in all other replies.
    'status': 'ok',
}
```

### List subshells

Message type: `list_subshell_request`: no content.

Message type: `list_subshell_reply`:

```py
content = {
    # A list of subshell IDs.
    'subshell_id': [str]
}
```

Note that the parent subshell (`subshell_id = None`) is not included in the returned list.

## New fields on existing messages

### Shell and stdin requests

All shell and stdin messages will allow the optional `subshell_id` field in the request to identify
which subshell should process that message:

```py
content = {
    # Optional subshell to process request.
    'subshell_id': str | None,
}
```

This field is not in the corresponding reply message as it will be in the parent header.

### IOPub messages

IOPub messages do not need an extra optional `subshell_id` field as this information is available
in the parent header.

## Behavior

### Kernels supporting subshells

A subshell request may be processed concurrently with other subshells. Within a an individual
subshell, requests are processed sequentially.

[Kernel shutdown](https://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-shutdown)
and [kernel interrupt](https://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-interrupt)
messages are handled at the kernel (process) rather than subshell (thread) level, and they do not
include a `subshell_id` field. A child subshell can be individually shut down using a
`delete_subshell_request` message.

### Kernels not supporting subshells

These will not claim support for kernel subshells via the optional features API. Unrecognised shell
request messages, such as the subshell request messages listed above, will be ignored as normal.
Any use of a `subshell_id` field in a message will be ignored. Hence existing kernels that do not
support kernel subshells will continue to work as they currently do and will not require any
changes.

## Implications for other projects

Kernel writers who wish to support subshells will need to write extra threading and socket
management code. `ipykernel` will contain a reference implementation.

Any client that wishes to create a subshell will have to issue a `create_subshell_request` control
message, and pass the `subshell_id` in all relevant shell and stdin messages.

There will need to be some sort of visual indicator for subshells in, for example, the JupyterLab
UI, but this is not strictly speaking part of the JEP.
