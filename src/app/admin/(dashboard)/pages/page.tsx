import { getPageAssets } from "@/lib/page-assets";
import { updatePageAssets } from "@/lib/admin-actions";
import { PageAssetsForm } from "@/components/admin/page-assets-form";

export const dynamic = "force-dynamic";

export default async function AdminPagesImagesPage() {
  const homeAssets = await getPageAssets("home");
  const aboutAssets = await getPageAssets("about");

  const homeAction = updatePageAssets.bind(null, "home");
  const aboutAction = updatePageAssets.bind(null, "about");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">Page Images CMS</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage dynamic header backgrounds and feature section photos for the storefront pages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PageAssetsForm
          page="home"
          title="Homepage Images"
          description="Update the hero background banner and secondary features for the landing page."
          slots={[
            {
              name: "hero_bg",
              label: "Hero Background Image URL",
              defaultValue: homeAssets.hero_bg || "",
              aspectRatio: "video",
            },
            {
              name: "craft_image",
              label: "Crafted Section Image URL",
              defaultValue: homeAssets.craft_image || "",
              aspectRatio: "portrait",
            },
          ]}
          submitAction={homeAction}
        />

        <PageAssetsForm
          page="about"
          title="About Page Images"
          description="Update the main headers and process pictures for our shop brand story page."
          slots={[
            {
              name: "about_hero",
              label: "Hero Banner Image URL",
              defaultValue: aboutAssets.about_hero || "",
              aspectRatio: "wide",
            },
            {
              name: "about_craft",
              label: "Our Craft Section Image URL",
              defaultValue: aboutAssets.about_craft || "",
              aspectRatio: "video",
            },
          ]}
          submitAction={aboutAction}
        />
      </div>
    </div>
  );
}
