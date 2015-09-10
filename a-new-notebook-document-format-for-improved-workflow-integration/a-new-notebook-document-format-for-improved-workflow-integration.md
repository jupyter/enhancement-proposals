# A new notebook document format for improved workflow integration

## Problem

Jupyter notebooks do not integrate well with other tools supporting complex workflows in computational science. Examples of such tools are workflow managers, provenance trackers, and version control systems. The core of the problem is that Jupyter's on-disk notebook format is closely tied to Jupyter's functionality and design. Much information of use for other tools, although available at execution time, is not preserved in notebook files.

## Proposed Enhancement

Define a data model and file format for notebooks as digital documents. Include as much relevant information as possible that is available during a Jupyter session, in particular a complete log of code executed by the kernel. Design the file format with the needs of other tools in mind.


## Detailed Explanation

### Notebooks as digital documents

Currently, a Jupyter notebook file is merely an on-disk representation of the internal state of the Jupyter Web tool. The file format mixes user-edited and computationally generated information with insufficient distinction, and does not preserve the history of the computation in enough detail to permit replication and other validation approaches.

The main goal of this proposal is a change of focus: notebooks should become digital documents with well-defined semantics, and the Jupyter Web tool should become just one out of many possible tools that process such notebook documents.

### A three-layer data model

The proposed data model for notebook documents consists of three layers:

  1. A sequence of code blocks in execution order.
  2. A sequence of outputs produced by these code blocks, in execution order
  3. A narrative containing references to specific code blocks and/or
     outputs.

Layers 1 and 3 are user-edited content, subject to version control. Layer 2 consists entirely of computational results. In principle, it can be recomputed at any time. However, since recomputation can be time-consuming, and is often unreliable due to today's fragile computational enviromnents, layer 2 should be archived as well under version control, as a foundation for layer 3.

Conceptually, each layer is an independent electronic document, with each layer depending on information from lower layers. A layer 3 document could depend on multiple layer 1/2 documents, e.g. in a multiuser setting. A provenance tracking system would treat a layer 1 document exactly like a script, and a layer 2 document exactly like the console output from a script. Provenance trackers may this need to store the layers as separate files or datasets. The default notebook file format should combine all three layers, but facilitate extraction of individual layers.

Note that today's Jupyter file format contains only level 3, with only the sequence numbers of the output cells preserving a partial trace of the execution order. However, all the information of layers 1 and 2 is available to the kernel.

In the following, the three layers are described in more detail.

#### Layer 1

A layer 1 document consists of

 1. a language tag for choosing the right kernel for execution
 2. a sequence of code blocks

Each code block needs a unique identifier to permit layers 2 and 3 to refer to it. A cryptographic hash function such as SHA-1 can be used to generate such a unique identifier, which has the advantage of making a layer 1 document a content-addressable read-only storage. References to code blocks can thus easily be validated, as any change to a code block modifies its unique identifier.

#### Layer 2

A layer 2 document consists of

 1. information about the computational environment (kernel type and version, machine name, date, ...)
 2. a reference to the layer 1 document containing the code blocks
 3. a complete sequence of execution records for all code executed since the start of the kernel

An execution record contains the following information:

 1. the unique identifier of the code block that was executed
 2. a set of outputs produced by the code blocks

In the set of outputs, each output item contains:

 1. a label defining the output type
 2. the output data, conforming to a data model specific to the output type

Note: this section must be complemented with data models for the standard output types. Overall, outputs are handled very much like in the current notebook format.

#### Layer 3

A layer 3 document consists of

 1. a list of references to layer 1 documents
 2. a list of references to layer 2 documents
 3. a sequence of cells.

Each cell is one of

 1. a documentation cell, containing text content plus a label identifying the format (Markdown etc.)
 2. a code cell, containing the unique identifier of a code block in one of the referenced layer 1 documents
 3. an output cell, containing (1) the index of the layer 2 document that contains the output and (2) the sequence index of the output item inside the layer 2 document


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
