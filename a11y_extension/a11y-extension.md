# Jupyter Enhancement Proposal - a11y Extension

## Introduction

The Jupyter mission states:
> Computers are good at consuming, producing and processing data. Humans, on the other hand, process the world through narratives. Thus, in order for data, and the computations that process and visualize that data, to be useful for humans, they must be embedded into a narrative - *a computational narrative* - that tells a story for a **particular audience and context**.

We believe that the benefits of adding accessibility to Jupyter allows for storytelling to a broader audience and for the creation of more intuitive narratives.

## Problem

Currently, Jupyter is not fully accessible to users with visual and motor impairments. Keyboard shortcuts are available when editing a specific notebook, but are not available in the Home dashboard view. Layout of notebooks do not make full use of screen space and page styling cannot be easily changed. The notebook user experience itself does not entirely lend itself to the screen readers and magnification tools.

Furthermore, if Jupyter was to be made keyboard accessible and ARIA compliant using conventional mechanisms, visually impaired users are still left using current screen readers and magnifiers that are not context aware. Screen readers and magnifiers are only two points in a spectrum of tools, and we propose we can do better to integrate accessibility tools into Jupyter.  

The dynamic nature of Jupyter notebooks introduces new challenges into making the tool accessible but also opens many possibilities to include context aware enhancements that may be useful to all users.

## Proposed Enhancement

With the introduction of notebook extensions, accessible layouts, styling, and enhancements could be installed and applied by a user with only a few lines of code. We divide features of our proposed a11y Extension into three categories:

1. Auditory enhancements
2. Visual enhancements
3. Controller enhancements

## Detailed Explanation
[emsp_id]: http://emacspeak.sourceforge.net/ "T.V. Raman's Emacspeak"
[wbsp_id]: https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html "Web Speech API"
[wbau_id]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API"

### Auditory enhancements

Since Jupyter runs in the browser, we could leverage the power of web and native text to speech APIs, such as [Web Speech][wbsp_id] and [Web Audio][wbau_id]. Using an approach similar to [Emacspeak][emsp_id], we propose a method of wrapping communication between the notebook interface and kernel events to provide context aware audio cues.  

Example audio cues:

- If a cell is executing and the cell number is displayed as an asterisk (`In [*]`), then a sound will play to indicate the state of the cell.
- When a code cell finishes executing, a sound will play to indicate whether evaluation was a success or failure.
    - Errors or compilation messages are read with an indicative tone
- Ticks or beeps could be used to indicate levels of indentation in both code and plain text.

Additionally, screen reading could be enhanced by changing pitch, tone, or volume depending on cell type:

- If a user is navigating a cell containing code, then changes to speech synthesis could be made based on syntax highlighting. 
- If a user is navigating a cell containing markdown, then changes to speech synthesis could be made based on existing protocols that consider text hierarchy and format.
    - LaTeX in Markdown would be read differently 

### Visual enhancements

#### CSS

Through modifications to the CSS of the notebook application, we can make notebooks easier to read for visually impaired users. We propose tweaks to CSS to change page styling such as colors, font, font size, cell size, and margin size to display the interface in a way that facilitates use for visually impaired users:

- Switch to turn accessibility mode on / off
- Use of monospace, sans-serif accessible fonts such as Verdana
- Boosting contrast by making notebook colors customizable, defaulting to a black background with most text white
- Widening cells and minimizing margins (whitespace) to allow more room for content by default
- Bold cell border highlighting and coloring for easier knowledge of which cell is active
- Resizing and hiding of navigation tools

#### Magnification

Currently in Chrome, magnification of the Jupyter browser tab results in magnification of the navigation bar in addition to the rest of the page, which hinders reading cell content.

### Controller enhancements

Though there is a suite of keyboard shortcuts when editing notebooks, no shortcuts exist for the homepage of Jupyter. Creating, selecting, deleting, and renaming should be functions that can be completed with just a keyboard. Making keyboard shortcuts reprogrammable would also greatly improve accessibility.

## Pros and Cons

Pros associated with this implementation include:

- Existing need for accessible tools
- Willing community of testers and contributors
- Reaching a larger user base
- Easier navigation within notebooks
- New context cues that are also applicable to non-impaired users
- Infrastructure exists to implement enhancements
- Contribution to the `nbextensions` environment, possibly spawning more discussion around an extensions manager (a la Sublime Text package control)
- Becoming a standard for accessible development and visualization tools

Cons associated with this implementation include:

- Added complexity to environment

## Interested Contributors

GitHub accounts:  

- @jameslmartin  (jamesml@cs.unc.edu)  
- @gbishop  
- @parente  