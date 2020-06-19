# Diffing and merging notebooks

## Problem

Diffing and merging notebooks is not properly handled by standard linebased diff and merge tools.


## Proposed Enhancement

* Make a package containing tools for diff and merge of notebooks
* Command line functionality:
  - A command nbdiff with diff output as json or pretty-printed to console
  - A command nbmerge which should be git compatible
  - Command line tools for interactive resolution of merge conflicts
  - Optional launching of web gui for interactive resolution of merge conflicts
  - All command line functionality is also available through the Python package
* Web gui functionality:
  - A simple server with a web api to access diff and merge functionality
  - A web gui for displaying notebook diffs
  - A web gui for displaying notebook merge conflicts
  - A web gui for interactive resolution of notebook merge conflicts
* Plugin framework for mime type specific diffing


## Detailed Explanation

Preliminary work resides in [nbdime](https://github.com/martinal/nbdime).

Fundamentally, we envision use cases mainly in the categories
of a merge command for version control integration, and
diff command for inspecting changes and automated regression
testing. At the core of it all is the diff algorithms, which
must handle not only text in source cells but also a number of
data formats based on mime types in output cells.

Cell source is usually the primary content, and output can presumably
be regenerated. In general it is not possible to guarantee that merged
sources and merged output is consistent or makes any kind of
sense. For many use cases options to silently drop output instead of
requiring conflict resolution will produce a smoother workflow.
However such data loss should only happen when explicitly requested.


### Basic use cases of notebook diff

* View difference between two versions of a file:
  `nbdiff base.ipynb remote.ipynb`
* Store difference between two versions of a file to a patch file
  `nbdiff base.ipynb remote.ipynb patch.json`
* Compute diff of notebooks for use in a regression test framework:
```
  import nbdime
  di = nbdime.diff_notebooks(a, b)
  assert not di
```
* View difference of output cells after re-executing notebook


Variations will be added on demand with arguments to the nbdiff command, e.g.:

* View diff of sources only
* View diff of output cells (basic text diff of output cells, image diff with external tool)


### Basic use cases of notebook merge

The main use case for the merge tool will be a git-compatible commandline merge tool:
```
    nbmerge base.ipynb local.ipynb remote.ipynb merged.ipynb
```
which can be called from git and launch a console tool or web gui for conflict resolution if needed.
Ideally the web gui can reuse as much as possible from Jupyter Notebook.

Goals:

* Trouble free automatic merge when no merge conflicts occur
* Optional behaviour to drop conflicting output, execution counts, and eventual other secondary data
* Easy to use interactive conflict resolution


### Notes on initial implementation

* An initial version of diff gui can simply show e.g. two differing
  images side by side, but later versions should do something more
  clever.

* An initial version of merge can simply join or optionally delete
  conflicting output.

* An initial version of conflict resolution can be to output a
  notebook with conflicts marked within cells, to be manually edited
  as a regular jupyter notebook.


## Diff format

The diff object represents the difference between two objects A and
B as a list of operations (ops) to apply to A to obtain B. Each
operation is represented as a dict with at least two items:
```
{ "op": <opname>, "key": <key> }
```
The objects A and B are either mappings (dicts) or sequences (lists),
and a different set of ops are legal for mappings and sequences.
Depending on the op, the operation dict usually contains an
additional argument, documented below.


### Diff format for mappings

For mappings, the key is always a string. Valid ops are:

* `{ "op": "remove",  "key": <string> }`: delete existing value at key
* `{ "op": "add",     "key": <string>, "value": <value> }`: insert new value at key not previously existing
* `{ "op": "replace", "key": <string>, "value": <value> }`: replace existing value at key with new value
* `{ "op": "patch",   "key": <string>, "diff": <diffobject> }`: patch existing value at key with another diffobject


### Diff format for sequences (list and string)

For sequences the key is always an integer index.  This index is
relative to object A of length N.  Valid ops are:

* `{ "op": "removerange",  "key": <string>, "length": <n>}`: delete the values A[key:key+length]
* `{ "op": "addrange",     "key": <string>, "valuelist": <values> }`: insert new items from valuelist before A[key], at end if key=len(A)
* `{ "op": "patch",   "key": <string>, "diff": <diffobject> }`: patch existing value at key with another diffobject


### Relation to JSONPatch

The above described diff representation has similarities with the
JSONPatch standard but is different in some significant ways:

* JSONPatch contains operations "move", "copy", "test" not used by
nbdime, and nbdime contains operations "addrange", "removerange", and
"patch" not in JSONPatch.

* Instead of providing a recursive "patch" op, JSONPatch uses a deep
JSON pointer based "path" item in each operation instead of the "key"
item nbdime uses. This way JSONPatch can represent the diff object as
a single list instead of the 'tree' of lists that nbdime uses. The
advantage of the recursive approach is that e.g. all changes to a cell
are grouped and do not need to be collected.

* JSONPatch uses indices that relate to the intermediate (partially
patched) object, meaning transformation number n cannot be interpreted
without going through the transformations up to n-1.  In nbdime the
indices relate to the base object, which means 'delete cell 7' means
deleting cell 7 of the base notebook independently of the previous
transformations in the diff.

A conversion function can fairly easily be implemented.


## High level diff algorithm approach

The package will contain both generic and notebook-specific variants of diff algorithms.

The generic diff algorithms will handle most json-compatible objects:

  * Arbitrary nested structures of dicts and lists are allowed

  * Leaf values can be any strings and numbers

  * Dict keys must always be strings

The generic variants will by extension produce correct diffs for
notebooks, but the notebook-specific variants aim to produce more
meaningful diffs. "Meaningful" is a subjective concept and the
algorithm descriptions below are therefore fairly high-level with
many details left up to the implementation.



### Handling nested structures by alignment and recursion

The diff of objects A and B is computed recursively, handling dicts
and lists with different algorithms.


### Diff approach for dicts

When computing the diff of two dicts, items are always aligned by key
value, i.e. under no circumstances are values under different keys
compared or diffed. This makes both diff and merge quite
straightforward. Modified leaf values that are both a list or both a
dict will be diffed recursively, with the diff object recording a
"patch" operation.  Any other modified leaf values are considered
replaced.


### Diff approach for lists

We wish to diff sequences and also recurse and diff aligned elements
within the sequences. The core approach is to first align elements,
requiring some heuristic for comparing elements, and then recursively
diff the elements that are determined equal. *These heuristics will
contain the bulk of the notebook-specific diff algorithm
customizations.*

The most used approach for computing linebased diffs of source code is
to solve the longest common subsequence (lcs) problem or some
variation of it. We extend the vanilla LCS problem by allowing
customizable predicates for approximate equality of two items,
allowing e.g. a source cell predicate to determine that two pieces of
source code are approximately equal and should be considered the same
cell, or an output cell predicate to determine that two bitmap images
are almost equal.

In addition we have an experimental multilevel algorithm that employs
a basic LCS algorithm with a sequence of increasingly relaxed equality
predicates, allowing e.g. prioritizing equality of source+output over
just equality of source.  Note that determining good heuristics and
refining the above mentioned algorithms will be a significant part of
the work and some experimentation must be allowed. In particular the
behaviour of the multilevel approach must be investigated further and
other approaches could be considered..


### Displaying metadata diffs

The notebook format has metadata in various locations,
including on each cell, output, and top-level on the notebook.
These are dictionaries with potentially arbitrary JSON content.
Computing metadata diffs is not different from any other dictionary diff.
However, metadata generally does not have a visual representation in the live notebook,
but it must be indicated in the diff view if there are changes.
We will explore various represenentations of metadata changes in the notebook view.
The most primitive would be to display the raw dictionary diff as a JSON field in the notebook view,
near the displayable item the metadata is associated with.


### Note about the potential addition of a "move" transformation

In the current implementation there is no "move" operation.
Furthermore we make some assumptions on the structure of the json
objects and what kind of transformations are meaningful in a diff.

Items swapping position in a list will be considered added and removed
instead of moved, but in a future iteration adding a "move" operation
is an option to be considered. The main use case for this would be to
resolve merges without conflicts when cells in a notebook are
reordered on one side and modified on the other side.

Even if we add the move operation, values will never be moved between
keys in a dict, e.g.:

    diff({"a":"x", "b":"y"}, {"a":"y", "b":"x"})

will be:

    [{"op": "replace", "key": "a", "value": "y"},
     {"op": "replace", "key": "b", "value": "x"}]

In a notebook context this means for example that data will never be
considered to move across input cells and output cells.


## Merge format

A merge takes as input a base object (notebook) and local and remote
objects (notebooks) that are modified versions of base. The merge
computes the diffs base->local and base->remote and tries to apply all
changes from each diff to base. The merge returns a merged object
(notebook) contains all successfully applied changes from both sides,
and two diff objects merged->local and merged->remote which contain
the remaining conflicting changes that need manual resolution.


## Pros and Cons

Pros associated with this implementation include:
* Improved workflows when placing notebooks in version control systems
* Possibility to use notebooks for self-documenting regression tests

Cons associated with this implementation include:
* Vanilla git installs will not receive the improved behaviour, i.e. this will require installation of the package. To reduce the weight of this issue the package should avoid unneeded heavy dependencies.


## Interested Contributors
@martinal @minrk
