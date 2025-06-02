"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { bannerSchema, productSchema } from "./lib/zodSchemas";
import prisma from "./lib/db";
import { redis } from "./lib/redis";
import { Cart } from "./lib/interfaces";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

type ResultType = {
  success: boolean;
  message?: string;
};

const allowedEmails = [
  "geofreypaul40@gmail.com",
  "thalapatrick2003@gmail.com",
  "makungwafortune78@gmail.com",
  "mikefchimwaza03@gmail.com",
  "msosadaina@gmail.com",
];

export async function createProduct(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  await prisma.product.create({
    data: {
      name: submission.value.name,
      description: submission.value.description,
      status: submission.value.status,
      price: submission.value.price,
      images: flattenUrls,
      category: submission.value.category,
      isFeatured: submission.value.isFeatured === true ? true : false,
    },
  });

  redirect("/dashboard/products");
}

export async function editProduct(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  const productId = formData.get("productId") as string;
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      name: submission.value.name,
      description: submission.value.description,
      category: submission.value.category,
      price: submission.value.price,
      isFeatured: submission.value.isFeatured === true ? true : false,
      status: submission.value.status,
      images: flattenUrls,
    },
  });

  redirect("/dashboard/products");
}

export async function deleteProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return redirect("/");
  }

  await prisma.product.delete({
    where: {
      id: formData.get("productId") as string,
    },
  });

  redirect("/dashboard/products");
}

export async function createBanner(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "geofreypaul40@gmail.com") {
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: bannerSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.banner.create({
    data: {
      title: submission.value.title,
      imageString: submission.value.imageString,
    },
  });

  redirect("/dashboard/banner");
}

export async function deleteBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "geofreypaul40@gmail.com") {
    return redirect("/");
  }

  await prisma.banner.delete({
    where: {
      id: formData.get("bannerId") as string,
    },
  });

  redirect("/dashboard/banner");
}

export async function addItem(productId: string): Promise<ResultType> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  // Retrieve existing cart from Redis
  const cart: Cart | null = await redis.get(`cart-${user.id}`);

  const selectedProduct = await prisma.product.findUnique({
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
    },
    where: {
      id: productId,
    },
  });

  if (!selectedProduct) {
    throw new Error("No product with this id");
  }

  let myCart: Cart;

  if (!cart || !cart.items) {
    // No existing cart: initialize with default productType
    myCart = {
      productType: "giftcard",
      userId: user.id,
      items: [
        {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          imageString: selectedProduct.images[0],
          quantity: 1,
        },
      ],
    };
  } else {
    // Existing cart: preserve productType
    myCart = {
      productType: cart.productType,
      userId: cart.userId,
      items: cart.items.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    };

    // If product not in cart, append it
    const exists = myCart.items.some((item) => item.id === productId);
    if (!exists) {
      myCart.items.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        imageString: selectedProduct.images[0],
        quantity: 1,
      });
    }
  }

  await redis.set(`cart-${user.id}`, myCart);
  revalidatePath("/", "layout");

  return { success: true, message: "Product added to cart" };
}

export async function buyNow(productId: string): Promise<ResultType> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "User not authenticated, redirect to login",
    };
  }

  const cart: Cart | null = await redis.get(`cart-${user.id}`);
  const selectedProduct = await prisma.product.findUnique({
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
    },
    where: { id: productId },
  });

  if (!selectedProduct) {
    throw new Error("Product not found");
  }

  let myCart: Cart;

  if (!cart || !cart.items) {
    // Initialize cart with default productType
    myCart = {
      productType: "giftcard",
      userId: user.id,
      items: [
        {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          imageString: selectedProduct.images[0],
          quantity: 1,
        },
      ],
    };
  } else {
    // Preserve productType from existing cart
    myCart = {
      productType: cart.productType,
      userId: cart.userId,
      items: cart.items.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    };

    // Append product if not present
    const exists = myCart.items.some((item) => item.id === productId);
    if (!exists) {
      myCart.items.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        imageString: selectedProduct.images[0],
        quantity: 1,
      });
    }
  }

  await redis.set(`cart-${user.id}`, myCart);

  // Redirect to bag page
  redirect("/bag");

  return { success: true, message: "Product added to cart" };
}

export async function delItem(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  const productId = formData.get("productId");
  const cart: Cart | null = await redis.get(`cart-${user.id}`);

  if (cart && cart.items) {
    const updatedItems = cart.items.filter((item) => item.id !== productId);
    const updateCart: Cart = {
      productType: cart.productType,
      userId: user.id,
      items: updatedItems,
    };

    await redis.set(`cart-${user.id}`, updateCart);
  }

  revalidatePath("/bag");
}


export async function checkOut() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  const cart: Cart | null = await redis.get(`cart-${user.id}`);

  if (cart && cart.items) {
    // Generate a unique deposit ID
    const depositId = crypto.randomUUID();

    // Calculate amount in USD
    const amountInUSD = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Convert USD to MWK (using your exchange rate)
    const exchangeRate = 4700;
    const amountInMWK = Math.round(amountInUSD * exchangeRate * 100) / 100;

    // Store payment details in Redis for verification
    await redis.set(
      `payment-${depositId}`,
      {
        userId: user.id,
        amount: amountInMWK,
        cartKey: `cart-${user.id}`,
      },
      { ex: 3600 }
    ); // Expire in 1 hour

    return redirect(`/payment-page`);
  }

  return redirect("/");
}

export async function updateQuantity(
  productId: string,
  quantity: number,
  userId: string
) {
  const cart: Cart | null = await redis.get(`cart-${userId}`);
  if (cart && cart.items) {
    const updatedItems = cart.items.map((item) =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
    await redis.set(`cart-${userId}`, { ...cart, items: updatedItems });
    revalidatePath("/bag");
  }
}