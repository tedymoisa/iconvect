import { api } from "@/trpc/server";
import Test from "./test";

export default async function HomePage() {
  const hello = await api.post.hello({ text: "from tRPC" });

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* {Array.from({ length: 100 }).map((_, index) => {
        return <span>Hello ass asdasdasdasdadsa fasfasfasffs{index}</span>;
      })} */}
      {hello.greeting}
      <Test />
    </div>
  );
}
