# Twelve animation principles for interfaces

## What I observed in Chrome

- I opened **Feedback** on Emil Kowalski’s article. The button expanded into a form and put focus in the text field, so I could start typing as soon as it opened. The movement connected the button to the form it opened. [You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations#purposeful-animations)
- I pressed Down in the command-menu example and moved the selection to Emoji Picker. The example gave me a concrete task so I could judge how directly the highlight followed the key. Opening Options likewise exposed real choices. [Command-menu example](https://emilkowal.ski/ui/you-dont-need-animations#frequency-of-use) · [Dropdown example](https://emilkowal.ski/ui/you-dont-need-animations#perception-of-speed)
- On the original portfolio post, I clicked the first replay target. Both shapes moved, and the only thing I could do afterwards was replay them. The paragraph had to make the connection from the shapes to a real control. Three of the twelve principles had no example.

## What changed

Each principle now pairs two versions of the same task. A reader can save a draft, archive a brief, filter an inbox, sort files, or recover from a form error. The copy starts with an action a reader already understands and describes the detail worth noticing. The article keeps its URL, cover, and publication date.

The examples use local sample data. The controls work by keyboard and pointer, and the motion follows the system’s reduced-motion preference.

I verified in Chrome that the sort menu closes with Escape and returns focus to Sort. At 375px the comparisons stack without horizontal scrolling. The archive hint is visible on touch, and the menu still opens with reduced motion enabled. In the Arcs example, the pin moves across first and makes most of its upward move in the second half of the animation.

## Demo framing

In Emil’s easing example, one light frame holds both controls. The trigger sits close to its comparison marker, and the open menu has a clear area above it. The old timing example on this site used two gray file browsers and repeated the same rows. [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips#4.-choose-the-right-easing)

The demos now share a frame and place the comparison labels under the examples. Timing uses two compact sort selectors and shows which file comes first. Staging and Solid drawing include full rows because the surrounding UI is part of what the reader needs to watch.
