window.addEventListener("DOMContentLoaded", () => {
  const path = document.querySelector("path");
  const markers = Array.from(document.querySelectorAll(".map-marker"));
  const char = document.querySelector(".map-character");
  const map = document.querySelector("#map-background");
    const parallaxFactor = 1.5;
  const svg = path.ownerSVGElement;

  // Build a smooth path using cubic Bézier curves
  let d = `M ${markers[0].getAttribute("cx")} ${markers[0].getAttribute("cy")}`;
  for (let i = 1; i < markers.length; i++) {
    const prev = markers[i - 1];
    const curr = markers[i];

    // control points halfway between previous and current
    const c1x = +prev.getAttribute("cx");
    const c1y = (+prev.getAttribute("cy") + +curr.getAttribute("cy")) / 2;
    const c2x = +curr.getAttribute("cx");
    const c2y = (+prev.getAttribute("cy") + +curr.getAttribute("cy")) / 2;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${curr.getAttribute("cx")} ${curr.getAttribute("cy")}`;
  }
  path.setAttribute("d", d);

  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength;
  path.style.strokeDashoffset = pathLength;

  // Precompute marker positions along path
  function getMarkerLengths(markers, path) {
    const lengths = [];
    const sampleCount = 1000;
    for (let m of markers) {
      const cx = +m.getAttribute("cx");
      const cy = +m.getAttribute("cy");

      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i <= sampleCount; i++) {
        const pt = path.getPointAtLength((i / sampleCount) * pathLength);
        const dx = pt.x - cx;
        const dy = pt.y - cy;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          closest = (i / sampleCount) * pathLength;
        }
      }
      lengths.push(closest);
    }
    return lengths;
  }

  const markerLengths = getMarkerLengths(markers, path);

  function update() {
    const offset = window.scrollY * parallaxFactor;
    //map.style.transform = `translateY(-${offset}px)`;
    const viewportCenter = window.scrollY + window.innerHeight / 2;

    // Y positions of markers
    const markerYPositions = markers.map(m => {
      const rect = m.getBoundingClientRect();
      return rect.top + window.scrollY + rect.height / 2;
    });

    // Determine segment
    let segmentIndex = 0;
    for (let i = 0; i < markerYPositions.length - 1; i++) {
      if (viewportCenter >= markerYPositions[i] && viewportCenter <= markerYPositions[i + 1]) {
        segmentIndex = i;
        break;
      }
      if (viewportCenter > markerYPositions[markerYPositions.length - 1]) {
        segmentIndex = markerYPositions.length - 2;
      }
    }
    segmentIndex = Math.max(0, Math.min(segmentIndex, markers.length - 2));

    // Interpolate along path length
    const startLength = markerLengths[segmentIndex];
    const endLength = markerLengths[segmentIndex + 1];
    const localProgress = (viewportCenter - markerYPositions[segmentIndex]) /
                          (markerYPositions[segmentIndex + 1] - markerYPositions[segmentIndex]);
    const pointAtLength = startLength + localProgress * (endLength - startLength);

    // Animate path
    path.style.strokeDashoffset = pathLength - pointAtLength;

    // Move character
    const pos = path.getPointAtLength(pointAtLength);
    const screenPos = svgPointToScreen(svg, pos.x, pos.y);
    char.style.left = screenPos.x + "px";
    char.style.top = screenPos.y + "px";

    function svgPointToScreen(svg, x, y) {
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;

  return {
    x: (x / vb.width) * rect.width,
    y: (y / vb.height) * rect.height
  };
}
  }

  window.addEventListener("scroll", update);
  window.addEventListener("resize", update);
  update();
});
