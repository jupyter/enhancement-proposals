# A new notebook document format for improved workflow integration

## Problem

Jupyter notebooks do not integrate well with other tools supporting complex workflows in computational science. Examples of such tools are workflow managers, provenance trackers, and version control systems. The core of the problem is that Jupyter's on-disk notebook format is closely tied to Jupyter's functionality and design. Much information of use for other tools, although available at execution time, is not preserved in notebook files.

## Proposed Enhancement

Define a data model and file format for notebooks as digital documents. Include as much relevant information as possible that is available during a Jupyter session, in particular a complete log of code executed by the kernel. Design the file format with the needs of other tools in mind.


## Detailed Explanation

### Notebooks as digital documents

Currently, a Jupyter notebook file is essentially an on-disk representation of the internal state of the Web-based Jupyter editor. The file format mixes human-edited and computationally generated information with insufficient distinction, and does not preserve the history of the computation in enough detail to permit replication and other validation techniques.

The main goal of this proposal is a change of focus: notebooks should become digital documents with well-defined semantics, and the Jupyter editor should become just one out of many possible tools that process such notebook documents.

### A three-layer data model

The proposed data model for notebook documents consists of three layers:

  1. A sequence of code blocks, in execution order.
  2. A sequence of outputs produced by these code blocks, in execution order
  3. A narrative containing references to specific code blocks and
     outputs.

Layers 1 and 3 are human-edited content, subject to version control. Layer 2 consists entirely of computational results. In principle, it can be recomputed at any time. However, since recomputation can be time-consuming, and is often unreliable due to today's fragile computational enviromnents, layer 2 should be archived as well under version control, as a foundation for layer 3.

Conceptually, each layer is an independent electronic document, with each layer depending on information from lower layers. A layer 3 document can depend on multiple layer 1/2 documents. A provenance tracking system would treat a layer 1 document exactly like a script, and a layer 2 document exactly like the console output from a script. Provenance trackers may thus need to store the layers as separate files or datasets. The default notebook file format should combine all three layers, but facilitate extraction of individual layers.

Note that today's Jupyter file format resembles layer 3. It contains some information about execution order in the form of the prompt numbers. However, since the executed code is not stored anywhere, replication of the computation is impossible. Even if the prompt numbers in the notebook are sequential and start with 1, the code cells might have been edited after execution. The only guarantee that a notebook file makes is that the outputs were obtained from *some* computation.

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

The SHA-1 hash makes it possible to verify consistency with the underlying layer-1 document.

In the set of outputs, each output item contains:

 1. a label defining the output type
 2. the output data, conforming to a data model specific to the output type

Note: this section must be complemented with data models for the standard output types. Overall, outputs are handled very much like in the current notebook format.

#### Layer 3

A layer 3 document consists of:

 1. a language tag for choosing the right kernel for execution
 2. a list of references to layer 2 documents
 3. a sequence of cells.

Each cell has one of the following types:

 - a documentation cell, containing text content plus a label identifying the format (Markdown etc.)
 - an code cell, containing a code block
 - a reference to an execution record, consisting of (1) the index of the layer 2 document that contains the record and (2) the sequence index of the record inside the layer 2 document

Code cells are for code that has never been executed. Executed code blocks can be retrieved through the execution record from layer 2.

### File formats

### Implementation


## Pros and Cons

Pros:
* The computations in notebooks become replicable, at least in an identical computational environment.
* Notebooks can be managed as alternatives to scripts by workflow management tools.
* Alternative notebook editing tools can be developed that support different tastes or needs, while maintaining document compatibility and thus avoiding lock-in to any particular tool.

Cons:
* A data model and file format defined independently of the Jupyter implementation creates constraints on the future evolution of Jupyter.

## Interested Contributors
@khinsen
