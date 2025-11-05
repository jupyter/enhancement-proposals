---
title: Adding optional field `execution_state` to `kernel_info_reply` representing shell execution status
authors: Boyuan Deng (@dby-tmwctw), Jason Grout (@jasongrout)
issue-number: 132
pr-number: 134
date-started: 2025-09-24
---

# Adding optional field `execution_state` to `kernel_info_reply` representing shell execution status

## Summary

We propose adding a new optional field `execution_state` to `kernel_info_reply` representing main shell execution status, enabling clients to actively poll for execution status in addition to waiting for published messages in IOPub channel. To achieve that, a new class variable `execution_state` would be added to kernel class reflecting current source of truth for execution status. When client send `kernel_info_request`, value of this variable will be sent in the new field `execution_state` in `kernel_info_reply`. This field will be optional for maintaining backward compatibility for `kernel_info_reply`.

## Motivation

Currently, when a new client gets connected to an existing ipykernel (e.g. when refreshing web browser), it is not possible for the client to get the kernel's status. The client will have to make assumptions about the kernel status which, if the assumption is wrong, could lead to inconsistent states like hang commands.

In addition, when the IOPub channel gets overloaded (for example, when there are a lot of display messages, hitting the ZeroMQ high wartermark limit), the status update message kernel send could be dropped. In that case, current clients will be unable to get kernel execution status and could be put into bad states.

## Guide-level explanation

A new optional field called `execution_state` will be added to the `kernel_info_reply` message. `execution_state` will represent the status of main shell channel, which is responsible for command execution. The field is optional to keep `kernel_info_reply` backward compatible.

Values of the optional field `execution_state` should be the [kernel status](https://jupyter-client.readthedocs.io/en/latest/messaging.html#kernel-status) specified in Jupyter protocol, i.e. `execution_state : ('busy', 'idle', 'starting')`. It represents source-of-truth for kernel status would be updated:
- Whenever main shell channel publishes any status to IOPub channel
- To `idle` whenever kernel stopped handling current command execution request. In some cases, `dispatch_shell` returns without publishing any status as it's either not possible (e.g. session is `None`), or not secure (e.g. deserialization step fails). In this case, we still want to update `execution_state` as kernel is ready for next execution request.

This enables Jupyter client to actively poll for execution status on main shell channel, in addition to passively waiting for status update on IOPub channel. Developers hence have the option to directly reach out to kernel for status, in cases where message publishing mechanism met problem (e.g. when High Water Mark is hit and messages are randomly dropped), or when a new client connect to an already running kernel. The proposal is a strict augmentation to current kernel status communication mechanism and does not modify current mechanism. The intention is to provide an alternative when current mechanism fails.

### Example 1

Here is a specific example illustrating how the proposal could be useful when current kernel status communication mechanism fails:

We receive user complain where their commands kept running and would not terminate. Upon inspection, it's discovered that the `deserialize` step in `dispatch_shell` failed after kernel received the command execution request. As a result, kernel silently returned from `dispatch_shell` without publishing any status update. The Jupyter client, not seeing any update, assumed that the command execution is still going on and result in a hung command.

If we have the new field `execution_state` in place, the Jupyter client can potentially ping Jupyter kernel after a long period of time to confirm whether the command is still running. In this case, it will discover that the kernel is already in `idle` state, and able to stop the hung command

### Example 2

Another specific example to illustrate how the proposal could be useful:

Some of the users are sending a large amount (or some large size) display messages leading to the underlying ZeroMQ channel for IOPub channel to reach High Water Mark and arbitrarily dropping messages. Unfortunately, the kernel status messages are among the dropped message, and the Jupyter client never got any updates for current execution.

If we have the new field `execution_state` in place, the Jupyter client can potentially send `kernel_info_request` to Control channel (enabled by [Support kernel_info request on the control channel](https://jupyter.org/enhancement-proposals/80-kernel-info/kernel-info.html#support-kernel-info-request-on-the-control-channel)) to get the kernel execution status.

Explain the proposal as if it was already implemented and you were
explaining it to another community member. That generally means:

- Introducing new named concepts.
- Adding examples for how this proposal affects people's experience.
- Explaining how others should *think* about the feature, and how it should impact the experience using Jupyter tools. It should explain the impact as concretely as possible.
- If applicable, provide sample error messages, deprecation warnings, or migration guidance.
- If applicable, describe the differences between teaching this to existing Jupyter members and new Jupyter members.

For implementation-oriented JEPs, this section should focus on how other Jupyter
developers should think about the change, and give examples of its concrete impact. For policy JEPs, this section should provide an example-driven introduction to the policy, and explain its impact in concrete terms.

## Reference-level explanation

Internally, `execution_state` would be a new class variable to the `Kernel` class in `kernelbase.py`. It will be initialized to `None`, and updated whenever main shell publish status update to IOPub channel (to be specific, whenever `_publish_status` is called on `shell` channel). It will be updated to the kernel status published (i.e. first argument of `_publish_status`). In cases where `dispatch_shell` returns without publishing any status (when it's impossible or insecure), we assume the kernel is ready for next execution request and update `execution_state` to `idle`.

The `kernel_info` property of `Kernel` class will then be updated with a new key-value pair `"execution_state": self.execution_state`. When processing `kernel_info_request`, `execution_state` will be packed alongside other `kernel_info` and send back as part of `kernel_info_reply`.

This is the technical portion of the JEP. Explain the design in
sufficient detail that:

- Its interaction with other features is clear.
- It is reasonably clear how the feature would be implemented.
- Corner cases are dissected by example.

The section should return to the examples given in the previous section, and explain more fully how the detailed proposal makes those examples work.

## Rationale and alternatives

- Why is this choice the best in the space of possible designs?
- What other designs have been considered and what is the rationale for not choosing them?
- What is the impact of not doing this?

## Prior art

Poll-based status update is a widely-used and well-known client-server communication pattern in software engineering known for its reliability in client's perspective. In this case, Jupyter kernel is the server for command execution. When the pub-sub communication pattern for kernel status update fails, it would be good to have a poll-based communicatioin mechanism in place for higher reliability.

Discuss prior art, both the good and the bad, in relation to this proposal.
A few examples of what this can include are:

- Does this feature exist in other tools or ecosystems, and what experience have their community had?
- For community proposals: Is this done by some other community and what were their experiences with it?
- For other teams: What lessons can we learn from what other communities have done here?
- Papers: Are there any published papers or great posts that discuss this? If you have some relevant papers to refer to, this can serve as a more detailed theoretical background.

This section is intended to encourage you as an author to think about the lessons from other languages, provide readers of your JEP with a fuller picture.
If there is no prior art, that is fine - your ideas are interesting to us whether they are brand new or if it is an adaptation from other languages.


## Unresolved questions

- The kernel goes to `starting` state after kernel start-up, and no `idle` message is published after that. Do we treat `starting` synonymous with `idle` with respect to command execution? Or, we should publish an `idle` message after the kernel has fully started? Or, should we abolish `starting` entirely as currently it's published right at the end of kernel's `start` method? Or, should we publish `starting` at the start of kernel's `start` method, and publish `idle` at the end of kernel's `start` method? Expecially in the case of a slow-starting kernel, the distinction between `starting` and `idle` might be significant in the way that the kernel might not be able to accept execution request in `starting` state.
- When information from `kernel_info_reply` conflicts with the kernel status published in IOPub (for example, in cases where channels are congested and slow), which one takes priority over the other?

- What parts of the design do you expect to resolve through the JEP process before this gets merged?
- What related issues do you consider out of scope for this JEP that could be addressed in the future independently of the solution that comes out of this JEP?

## Future possibilities

Think about what the natural extension and evolution of your proposal would
be and how it would affect the Jupyter community at-large. Try to use this section as a tool to more fully consider all possible
interactions with the project and language in your proposal.
Also consider how the this all fits into the roadmap for the project
and of the relevant sub-team.

This is also a good place to "dump ideas", if they are out of scope for the
JEP you are writing but otherwise related.

If you have tried and cannot think of any future possibilities,
you may simply state that you cannot think of anything.

Note that having something written down in the future-possibilities section
is not a reason to accept the current or a future JEP; such notes should be
in the section on motivation or rationale in this or subsequent JEPs.
The section merely provides additional information.
