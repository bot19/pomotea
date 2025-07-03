import React from "react";

/**
 * Debug component to display development information
 * Remove this component in production builds
 */
function Debug({ dayData, fullStorageData }) {
  return (
    <div
      style={{
        marginTop: "20px",
        padding: "10px",
        backgroundColor: "#f0f0f0",
        fontSize: "12px",
        fontFamily: "monospace",
        height: "290px",
        overflow: "auto",
        border: "1px solid #ccc",
      }}
    >
      <h4>Debug - Current Day Data:</h4>
      <pre>{JSON.stringify(dayData, null, 2)}</pre>

      <h4>Debug - Full Storage Array:</h4>
      <pre>{JSON.stringify(fullStorageData, null, 2)}</pre>
    </div>
  );
}

export default Debug;
