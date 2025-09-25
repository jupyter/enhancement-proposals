---
title: Adding optional field `execution_state` to `kernel_info_reply` representing shell execution status
authors: Boyuan Deng (@dby-tmwctw), Jason Grout (@jasongrout)
issue-number: 132
pr-number: In Progress
date-started: 2025-09-24
---

# Adding optional field `execution_state` to `kernel_info_reply` representing shell execution status

## Summary

We propose adding a new optional field `execution_state` to `kernel_info_reply` representing shell execution status, enabling clients to actively poll for execution status in addition to waiting for published messages in IOPub channel. To achieve that, a new class variable `execution_state` would be added to kernel class reflecting current source of truth for execution status. When client send `kernel_info_request`, value of this variable will be sent in the new field `execution_state` in `kernel_info_reply`. This field will be optional for maintaining backward compatibility for `kernel_info_reply`.

## Motivation

Currently, when a new client gets connected to an existing ipykernel (e.g. when refreshing web browser), it is not possible for the client to get the kernel's status. The client will have to make assumptions about the kernel status which, if the assumption is wrong, could lead to inconsistent states like hang commands.

In addition, when the IOPub channel gets overloaded (for example, when there are a lot of display messages, hitting the ZeroMQ high wartermark limit), the status update message kernel send could be dropped. In that case, current clients will be unable to get kernel execution status and could be put into bad states.

## Guide-level explanation

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

Discuss prior art, both the good and the bad, in relation to this proposal.
A few examples of what this can include are:

- Does this feature exist in other tools or ecosystems, and what experience have their community had?
- For community proposals: Is this done by some other community and what were their experiences with it?
- For other teams: What lessons can we learn from what other communities have done here?
- Papers: Are there any published papers or great posts that discuss this? If you have some relevant papers to refer to, this can serve as a more detailed theoretical background.

This section is intended to encourage you as an author to think about the lessons from other languages, provide readers of your JEP with a fuller picture.
If there is no prior art, that is fine - your ideas are interesting to us whether they are brand new or if it is an adaptation from other languages.


## Unresolved questions

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
