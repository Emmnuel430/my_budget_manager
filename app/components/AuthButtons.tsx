"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function AuthButtons() {
  const { isSignedIn } = useUser();

  if (isSignedIn) return null;

  return (
    <div className="flex justify-center items-center">
      <Link
        href={"/sign-in"}
        className="btn btn-sm md:btn-md btn-outline btn-accent"
      >
        Se connecter
      </Link>
      <Link href={"/sign-up"} className="btn btn-sm md:btn-md ml-2 btn-accent">
        S&apos;inscrire
      </Link>
    </div>
  );
}
