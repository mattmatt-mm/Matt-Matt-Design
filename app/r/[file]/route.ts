import { componentsPath, installableComponents, type InstallableModule } from "@/lib/component-library";
import { getLibrarySource } from "@/lib/component-library-source";
import { siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ file: "registry.json" }, ...installableComponents.map(({ slug }) => ({ file: `${slug}.json` }))];
}

async function registryItem({ slug, title, description, installDependencies }: InstallableModule) {
  const files = await getLibrarySource(slug);
  return {
    name: slug,
    type: "registry:component",
    title,
    description,
    dependencies: installDependencies,
    files: files.map(({ name, text }) => ({
      path: `components/${slug}/${name}`,
      type: name.endsWith(".css") ? "registry:file" : "registry:component",
      target: `@components/${slug}/${name}`,
      content: text,
    })),
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (file === "registry.json") {
    return Response.json({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: siteName,
      homepage: `${siteUrl}${componentsPath}`,
      items: await Promise.all(installableComponents.map(registryItem)),
    });
  }

  const component = installableComponents.find(({ slug }) => file === `${slug}.json`);
  if (!component) return Response.json({ error: "Registry item not found" }, { status: 404 });

  return Response.json({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...await registryItem(component),
  });
}
