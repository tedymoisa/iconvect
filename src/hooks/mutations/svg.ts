import { apiUrl } from "@/lib/constants";
import { type ApiResponse } from "@/lib/types/api-response";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { sleep } from "openai/core.mjs";

export function useSvgGenerate() {
  return useMutation({
    mutationFn: async () => {
      // const { data } = await axios.post<ApiResponse<string>>(`${apiUrl}/api/svg/gemini/generate`, {
      //   prompt
      // });

      // return data.result;
      const { data } = await axios.get<ApiResponse<string>>(`${apiUrl}/api/svg`);

      await sleep(5000);
      return data.result;
    },
    onSuccess: () => {
      const scrollAmount = 300;
      const duration = 1000;
      const start = window.scrollY;
      const target = start + scrollAmount;

      if (Math.abs(window.scrollY - target) < 1) return;

      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeInOut = 0.5 * (1 - Math.cos(Math.PI * progress));
        window.scrollTo(0, start + scrollAmount * easeInOut);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }
  });
}
