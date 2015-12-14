# Diffing and merging notebooks

## Problem

Diffing and merging notebooks is not properly handled by standard linebased diff and merge tools.

## Proposed Enhancement

* Make a package containing tools for diff and merge of notebooks
* Include a command line api
* Pretty-printing of diffs for command line display
* Command line tools for interactive resolution of merge conflicts
* Make the merge tool git compatible
* Make a web gui for displaying notebook diffs
* Make a web gui for interactive resolution of merge conflicts
* Plugin framework for mime type specific diffing


## Detailed Explanation

Preliminary work resides in [nbdime](https://github.com/martinal/nbdime).

Fundamentally, we envision use cases mainly in the categories
of a merge command for version control integration, and
diff command for inspecting changes and automated regression
testing. At the core of it all is the diff algorithms, which
must handle not only text in source cells but also a number of
data formats based on mime types in output cells.


### Basic diffing use cases

* View difference between versions of a file
* View diff of sources only
* View diff of output cells (basic text diff of output cells, image diff with external tool)


### Version control use cases

Most commonly, cell source is the primary content,
and output can presumably be regenerated. Indeed, it
is not possible to guarantee that merged sources and
merged output is consistent or makes any kind of sense.

The main use case for the merge tool will be a git-compatible commandline merge tool:

    nbmerge base.ipynb local.ipynb remote.ipynb merged.ipynb

and a web gui for conflict resolution. Ideally the web gui can
reuse as much as possible from jupyter notebook. An initial
version of conflict resolution can be to output a notebook with
conflicts marked within cells, to be manually edited as a regular
jupyter notebook.

Goals:

* Trouble free automatic merge when no merge conflicts occur
* Optional behaviour to drop conflicting output
* Easy to use interactive conflict resolution

Not planning (for now):

* Merge of arbitrary output cell content

Open questions:

* Is it important to track source lines moving between cells?

Should make a collection of tricky corner cases, and
run merge tools on test cases from e.g. git if possible.


### Regression testing use cases

* View difference of output cells after re-running cells


### Diff format

A preliminary diff format has been defined, where the diff result is itself a json object.
The details of this format is being refined. For examples of concrete diff
objects, see e.g. the test suite for patch.


#### Diff format for dicts (current)

A diff of two dicts is a list of diff entries:

    key = string
    entry = [action, key] | [action, key, argument]
    diff = [entry0, entry1, ...]

A dict diff entry is a list of action and argument (except for deletion):

* ["-", key]: delete value at key
* ["+", key, newvalue]: insert newvalue at key
* ["!", key, diff]: patch value at key with diff
* [":", key, newvalue]: replace value at key with newvalue


#### Diff format for dicts (alternative)

A diff of two dicts is itself a dict mapping string keys to diff entries:

    key = string
    entry = [action] | [action, argument]
    diff = {key0: entry0, key1: entry1, ...}

A dict diff entry is a list of action and argument (except for deletion):

* ["-"]: delete value at key
* ["+", newvalue]: insert newvalue at key
* ["!", diff]: patch value at key with diff
* [":", newvalue]: replace value at key with newvalue


#### Diff format for sequences (list and string)

A diff of two sequences is an ordered list of diff entries:

index = integer
entry = [action, index] | [action, index, argument]
diff = [entry0, entry1, ...]

A sequence diff entry is a list of action, index and argument (except for deletion):

* ["-", index]: delete entry at index
* ["+", index, newvalue]: insert single newvalue before index
* ["--", index, n]: delete n entries starting at index
* ["++", index, newvalues]: insert sequence newvalues before index
* ["!", index, diff]: patch value at index with diff

Possible simplifications:

* Remove single-item "-", "+" and rename "--" and "++" to single-letter.
* OR remove "--" and "++" and stick with just single-item versions.


Note: The currently implemented sequence diff algorithm is
based on a brute force O(N^2) longest common subsequence (LCS)
algorithm, this will be rewritten in terms of a faster algorithm
such as Myers O(ND) LCS based diff algorithm, optionally
using Pythons difflib for use cases it can handle.
In particular difflib does not handle custom compare predicate,
which we need to e.g. identify almost equal cells within sequences
of cells in a notebook.


### Merge format

The merge process should return two things: The merge result and the conflicts.

A format for representing merge conflicts is work in progress.

Each transformation in the base->local and base->remote diffs must either
end up in the merge result or be recorded in the conflicts representation.


## Pros and Cons

Pros associated with this implementation include:
* Improved workflows when placing notebooks in version control systems
* Possibility to use notebooks for self-documenting regression tests

Cons associated with this implementation include:
* Vanilla git installs will not receive the improved behaviour


## Interested Contributors
@martinal @minrk
