import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-20">
      <h1 className="font-serif text-4xl">That home is not listed.</h1>
      <Link href="/" className="mt-4 inline-block text-[var(--accent)]">
        Back to all homes
      </Link>
    </div>
  );
}
