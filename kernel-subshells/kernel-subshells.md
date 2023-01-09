---
title: Jupyter kernel sub-shells
authors: David Brochart (@davidbrochart), Sylvain Corlay (@SylvainCorlay), Johan Mabille (@JohanMabille)
issue-number: XX
pr-number: XX
date-started: 2022-12-15
---

# Summary

This JEP introduces kernel sub-shells to allow for concurrent shell requests. This is made possible
by defining new control channel messages, as well as a new shell ID field in shell messages.

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

Unfortunately, it is currently not possible to do so because the kernel cannot process other
[shell requests](https://jupyter-client.readthedocs.io/en/stable/messaging.html#messages-on-the-shell-router-dealer-channel)
until it is idle. The goal of this JEP is to offer a way to process shell requests concurrently.

# Proposed Enhancement

The [kernel protocol](https://jupyter-client.readthedocs.io/en/stable/messaging.html) only allows
for one
[shell channel](https://jupyter-client.readthedocs.io/en/stable/messaging.html#messages-on-the-shell-router-dealer-channel)
where execution requests are queued. Accepting other shells would allow users to connect to a kernel
and submit execution requests that would be processed in parallel.

We propose to allow the creation of optional "sub-shells", in addition to the current "main shell".
This will be made possible by adding new message types to the
[control channel](https://jupyter-client.readthedocs.io/en/stable/messaging.html#messages-on-the-control-router-dealer-channel)
for:
- creating a sub-shell,
- deleting a sub-shell,
- listing existing sub-shells.

A sub-shell should be identified with a shell ID, either provided by the client in the sub-shell
creation request, or given by the kernel in the sub-shell creation reply. The shell ID of the
targeted sub-shell must then be sent along with any shell message. This allows any other client
(console, notebook, etc.) to use this sub-shell. If no shell ID is sent, the message targets the
main shell. Sub-shells are thus multiplexed on the shell channel through the shell ID, and it is the
responsibility of the kernel to route the messages to the target sub-shell according to the shell
ID.

Essentially, a client connecting through a sub-shell should see no difference with a connection
through the main shell, and it does not need to be aware of it. However, a front-end should provide
some visual information indicating that the kernel execution mode offered by the sub-shell has to be
used at the user's own risks. In particular, because sub-shells may be implemented with threads, it
is the responsibility of users to not corrupt the kernel state with non thread-safe instructions.

# New control channel messages

## Create sub-shell

Message type: `create_subshell_request`:

```py
content = {
    # Optional, the ID of the sub-shell if specified by the client.
    'shell_id': str
}
```

Message type: `create_subshell_reply`:

```py
content = {
    # 'ok' if the request succeeded or 'error', with error information as in all other replies.
    'status': 'ok',

    # The ID of the sub-shell, same as in the request if specified by the client, given by the
    # kernel otherwise.
    'shell_id': str
}
```

## Delete sub-shell

Message type: `delete_subshell_request`:

```py
content = {
    # The ID of the sub-shell.
    'shell_id': str
}
```

Message type: `delete_subshell_reply`:

```py
content = {
    # 'ok' if the request succeeded or 'error', with error information as in all other replies.
    'status': 'ok',
}
```

## List sub-shells

Message type: `list_subshell_request`: no content.

Message type: `list_subshell_reply`:

```py
content = {
    # A list of sub-shell IDs.
    'shell_id': [str]
}
```

# Behavior

## Kernels not supporting sub-shells

The following requests should be ignored: `create_subshell_request`, `delete_subshell_request` and
`list_subshell_request`. A `shell_id` passed in any shell message should be ignored. This ensures
that existing kernels don't need any change to be compatible with the kernel protocol changes
required by this JEP.

This means that all shell messages are processed in the main shell, i.e. sequentially.

Since sub-shells are basically a "no-op", the behavior around
[kernel restart](https://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-shutdown) and
[kernel interrupt](https://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-interrupt)
is unchanged.

## Kernels supporting sub-shells

A sub-shell request may be processed concurrently with other shells. Within a sub-shell, requests
are processed sequentially.

A [kernel restart](https://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-shutdown)
should delete all sub-shells. A
[kernel interrupt](https://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-interrupt)
should interrupt the main shell and all sub-shells.
