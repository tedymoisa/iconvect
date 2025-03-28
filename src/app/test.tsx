"use client";

import { useMemo, useState } from "react";

function Test() {
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");

  const fetchData = async (value: string) => {
    setIsLoading(true);

    fetch("/api/svg", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
      // body: JSON.stringify({ prompt: value ?? "Generate an svg of a wrench." })
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setData(data.result);
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => setIsLoading(false));
  };

  const svgDataUri = useMemo(() => {
    if (!data) return null;
    try {
      const base64Svg = btoa(data);

      return `data:image/svg+xml;base64,${base64Svg}`;
    } catch (e) {
      console.error("Error encoding SVG to Base64:", e);

      return null; // Return null if encoding fails
    }
  }, [data]);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="m-4 w-[36rem] rounded-md p-4"
        />
        <button onClick={() => fetchData(value)}>click</button>
      </div>
      {isLoading && <span>Loading...</span>}
      {data && <img src={svgDataUri!} alt="Error generating image" className="size-28" />}
      {data && (
        <pre className="svg-code-block">
          <code>{data}</code>
        </pre>
      )}
    </div>
  );
}

export default Test;
