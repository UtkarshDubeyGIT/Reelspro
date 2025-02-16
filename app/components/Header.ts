import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogIn } from "lucide-react";

function Header() {

  const { data: session } = useSession();


  const handleSignout = async () => {

    try {
      await signOut();
    } catch (error) {

    }

  };

  return (
    <div>
      <button onClick={handleSignout}>Signout</button>
      {session ? (<div>Welcome<div>) : (<div>
        <Link href="/login">LogIn</Link>
        <Link href="/register">Register</Link>
        </div>)}
    </div>
  );
}

export default Header;
