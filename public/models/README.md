# 3D models

Drop a glTF/GLB anatomy model named **`anatomy.glb`** into this directory and
the workout tab will load it instead of the parametric reference figure. No
code change is required — `src/components/workout/anatomy-glb.tsx` HEADs the
file at runtime and falls back to the parametric figure if it's missing.

## Recommended free / CC-licensed sources

The app expects a male anatomy / écorché reference with **named submeshes per
muscle** (so click-detection can tell the biceps apart from the triceps).
Here are the cleanest paths in roughly increasing effort:

### 1. Sketchfab "Downloadable" filter (quickest)

1. Open https://sketchfab.com/search?type=models&downloadable=true&q=ecorche+anatomy.
2. Filter by license — pick **CC0**, **CC-BY**, or **CC-BY-SA** depending on
   your project's needs.
3. Download as **glTF / GLB**.
4. Rename to `anatomy.glb` and drop it here. Commit.
5. If muscle clicks don't register, open the GLB in any glTF viewer
   (https://gltf-viewer.donmccurdy.com/), inspect the mesh names, and update
   `src/components/workout/muscle-mesh-mapping.ts` to match.

### 2. Z-Anatomy (CC0, highest fidelity)

https://www.z-anatomy.com — full-body anatomy under CC0. Source files are
Blender-native; export a male muscular layer to GLB:

```
Blender → File → Export → glTF 2.0
   - Format: glb
   - Limit to → Visible objects (just the muscular system)
   - Include → Custom Properties (preserves names)
```

Drop the resulting GLB here as `anatomy.glb`.

### 3. NIH 3D / NLM Visible Human

https://3d.nih.gov — public-domain anatomy assets. Variable quality and
naming, but free of attribution constraints.

## Mesh naming

The hit-detection in `muscle-mesh-mapping.ts` matches anatomical Latin terms
(`pectoralis_major`, `biceps_brachii`, `gluteus_maximus`, etc.). Most ecorché
models follow this convention. If yours uses different names — e.g.
`Body_Chest_L`, `m_quadriceps`, etc. — extend the patterns array in that
file. No re-build required at runtime; rebuild required for production.

## Performance

- Aim for **under 10 MB** GLB. Use Draco compression if your source is heavy
  (`gltf-pipeline` or Blender's "Compression" export option).
- One textured material with vertex colours typically reads cleanly. Avoid
  4K textures unless you really need them.
- The loader preloads via `useGLTF.preload("/models/anatomy.glb")` so the
  asset starts streaming the moment the workout tab is hit.
