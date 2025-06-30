import React, { useState } from "react";

/**
 * MultiTab component for future features
 * Currently simplified to focus on basic timer functionality
 */
function MultiTab() {
  const [openTab, setOpenTab] = useState("");

  return (
    <section className={`multitab ${openTab.length > 0 ? "is-open" : ""}`}>
      <div className="tabs">
        <button
          onClick={() =>
            setOpenTab((prev) => (prev === "settings" ? "" : "settings"))
          }
        >
          Settings
        </button>

        <button onClick={() => setOpenTab("faq")} disabled>
          FAQ
        </button>

        <button onClick={() => console.log("go home")} disabled>
          Home
        </button>
      </div>

      {openTab.length > 0 && <hr />}

      {openTab === "settings" && (
        <div className="settings">
          <p>Settings coming soon...</p>
        </div>
      )}
    </section>
  );
}

export default MultiTab;
