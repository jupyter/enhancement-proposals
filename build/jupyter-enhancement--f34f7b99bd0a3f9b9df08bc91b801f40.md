# Jupyter Enhancement Proposals (JEP) Guidelines

**Note**: This JEP repo is the **canonical "source of truth"** for individual JEPs,
the JEP process, and activity on JEPs.

## Goals of the JEP process

Project Jupyter uses the Jupyter Enhancement Proposal process (JEP)
to address distributed collaboration and experimentation.
The primary guiding principle of the JEP process is to
encourage collaboration and discussion as early as possible in the lifecycle
of a major proposed change in Jupyter, with the goal of preventing costly rework,
competing ideas, and unnecessary forking or fragmentation of ideas.

Several sub-goals exist for this process:

- **Maximize success of large proposals** that get stalled in the wrong venue (e.g. a single PR comment thread)
- Provide a **better alternative to “piecemeal” development** where multiple PRs
  to build an end-to-end set of functionality are split across multiple GitHub
  project without broad consensus, context, or guidance.
- Provide a **clear, time-limited, and authoritative process for work proposals**,
  to facilitate funding conversations.  (e.g. provide a concrete artifact to reference
  in a grant proposal, roadmap item, etc.)
- Provide a **consolidated “stream” of all proposals across the entire Jupyter community**
  that contributors of all levels can monitor and selectively engage in.

## Tenets of the JEP process

The JEP process operates under the following tenets:

- **The JEP process is intended for changes of non-trivial scope.**
  “Non-trivial” is addressed below in the “JEP / Not-a-JEP Rubric” of this document.

- **The JEP process naturally complements the PR process, but does not replace it.**
  A thoroughly-reviewed and approved JEP is a valuable reference during a PR to
  reduce friction, reduce time-consuming context sharing, and encapsulate decisions
  and other discussions.  Moving a premature PR into a JEP should be a lightweight
  process that doesn’t cause friction for the contributor.

  For example, GitHub issue and PR templates across the entire Jupyter project should have
  references to the JEP process as a possible outcome of a given PR.

- **There is one JEP repository, all Jupyter-governed projects must use it.**
  To faciliate the easiest possible adoption and high visibility of ideas, a
  single JEP repository will be used.  Even if a JEP only applies to a single organization.

- The JEP process **has multiple valid use cases**.  Each use case might have a
  slightly different expected workflow.  Some expected use cases include:

  - Non-trivial feature proposals within a single component that would benefit from
    process.  (e.g., a non-trivial change to JupyterLab that would benefit from
    formal process within the JupyterLab project)
  - Non-trivial features or improvements that span multiple projects.
  - Any proposed changes to published APIs or core specifications (e.g., nbformat)
  - Changes to the JEP process itself.
  - Launching a major project in one of the Jupyter GitHub organizations.


## JEP Submission Workflow

The following sections describe the major checkpoints in the JEP process.
Note that at any time, the JEP author may withdraw their JEP (and if it has
been added to the README, its status becomes "withdrawn").

### Phase 1: Pre-proposal

This is the least formal stage of any jupyter enhancement proposals. During this
phase, discussions on the mailing list, community forum, in-person, on github issues
are all fine to gauge community interest, feasibility, consequences, and to
scope out technical impact and implementation details.

In order to transition out of the pre-proposal stage, the following checklist must be complete:

1. **Create a GitHub issue**  in the Jupyter Enhancement Proposals repo that
 1. Briefly outlines the proposal
 2. Suggests a review team (optional)
 3. Declares why it should be a JEP (See the “JEP / Not-a-JEP Rubric” below.)
2. **Identify a Shepherd** to see the process through. (Shepherds are assigned
   on a round-robin basis from a set of interested engaged volunteers).
3. **Decide if it's a JEP** according to the criteria listed above. The Shepherd decides if the JEP criteria have been met.

**If it's a JEP**. The JEP author creates a new PR with the contents of the JEP proposal. See [this markdown template](JEP-TEMPLATE.md) for a suggested structure of the pull-request.

Subsequent discussion and decisions about the JEP will happen in that PR, and
we now **Move to the RFC phase**.

**If it’s not a JEP**. The shepherd provides a reason for why the issue
doesn't meet JEP criteria, and closes the issue.

### Phase 2: Request for Comments for the JEP

Phase two begins when **the JEP author submits a draft of the JEP as a PR to the JEP repository**.
The Shepherd assigns a number to the JEP according to the pull-request number, and updates
the README of the JEP repository with information about the now in-progress JEP.
The Shepherd then works with the JEP author to
**identify and notify relevant individuals in the Jupyter community to review and comment**.

Once this group has been notified, the JEP process enters the RFC phase.

During the **Request For Comment (RFC) phase**, the proposal is iterated on with
feedback from the Review Team and the community at large. The Shepherd helps engage
the Review Team and encourage productive discussion. After the Review Team members
have signed off on the JEP, with the criteria that there are no major objections,
and at least some of the Review Team are in favor, the Shepherd initiates the Final Comment Period.

In the **Final Comment Period (FCP)**, the community at-large has at least 10 calendar days
to provide any final comments on the JEP. A JEP may revert back to RFC if
objections from the community are supported by the Review Team.

At the end of the FCP, the JEP is either:

* **approved**, in which case the PR is merged and work may commence on implementing the JEP (see Phase 3, below)
* **rejected**, in which case the PR is closed
* asked to return to the RFC phase.

In each case, the JEP's status should be updated in the README of the
`enhancement-proposals` repository.

### Phase 3: Work Commences

Once a JEP has been merged into the `jupyter/enhancement-proposal` repository,
implementation can commence on the JEP. The JEP author does not need to implement the JEP themselves.

If the JEP requires one or more pull-requests to be implemented, the author of the PRs should
provide a reference to the JEP so that reviewer has background context on the JEP.
As the JEP is being implemented, the JEP text should be amended with with addendums to
denote the progress of the implementation using the following stages.

1. In progress implementation via (list of PRs).
2. Fully implemented via (list of PRs).

If in the course of implementation, it is discovered that the implementation needs to
be radically different from what was defined in the original JEP, then a pull
request is submitted to modify the original JEP with the new necessary implementation,
and a note citing the need for a modification to the JEP.
This pull request should be re-approved by the original review team.

### JEP Pathways and Status

Below is a rough guide that describes the JEP process and its possible pathways.

```
                      +-----------+
                      |           |
                      | withdrawn |
                      |           |             +-----------+
                      +-----------+             |           |
                  JEP may be withdrawn          |  rejected |
                      at any stage              |           |
                                                +-----^-----+
                                                      |
                                                +------+------+
  +--------------+   +-----------+             |             |            +-------------+   +-----------+
  |              |   |           |             | Request for |            |             |   |           |
  | pre-proposal +---> submitted +------------->  Comments   +------------> in progress +---> completed |
  |              |   |           |  identify   |    (RFC)    |  approved  |             |   |           |
  +--------------+   +-----------+   review    |             |            +-------------+   +-----------+
                                      team     +------+------+
```


## What qualifies as a JEP?

This section contains a set of principles to help determine when something is a JEP.
These should be used to determine when something becomes a PR during the JEP
pre-proposal stage, as well as to determine when a PR becomes a JEP at an individual repo level.

**Principles to follow**

Below are a few example guidelines to follow when deciding if an idea should include
a JEP (If yes, it requires a JEP). Under each question is a relevant example proposal.

- Does the proposal/implementation require PRs across multiple orgs?
  - **Example:** Defining a unique cell identifier
- Does the proposal/implementation PR impact multiple orgs, or have widespread community impact?
  - **Example:** Updating nbformat
- Does the proposal/implementation change an invariant in one or more orgs?
  - **Example:** Defining a unique cell identifier
  - **Example:** Deferred kernel startup
- Does the proposal/implementation create a new concept that will impact multiple repositories?
  - **Example:** Sandboxed cell outputs
- Does the proposal involve creating a new repository or sub-project?

## The JEP public archive

A public website contains a readable archive of all JEP proposals.
It contains list of all JEPs that have entered a "final" state
(e.g., "Completed", "Withdrawn", "Rejected"). The content of each JEP will
be displayed in a readable fashion. When a JEP enters into a final state, it
is added to this website.

Note that the JEPs themselves contain the content, while the website is just a
quick way to display them in a reading-friendly format.

## Background

For a background of the JEP process, and recent efforts to improve it, see
[the meta-JEP readme](../29-jep-process/jep-process.md).

