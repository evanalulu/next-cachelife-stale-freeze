import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

async function getValue() {
  "use cache";
  cacheLife("frozen");
  cacheTag("frozen");
  return Math.random().toString(36).slice(2, 10);
}

async function Cached() {
  return <p data-v={await getValue()}>cached</p>;
}

async function Live() {
  await connection();
  return <p>live {Date.now()}</p>;
}

export default function Page() {
  return (
    <main>
      <Suspense fallback={<p>loading</p>}>
        <Cached />
      </Suspense>
      <Suspense fallback={<p>loading</p>}>
        <Live />
      </Suspense>
    </main>
  );
}
