# A new notebook document format for improved workflow integration

## Problem

Jupyter notebooks do not integrate well with other tools supporting complex workflows in computational science. Version control systems require a clear separation of human-edited content and computed content. The current notebook file format mixes them. Workflow managers and provenance trackers require that all computations be replicable. For interactive computations, replicability requires storing a full log of user actions. The current notebook file format does not preserve this information, although it is available at execution time. 

The core of the problem is that Jupyter's notebook file format is closely tied to Jupyter's functionality and design. It is essentially an on-disk representation of the internal state of the Jupyter notebook client, storing only the information required to open the notebook later or elsewhere.


## Proposed Enhancement

The main goal of this proposal is a change of focus: notebooks should become digital documents with well-defined semantics, and the Jupyter notebook client should become just one out of many possible tools that process such notebook documents.

This core of this proposal is a new data model and file format notebooks as digital documents. It includes as much relevant information as possible that is available during a Jupyter session, in particular a complete log of the code executed by the kernel. The file format is designed with the specific needs of other tools in mind, in particular version control systems.


## Detailed Explanation

### A three-layer data model

The proposed data model for notebook documents consists of three layers:

  1. A sequence of code blocks, in execution order.
  2. A sequence of outputs produced by these code blocks, in execution order
  3. A narrative containing references to specific code blocks and
     outputs.

Layers 1 and 3 are human-edited content, subject to version control. Layer 2 consists entirely of computational results. In principle, it can be recomputed at any time. However, since recomputation can be time-consuming, and is often unreliable due to today's fragile computational enviromnents, layer 2 should be archived as well under version control, as a foundation for layer 3.

Conceptually, each layer is an independent electronic document, depending on information from lower layers. A layer 3 document can depend on multiple layer 1/2 documents. A provenance tracking system would treat a layer 1 document exactly like a script, and a layer 2 document exactly like the console output from a script. Provenance trackers may thus need to store the layers as separate files or datasets. The default notebook file format should combine all three layers, but facilitate extraction of individual layers.

Note that today's Jupyter file format resembles layer 3. It contains some information about execution order in the form of the prompt numbers. However, since the executed code is not stored anywhere, replication of the computation is impossible. Even if the prompt numbers in the notebook are sequential and start with 1, the code cells might have been edited after execution, and code might have been submitted to the kernel outside of the notebook. The only guarantee that a notebook file makes is that the outputs were obtained from *some* computation.

In the following, the three layers are described in more detail.

#### Layer 1

A layer 1 document consists of

 1. a language tag for choosing the right kernel for execution
 2. a sequence of code blocks

#### Layer 2

A layer 2 document consists of

 1. a reference to the layer 1 document containing the code blocks
 2. information about the computational environment (kernel type and version, machine name, date, ...)
 3. a complete sequence of execution records for all code executed since the start of the kernel

An execution record contains the following information:

 1. the SHA-1 hash of the code block that was executed
 2. a set of outputs produced by the code blocks
 
In the set of outputs, each output item contains:

 1. a label defining the output type
 2. the output data, conforming to a data model specific to the output type
 3. a SHA-1 hash
 
The SHA-1 hashes make it possible to verify consistency with the underlying layer-1 document, and to detect accidental modifications to the execution records by other tools.

Note: this section must be complemented with data models for the standard output types. Overall, outputs can be handled very much like in the current notebook format.

#### Layer 3

A layer 3 document consists of:

 1. a language tag for choosing the right kernel for execution
 2. a list of references to layer 2 documents
 3. a sequence of cells.

Each cell has one of the following types:

 - a documentation cell, containing text content plus a label identifying the format (Markdown etc.)
 - a reference to an execution record, consisting of (1) the index of the layer 2 document that contains the record and (2) the sequence index of the record inside the layer 2 document
 - a code cell, containing a code block
 - a stale output cell, containing output from a prior execution for which no log is available

Code cells contain code that has not yet been executed. Executed code blocks can be retrieved through the execution record from layer 2.


### File format

The main difficulty in defining a file format for the data model described above is suitability for version control. The biggest challenge is support for merging independent changes. In general, this creates an inconsistent notebook document because the computed content (layer 2) is not automatically updated after code changes. The use of SHA-1 hashes makes it possible to detect such inconsistencies.

In order to make diffs readable, a line-oriented format with light markup is desirable for layers 1 and 3. Moreover, layer 2 should be placed at the end of a notebook document, following layers 1 and 3.


### Implementation

#### Jupyter notebook client

Layers 1 and 2 are managed by the kernel, layer 3 is managed by the notebook client.

When a kernel is started, it creates a fresh layer 1 and layer 2 document. All code submitted to the kernel, whether through the notebook client or by other means, is appended to layer 1. Outputs are appended to layer 2. For execution requests coming from the notebook client, the kernel returns updates to layers 1 and 2 since the previous execution request, permitting the client to reconstruct layers 1 and 2 as soon as possible. This limits information loss in case of a kernel shutdown or crash.

The Web client creates new notebooks as layer 3 documents with no attached lower layers. User-edited content is stored as documentation cells or code cells. When a kernel is started, its layer 2 document is attached to the client's layer 3 document. When a code cell is sent to the kernel, it is replaced by a reference to the resulting execution record that is returned by the kernel. The client reconstructs layers 1 and 2 incrementally from this information.

When a kernel is restarted for an existing notebook, its layers 1 and 2 are attached to the client's layer 3 in addition to layers 1 and 2 from earlier kernels. Existing layer 1/2 attachments can be deleted only when no reference to them exists any more in layer 3.

When already executed code is edited, the execution reference is replaced by a code cell plus a stale output cell. The latter should be displayed in a way that clearly marks it as stale.

A cleanup operation ("remove output / remove all outputs") replaces execution records by code cells.

When opening a stored notebook, all execution records are replaced by code cell/stale output cell pairs and layers 1 and 2 are discarded. Then a new kernel is started, creating new layer 1/2 information.

Publishing tools (including nbviewer) should follow a more careful procedure in order to preserve information about replicability. This requires first of all a verification of the consistency between layers 1 and 2, because other tools, in particular version control systems, may create inconsistent notebook files. The check consists of comparing the SHA-1 hashes in layer 2 to freshly computed hashes for layer 1, proceding in execution order. If a difference is detected, the layer 2 data is truncated at this point, and references from layer 3 to the invalidated execution records are replaced by code cell/stale output cell pairs. A visual marker for stale outputs then tells the reader which parts of the notebook are backed up by replicable computations.

#### Alternative user interfaces

A more natural user interface for the document data model would propose two views on the data:

 1. an interactive shell much like IPython, but code-block oriented rather than line oriented
 2. a notebook editor

A single command would send a code cell from the notebook editor to the interactive shell for execution. In the interactive shell, a single command would append the current execution record to the notebook being edited.

An advantage of such a user interface is that it generalizes easily to multi-user setups.

An alternative user interface for users whose computations are short is a literate-programming style editor in which the user mixes code and documentation and a run-time system immediately updates all output cells by re-executing all code from start to end.


## Pros and Cons

Pros:
* The computations in notebooks become replicable, at least in an identical computational environment.
* Computations in notebooks can be handled by version control, including merge operations for independent changes.
* Notebooks can be managed like scripts by workflow management tools.
* Alternative notebook editing tools can be developed that support different tastes or needs, while maintaining document compatibility and thus avoiding lock-in to any particular tool.

Cons:
* A data model and file format defined independently of the Jupyter implementation generates constraints on the future evolution of Jupyter.

## Interested Contributors
@khinsen
