"use client";

import { useState } from "react";

function Test() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    fetch("/api/svg/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: "Generate an svg of a wrench." }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setData(data);
      })
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div>
      {JSON.stringify(data, null, 2)}
      <button onClick={fetchData}>click</button>
    </div>
  );
}

export default Test;
