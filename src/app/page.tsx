import { api } from "@/trpc/server";
import Test from "./test";

export default async function HomePage() {
  const prices = await api.stripe.prices();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* {Array.from({ length: 100 }).map((_, index) => {
        return <span>Hello ass asdasdasdasdadsa fasfasfasffs{index}</span>;
      })} */}
      <pre>{JSON.stringify(prices, null, 2)}</pre>
      <Test />
    </div>
  );
}
