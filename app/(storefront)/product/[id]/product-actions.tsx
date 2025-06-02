'use client';

import { addItem, buyNow } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ResultType = { success: boolean; message?: string };

export function ProductActions({ productId, status }: { productId: string; status: "published" | "archived" }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const isOutOfStock = status === "archived";

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    setIsAddingToCart(true);
    try {
      const result = (await addItem(productId)) as ResultType;
      if (result?.success) {
        toast({
          title: "Success",
          description: "Item added to cart",
          action: (
            <Link href="/bag">
              <Button variant="link" className="gap-x-2 whitespace-nowrap">
                <span>Open cart</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          )
        });
      } else {
        throw new Error("Failed to add item to cart");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    setIsBuyingNow(true);
    try {
      const result = (await buyNow(productId)) as ResultType;
      if (result?.success) {
        router.push("/bag");
      } else {
        throw new Error("Please sign in to add items to the cart.");
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== "Please sign in to add items to the cart.") {
        toast({
          title: "View cart",
          description: "Item has been added to cart!",
          variant: "default",
        });
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 mt-6">
      <Button 
        onClick={handleAddToCart} 
        disabled={isAddingToCart || isBuyingNow || isOutOfStock}
        size="lg"
      >
        {isAddingToCart ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 h-5 w-5" />
        )}
        {isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
      </Button>
      <Button 
        onClick={handleBuyNow}
        disabled={isAddingToCart || isBuyingNow || isOutOfStock}
        size="lg"
        variant="secondary"
      >
        {isBuyingNow ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-5 w-5" />
        )}
        {isOutOfStock ? "Out of Stock" : isBuyingNow ? "Processing..." : "Buy Now"}
      </Button>
    </div>
  );
}

