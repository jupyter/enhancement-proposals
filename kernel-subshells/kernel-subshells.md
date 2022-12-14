---
title: Jupyter kernel sub-shells
authors: David Brochart (@davidbrochart), Sylvain Corlay (@SylvainCorlay), Johan Mabille (@JohanMabille)
issue-number: XX
pr-number: XX
date-started: 2022-12-15
---

# Summary

This JEP introduces kernel sub-shells to allow for concurrent code execution. This is made possible
by defining new control channel messages, as well as a new shell ID field in shell channel messages.

# Motivation

Users have been asking for ways to interact with a kernel while it is busy executing CPU-bound code,
for the following reasons:
- inspect the kernel's state to check the progress or debug a long-running computation.
- visualize some intermediary result before the final result is computed.

Unfortunately, it is currently not possible to do so because the kernel cannot process other
[execution requests](https://jupyter-client.readthedocs.io/en/stable/messaging.html#execute) until
it is idle. The goal of this JEP is to offer a way to run code concurrently.

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

A sub-shell should be advertised to the client with a shell ID, which must be sent along with
further messages on the shell channel in order to target a sub-shell. This allows any other client
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

Message type: `create_subshell_request`: no content.

Message type: `create_subshell_reply`:

```py
content = {
    # 'ok' if the request succeeded or 'error', with error information as in all other replies.
    'status': 'ok',

    # The ID of the sub-shell.
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

# Points of discussion

The question of sub-shell ownership and life cycle is open, in particular:
- Is a sub-shell responsible for deleting itself, or can a shell delete other sub-shells?
- Can a sub-shell create other sub-shells?
- Does sub-shells have the same rights as the main shell? For instance, should they be allowed to
  shut down or restart the kernel?
