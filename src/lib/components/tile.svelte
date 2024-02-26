<svelte:options accessors />

<script lang="ts">
  export let imgsrc: string;

  export let moving: boolean = false;
  let pointer: boolean = false;
  export let mouseover: boolean = false;
  export let clicked: boolean = false

  function onMouseDown(e: MouseEvent) {
    left = e.x - imgEl.width / 2;
    top = e.y + window.scrollY - imgEl.height / 2;
    moving = true;
    pointer = true;
    clicked = true;
  }

  function onMouseUp() {
    pointer = false;
    clicked = false;
  }

  function onMouseMove(e: MouseEvent) {
    if (moving) {
      left = e.x - imgEl.width / 2;
      top = e.y + window.scrollY - imgEl.height / 2;
    }
  }

  let left: number = 0;
  let top: number = 0;
  let imgEl: HTMLImageElement;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class:absolute={moving}
  class:pointer-events-none={pointer}
  class="cursor-move"
  style="left: {left}px; top: {top}px;"
  on:mousedown={onMouseDown}
  on:mouseenter={() => {
    mouseover = true;
  }}
  on:mouseleave={() => {
    mouseover = false;
  }}
>
  <img
    class="max-w-24 max-h-24 min-h-16 pixelated"
    bind:this={imgEl}
    src={imgsrc}
    alt="tile"
    draggable="false"
  />
</div>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<style>
  .pixelated {
    image-rendering: pixelated;
  }
</style>
