import React, { useState } from "react";
import { Settings } from "./Settings";

function MultiTab({ setPomoDuration }) {
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

      {openTab === "settings" && <Settings setPomoDuration={setPomoDuration} />}
    </section>
  );
}

export default MultiTab;
