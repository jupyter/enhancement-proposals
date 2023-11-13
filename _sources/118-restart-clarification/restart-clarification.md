---
title: Restart Clarification
authors: Marc Udoff (@mlucool)
issue-number: [#117](https://github.com/jupyter/enhancement-proposals/issues)
pr-number: [#118](https://github.com/jupyter/enhancement-proposals/pull/118)
date-started: 2023-08-23
---

# Summary

The jupyter client protocol around what "restart" means is ambiguous. Per Jupyter Client's [kernel shutdown documention](https://jupyter-client.readthedocs.io/en/latest/messaging.html#kernel-shutdown), the only guidance is:
>  'restart' : bool # False if final shutdown, or True if shutdown precedes a restart

This has led to a situation where certain jupyter subprojects (e.g. enterprise gateway) have interpreted this to mean a "hard restart", or restart the whole process tree.

We propose to clarify this to always mean "restart-in-place", that is only restart the kernel itself. For
most usage of Jupyter, this change is a no-op as subprocess kernels already act like this.

# Motivation

This greatly improves the usability of remote kernels whose startup includes scheduling. By making this change,
restarts for remote kernels will be nearly as fast as those of local kernels. It also matches what we
believe to be the mental model of users when they click "restart".

# Guide-level explanation

The [protocol](https://jupyter-client.readthedocs.io/en/latest/messaging.html#kernel-shutdown) would describe
restart as optimally preserving as many resources outside the kernel as possible (e.g. restarting only the kernel process and its subprocess *not* any parent process).

When the kernel is a toplevel process (e.g. local kernels), there is no change.

When the kernel is not a toplevel process (e.g. when used in Enterprise Gateway), restart often means only the kernel restarts. To restart the whole progress group, the stop and start messages could be used. It's up to UIs
for how to display this difference (if any).

# Reference-level explanation

The `jupyter-client` messaging page would be updated to indicate this nuance. Any implementations that
treat restart differently would be updated to match this clarification.

# Rationale and alternatives

A new message could be added, as proposed in the pre-JEP. In the [Jupyter Server meeting](https://github.com/jupyter-server/team-compass/issues/45#issuecomment-1682582186),
we concluded that is is likely most users want restart to only restart the kernel and not potentially reschedule resources. Therefore, a new message was not the best option.
For the vast majority of kernels (local subprocesses), this change is a no-op because restart-in-place
is the same as a hard restart since it is the toplevel kernel process.

For users that want a hard restart, a stop followed by a start continues to be available. While this may be less convenient, a UI can trivially hide this two call process from the user.

# Prior art

N/A

# Unresolved questions

Only the exact wording changes as proposed in [jupyter_client](https://github.com/jupyter/jupyter_client/pull/966).

# Future possibilities

We would make a service that implements a "hard restart" as discussed in the jupyter-server meeting.
No one on the meeting had an immediate use case for it.
