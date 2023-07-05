---
title: Jupyter Optional Features
authors: Johan Mabille (@JohanMabille)
issue-number: xxx
pr-number: 92
date-started: 2023-01-16
---

# Summary

This JEP introduces Jupyter optional features, which ease the way
a kernel advertises which features it supports, without coupling it
to the version of the protocol that it implements.

# Motivation

Some of the features that were added (the debugger) or proposed (the subshells)
may require a lot of work from kernel authors to implement. Besides, the
changes they introduce on the protocol are self-contained; it is possible for a
kernel to not support them without altering its exepected behavior regarding the
rest of the protocol, and it is easy for a client to enable or disable such a
feature as long as it knows whether the kernel supports it. By the way, the
debugger is already optional, although it does not explicitly state it.

The goal of this JEP is to introduce the notion of optional features in the protocol
and to have an explicit list of such features. This way, we do not prevent kernel
authors from upgrading to a more recent version of the protocol when we introduce
a new feature that may be complicated to implement and not mandatory for them.

# Proposed Enhancement

We propose to add a new `supported_features` field to the `kernel_info_reply` message.
This field is a list of optional features that the kernel supports. The boolean field
`debugger` should be deprecated, as it would duplicate a possible value of the list.

An optional feature can be a list of additional messages and/or a list of additional
fields in different existing messages. When a feature introduces new messages, it is
its responsibility to specify the order of these messages when it makes sense. Under
no circumstances this feature should alter the order of already existing messages,
nor interleave new messages between already existing messages.

The documentation should indicate which optional feature a message (or a field of a
message) is linked to when it is relevant. This would ease the implementation of
new kernels and the upgrade to new versions of the protocol.
