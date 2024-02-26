<script lang="ts">
  import blobToBase64 from "$lib/ImageUtils";
  import { Colors, Tier } from "$lib/TierData";
  import Tile from "$lib/components/tile.svelte";

  let tiers: Tier[] = [
    new Tier("S", Colors.RED),
    new Tier("A", Colors.ORANGE),
    new Tier("B", Colors.YELLOWB),
    new Tier("C", Colors.YELLOWC),
    new Tier("D", Colors.GREEN),
  ];

  let moving = false;

  function moveTierUp(tier: number) {
    if (tier == 0) {
      return;
    }
    let tierSel = tiers.splice(tier, 1);
    let tierCut = tiers.splice(tier - 1);
    tiers = tiers.concat(tierSel);
    tiers = tiers.concat(tierCut);
    tiers = tiers;
  }

  function moveTierDown(tier: number) {
    let tierSel = tiers.splice(tier, 1);
    let tierCut = tiers.splice(tier + 1);
    tiers = tiers.concat(tierSel);
    tiers = tiers.concat(tierCut);
    tiers = tiers;
  }

  function moveImage() {
    moving = false;
    if (tierHover == -1) {
      return;
    }
    if (!imageSelect) {
      return;
    }
    let image = imageSelect.src;
    let tileElement: Tile;
    if (imageSelect.tier === undefined) {
      tileElement = tierTiles[`0${imageSelect.id}`];
      if (!tileElement.clicked && !tileElement.mouseover) {
        return;
      }
      imageBlobs.splice(imageSelect.id, 1)[0];
    } else {
      tileElement = tierTiles[`${imageSelect.tier + 1}${imageSelect.id}`];
      if (!tileElement.clicked && !tileElement.mouseover) {
        return;
      }
      tiers[imageSelect.tier].elements.splice(imageSelect.id, 1)[0];
    }
    tileElement.moving = false;
    tiers[tierHover].elements.push(image);
    tiers = tiers;
    imageBlobs = imageBlobs;
    imageSelect = undefined;
  }

  function saveAsJson() {
    let jsonobject = {};
    for (let i = 0; i < tiers.length; i++) {
      jsonobject[i] = tiers[i];
    }
    jsonobject["storage"] = imageBlobs;
    download(JSON.stringify(jsonobject), "TierList.json", "text/plain");

    console.log(jsonobject);
  }

  function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  let settings: HTMLDialogElement;
  let tierSelect = 0;
  let tierHover = -1;

  let imgUpload: FileList;
  let imageBlobs: string[] = [];
  let imageSelect: { id: number; src: string; tier?: number };
  let tierTiles: Map<string, Tile> = new Map<string, Tile>();
</script>

<svelte:window
  on:mouseup={moveImage}
  on:mousedown={() => {
    if (!(imageSelect === undefined)) {
      moving = true;
    }
  }}
/>

<svelte:head>
  <title>TierList</title>
</svelte:head>

<div class="flex flex-row justify-center mt-4">
  <div class="flex flex-col items-center">
    <div class="flex flex-row my-4">
      <button class="btn btn-success" on:click={saveAsJson}>Save</button>
    </div>
    {#each tiers as tier, i}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="flex flex-row"
        on:mouseenter={() => {
          tierHover = i;
        }}
      >
        <div
          class="flex flex-col min-w-24 min-h-24 max-w-24 justify-center items-center text-black px-4 overflow-scroll text-center"
          style="background-color: {tier.color};"
        >
          {tier.name}
        </div>
        <div class="flex flex-col justify-center bg-base-300 min-w-[40rem]">
          <div class="grid grid-cols-8" id="{i}row">
            {#each tier.elements as element, j}
              <div
                class:pointer-events-none={moving}
                on:mouseenter={() => {
                  imageSelect = { id: j, src: element, tier: i };
                }}
              >
                <Tile bind:this={tierTiles[`${i + 1}${j}`]} imgsrc={element}
                ></Tile>
              </div>
            {/each}
          </div>
        </div>
        <div class="flex flex-col justify-center bg-black p-4">
          <div class="flex flex-row items-center gap-2">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <div class="flex flex-col">
              <img
                src="/settings-icon.svg"
                alt="gear"
                class="invert"
                on:click={() => {
                  tierSelect = i;
                  settings.showModal();
                }}
              />
            </div>
            <div class="flex flex-col">
              <div class="flex flex-row">
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img
                  class="w-8 h-8 invert"
                  src="/up-arrow.svg"
                  alt="arrow"
                  on:click={() => {
                    moveTierUp(i);
                  }}
                />
              </div>
              <div class="flex flex-row">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <img
                  class="w-8 h-8 invert rotate-180"
                  src="/up-arrow.svg"
                  alt="arrow"
                  on:click={() => {
                    moveTierDown(i);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
    <div class="flex flex-row my-2">
      <button
        class="btn btn-ghost"
        on:click={() => {
          tiers.push(new Tier("New Tier", Colors.BLACK));
          tiers = tiers;
          tierSelect = tiers.length - 1;
          settings.showModal();
        }}>+</button
      >
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="flex flex-row my-8 gap-4 items-center"
      on:mouseenter={() => {
        tierHover = -1;
      }}
    >
      <div class="flex flex-col">
        <input
          type="file"
          class="file-input file-input-bordered"
          accept=".png,.jpg"
          multiple
          bind:files={imgUpload}
          on:change={async () => {
            for (let blob of imgUpload) {
              let base64 = await blobToBase64(blob);
              if (typeof base64 == "string") {
                imageBlobs.push(base64);
              }
              imageBlobs = imageBlobs;
            }
          }}
        />
        <div class="grid grid-cols-8 gap-4" id="storageRow">
          {#each imageBlobs as img, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class:pointer-events-none={moving}
              on:mouseenter={() => {
                imageSelect = { id: i, src: img };
              }}
            >
              <Tile bind:this={tierTiles[`${0}${i}`]} imgsrc={img}></Tile>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<dialog class="modal" bind:this={settings}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Tier Settings</h3>
    <div class="flex flex-col py-4 gap-4">
      <div class="flex flex-row gap-2 justify-center">
        <input
          class="input input-bordered"
          type="text"
          bind:value={tiers[tierSelect].name}
        />
        <button
          class="btn btn-error"
          on:click={() => {
            tiers.splice(tierSelect, 1);
            settings.close();
            tierSelect = 0;
            tiers = tiers;
          }}
        >
          <svg class="w-8 h-8 fill-error-content" viewBox="0 0 612 612">
            <g>
              <g>
                <g>
                  <path
                    d="M510.812,85.933c-29.254-14.929-58.367-16.325-59.592-16.375c-0.246-0.012-0.492-0.017-0.737-0.017H404.18
				c0.003-0.139,0.022-0.273,0.022-0.415c0-26.812-12.761-48.09-35.931-59.913c-16.138-8.234-31.876-9.122-33.618-9.194
				C334.409,0.006,334.163,0,333.917,0h-55.832c-0.246,0-0.492,0.006-0.737,0.017c-1.741,0.074-17.48,0.96-33.616,9.194
				C220.56,21.035,207.8,42.313,207.8,69.124c0,0.142,0.017,0.276,0.022,0.415h-46.303c-0.246,0-0.492,0.006-0.737,0.017
				c-1.226,0.051-30.337,1.446-59.593,16.375c-28.241,14.41-61.905,44.075-61.905,103.548c0,9.581,7.767,17.35,17.35,17.35h15.245
				l67.087,390.755c1.43,8.328,8.65,14.416,17.099,14.416h299.873c8.449,0,15.67-6.088,17.099-14.416l67.087-390.755h15.245
				c9.581,0,17.35-7.768,17.35-17.35C572.718,130.006,539.053,100.341,510.812,85.933z M75.398,172.13
				c4.22-24.493,17.846-42.891,40.665-54.828c21.272-11.123,43.329-12.888,45.936-13.063h288.005
				c2.585,0.172,24.08,1.906,45.034,12.6c23.361,11.922,37.29,30.475,41.562,55.29L75.398,172.13L75.398,172.13z M242.5,69.125
				c0-13.566,5.156-22.656,16.226-28.599c8.889-4.773,18.372-5.701,19.886-5.825h54.742c1.736,0.142,11.12,1.102,19.92,5.825
				c11.07,5.944,16.228,15.033,16.228,28.599c0,0.142,0.017,0.276,0.022,0.415H242.48C242.482,69.401,242.5,69.265,242.5,69.125z
				 M441.312,577.301H170.688l-63.605-370.472h397.834L441.312,577.301z"
                  />
                  <path
                    d="M306,519.57c9.581,0,17.35-7.768,17.35-17.35V257.909c0-9.581-7.768-17.35-17.35-17.35c-9.583,0-17.35,7.768-17.35,17.35
				V502.22C288.65,511.802,296.419,519.57,306,519.57z"
                  />
                  <path
                    d="M203.782,503.754c0.801,9.022,8.373,15.816,17.261,15.816c0.513,0,1.032-0.023,1.553-0.068
				c9.545-0.847,16.596-9.273,15.749-18.816l-21.687-244.311c-0.847-9.545-9.265-16.609-18.817-15.749
				c-9.545,0.847-16.595,9.27-15.748,18.816L203.782,503.754z"
                  />
                  <path
                    d="M389.404,519.502c0.52,0.045,1.04,0.068,1.553,0.068c8.889,0,16.462-6.794,17.263-15.816l21.687-244.313
				c0.847-9.545-6.202-17.968-15.748-18.816c-9.544-0.856-17.968,6.204-18.817,15.749l-21.687,244.311
				C372.808,510.229,379.859,518.655,389.404,519.502z"
                  />
                </g>
              </g>
            </g>
          </svg>
        </button>
      </div>

      <div class="flex flex-row justify-center gap-2">
        {#each Object.values(Colors) as color}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="rounded-full min-w-8 min-h-8 border-solid border-black border-4"
            style="background-color: {color};"
            on:click={() => {
              tiers[tierSelect].color = color;
            }}
          ></div>
        {/each}
        <input
          class="input rounded-full w-8 h-8 border-4 border-black border-solid"
          style="background-color: {tiers[tierSelect].color};"
          type="color"
          bind:value={tiers[tierSelect].color}
        />
      </div>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
