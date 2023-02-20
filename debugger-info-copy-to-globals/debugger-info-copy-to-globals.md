---
title: Debugger support to copyToGlobals
authors: Nicolas Brichet (@brichet)
issue-number: xxx
pr-number: xxx
date-started: 2023-02-20
---

# Summary

This JEP introduces a new field to the kernel debugger_info response. This new
field will inform the UI that the debugger supports the `copyToGlobals` request.

# Motivation

The `copyToGlobals` request has been introduced in
[ipykernel](https://github.com/ipython/ipykernel/pull/1055) and in
[xeus-python](https://github.com/jupyter-xeus/xeus-python/pull/562) to copy a local
variable to the global scope during a breakpoint. It would be useful to inform the
UI if this is supported by the kernel before displaying the corresponding menu entry.

# Proposed Enhancement

We propose to add a new `copyToGlobals` boolean field to the `debugger_info`
response which will inform the UI that this request is supported.
