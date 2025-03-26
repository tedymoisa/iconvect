export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {Array.from({ length: 100 }).map((_, index) => {
        return <span>Hello ass asdasdasdasdadsa fasfasfasffs{index}</span>;
      })}
    </div>
  );
}
