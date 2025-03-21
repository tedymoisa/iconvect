"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? <pre>{JSON.stringify(session, null, 2)}</pre> : <p>Not signed in</p>}
      <h1>NextAuth.js Example</h1>
      <button
        onClick={async () => {
          await signIn("github");
        }}
      >
        login
      </button>
      <button
        onClick={async () => {
          await signOut();
        }}
      >
        logout
      </button>
    </div>
  );
}
