import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const AUTHORIZED_EMAILS = [
  "geofreypaul40@gmail.com",
  "msosadaina@gmail.com",
]

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      try {
        const user = await getUser();

        // If user doesn't exist or email is not authorized, throw an error
        if (!user || !user.email || !AUTHORIZED_EMAILS.includes(user.email)) {
          throw new UploadThingError("Unauthorized")
        }

        // Returning metadata accessible in `onUploadComplete`
        return { userId: user.id };
      } catch (error) {
        console.error("Error during upload middleware:", error);
        throw new UploadThingError("An error occurred during upload");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // This code RUNS ON YOUR SERVER after upload
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.url);

        // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { uploadedBy: metadata.userId };
      } catch (error) {
        console.error("Error during upload completion:", error);
        throw new UploadThingError("Error finalizing upload");
      }
    }),

  bannerImageRoute: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      try {
        const user = await getUser();

        // If user doesn't exist or email is not authorized, throw an error
        if (!user || !user.email || !AUTHORIZED_EMAILS.includes(user.email)) {
          throw new UploadThingError("Unauthorized")
        }

        // Returning metadata accessible in `onUploadComplete`
        return { userId: user.id };
      } catch (error) {
        console.error("Error during banner image upload middleware:", error);
        throw new UploadThingError(
          "An error occurred during banner image upload"
        );
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // This code RUNS ON YOUR SERVER after upload
        console.log(
          "Banner image upload complete for userId:",
          metadata.userId
        );
        console.log("file url", file.url);

        // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { uploadedBy: metadata.userId };
      } catch (error) {
        console.error("Error during banner image upload completion:", error);
        throw new UploadThingError("Error finalizing banner image upload");
      }
    }),

  // New route for payment screenshots
  paymentScreenshotRoute: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      try {
        const user = await getUser();

        // If user doesn't exist, throw an error
        if (!user) {
          throw new UploadThingError("Unauthorized");
        }

        // Returning metadata accessible in `onUploadComplete`
        return { userId: user.id };
      } catch (error) {
        console.error(
          "Error during payment screenshot upload middleware:",
          error
        );
        throw new UploadThingError(
          "An error occurred during payment screenshot upload"
        );
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // This code RUNS ON YOUR SERVER after upload
        console.log(
          "Payment screenshot upload complete for userId:",
          metadata.userId
        );
        console.log("file url", file.url);

        // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { uploadedBy: metadata.userId };
      } catch (error) {
        console.error(
          "Error during payment screenshot upload completion:",
          error
        );
        throw new UploadThingError(
          "Error finalizing payment screenshot upload"
        );
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;