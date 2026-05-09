import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Landing() {
  const session = await auth();
  if (session?.user) redirect("/workout");

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-lg">
            Forge
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="/signin">Sign in</Link>
          </Button>
        </div>
      </header>
      <section className="flex-1 mx-auto w-full max-w-6xl px-6 py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
            Pick a muscle. <span className="text-primary">See the science.</span> Eat the macros.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            An interactive 3D mannequin surfaces exercises ranked by EMG and hypertrophy
            meta-analyses. A vision model reads your meal photos and proposes macros — you
            confirm before they save. Nothing silent.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link href="/signin">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/workout">Browse exercises</Link>
            </Button>
          </div>
          <ul className="grid grid-cols-2 gap-3 pt-6 text-sm text-muted-foreground">
            <li>· 70+ evidence-scored exercises</li>
            <li>· 15 muscle groups, click to filter</li>
            <li>· AI photo macros (with confidence)</li>
            <li>· Session log + progress history</li>
          </ul>
        </div>
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-secondary to-muted border flex items-center justify-center">
          <div className="text-center text-sm text-muted-foreground p-8">
            <div className="text-6xl mb-4">⚙</div>
            Sign in to load the mannequin
          </div>
        </div>
      </section>
    </main>
  );
}
