export default function Home() {
  return (
    <ul>
      <li>
        <a href="/frozen">/frozen</a>: cacheLife stale 0, revalidate 15, expire 300
      </li>
      <li>
        <a href="/ok">/ok</a>: cacheLife stale 30, revalidate 15, expire 300
      </li>
    </ul>
  );
}
