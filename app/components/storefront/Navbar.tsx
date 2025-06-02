import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redis } from "@/app/lib/redis";
import { Cart } from "@/app/lib/interfaces";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const cart: Cart | null = await redis.get(`cart-${user?.id}`);
  const cartTotal = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <NavbarClient 
      user={user ? {
        email: user.email as string,
        given_name: user.given_name as string,
        picture: user.picture as string
      } : null} 
      cartTotal={cartTotal}
    />
  );
}

