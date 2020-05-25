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

## Pros and Cons

Pros associated with this implementation include:
* Code becomes easier to write and modify for users that prefer graphical environments
* Improved readability of logic-heavy code
* Concurrently-running code will be easier to read and write than if multithreading was implemented manually

Cons associated with this implementation include:
* Branching programs would be inherently more complicated than sequential programs. Because of this added complexity, users writing branching programs might be led to make their otherwise simple programs more complicated due to the more options that are available.
* Large branched programs could become visually messy, and spaghetti code could become very complicated to manage.
* Retrofitting/Refactoring could become a much more tedious process

## Interested Contributors
@CharlesAverill
