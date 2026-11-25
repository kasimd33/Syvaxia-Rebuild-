import type { Metadata } from "next";

import CloudWatchForm from "@/components/ui/cloud-watch-form";

/**
 * Preview route for the Cloud Watch mascot form pattern
 * (src/components/ui/cloud-watch-form.tsx). Not linked from navigation.
 */
export const metadata: Metadata = {
  title: "Cloud Watch form demo | Syvaxia",
  robots: { index: false },
};

export default function CloudWatchDemoPage() {
  return <CloudWatchForm />;
}
