import React from "react";

// Lightweight icon component referencing the official Dirham symbol SVG.
// Note: This loads the SVG from Wikimedia at runtime. If you prefer bundling
// locally, we can download it into /public or /src/assets and import it.
const DirhamIcon = ({ className = "w-4 h-4" }) => (
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/e/ee/UAE_Dirham_Symbol.svg"
    alt="AED"
    className={`inline-block align-[-0.1em] ${className}`}
    loading="lazy"
    referrerPolicy="no-referrer"
  />
);

export default DirhamIcon;
