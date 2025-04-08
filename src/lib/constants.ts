import { env } from "@/env";

export const apiUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const MOCK_SVG = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" rx="15" fill="#6D28D9"/>
<path d="M30 70L50 30L70 70H30Z" stroke="#A7F3D0" stroke-width="5" stroke-linejoin="round"/>
</svg>
`;
