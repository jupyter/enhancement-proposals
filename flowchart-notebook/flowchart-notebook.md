# Jupyter Flowchart Notebook

## Problem
Code can be inherently hard for some users to understand as a solely text-based medium, yet other graphical IDEs/Languages are not
suited for professional use. 

## Proposed Enhancement

Provide a UI that formats blocks of code into flowchart diagrams to improve readability. By converting code to medium that is
both text-based and graphical, users less familiar with programming will have a better time understanding the code that they're
using.

## Detail Explanation

Jupyter is already set up to support a flowchart-based UI. A standard Jupyter notebook already takes the form of a linear,
sequential flowchart. By implementing basic multithreading techniques, flowcharts can be run multiple branches concurrently. Flowcharts also graphically stratify code, and branching charts with logic operations can vastly improve readability of code that makes heavy use of if/else/elif statements.

### JEP Titles

Jupyter Enhancement Proposals will be submitted with a title that is no longer than 12-words long. A JEP is uniquely identified by its title and the pull request number associated with it.

### JEP Structure

When submitting an enhancement proposal, individuals will include the following information in their submission.

1. The problem that this enhancement addresses. If possible include code or anecdotes to describe this problem to readers.
2. A brief (1-2 sentences) overview of the enhancement you are proposing. If possible include hypothetical code sample to describe how the solution would work to readers.
3. A detailed explanation covering relevant algorithms, data structures, an API spec, and any other relevant technical information
4. A list of pros that this implementation has over other potential implementations.
5. A list of cons that this implementation has.
6. A list of individuals who would be interested in contributing to this enhancement should it be accepted.

### JEP Submission Process
1. Create a [Markdown](https://help.github.com/articles/github-flavored-markdown/) write up of the problem, proposed enhancement, detailed technical explanation, pros and cons, and interested contributors of the enhancement you are proposing.
2. Create a fork of this repository.
3. Create a folder with its name set to the JEP title in lower snake-case.
3. Place the markdown file created in step 1 and any supplemental materials in that folder.
4. Submit a pull request to the main repository with your JEP. 
5. Once your PR is accepted, it will be labeled `active` per the guidelines above.
6. Your JEP will be added to the JEP Index file in this repository.

## Pros and Cons

Pros associated with this implementation include:
* Code becomes easier to write and modify for users that prefer graphical environments
* Improved readability of logic-heavy code
* Concurrently-running code will be easier to read and write than if multithreading was implemented manually

Cons associated with this implementation include:
* Existing IPEPs (IPython Enhancement Proposals) will not be included in this migrated repository

## Interested Contributors
@captainsafia, @rgbkrk
