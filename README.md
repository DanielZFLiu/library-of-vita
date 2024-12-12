# library-of-vita
Personal Blog &amp; Profile. Feel free to reuse or expand upon the code, just make sure to to release your derivative work under the GPL license! 

# Useful Components
## Renderer
- lib/renderer.ts
A ts script for translating text (plaintext | markdown | latex) to HTML, particularly useful for blog posts or displaying LLM results. It also keeps any html tags originally in the text; for example you can render images using <img src=..../>. 

## Simple Parametric Animation
- lib/animation.ts
- components/animation/Parametric.svelte
A simple framework that animate parametric equations by gradually changing one parameter. Most of the cool animations in this website are built using this framework.

## ZoomPanCanvas
- components/ZoomPanCanvas
A container that allows zooming and panning (for keyboards/mouse & touchscreen). Just pass in the content snippets (slot in svelte 4) to display components inside the canvas. If you want to zoom in/out to a specific position and the scale via code, you can set trigger to true, in which case the canvas will zoom in/out to your desired location. You can also pass in the callback function onPan and onZoom, which triggers, as you guessed, on pan and on zoom.

## Bookshelf system
- components/book/Bookshelf.svelte
- lib/ShelfData.svelte
A framework to display bookshelves and books on a bookshelf. This one needs a lot of manual adjustments depending on the bookshelf background you choose; if you are interested, read into how the shelf data are being rendered in BookShelf.svelte.

