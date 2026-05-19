"use client"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/registry/dash/ui/navigation-menu"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const tribes = [
  { href: "/reservasi", title: "Reservasi", description: "Scheduled-pickup mitra. 3-miss auto-suspend rule." },
  { href: "/express", title: "Express", description: "Same-day pickup with surge pricing." },
  { href: "/bulk", title: "Bulk", description: "Multi-package consolidation B2B." },
  { href: "/halo-dash", title: "Halo-dash", description: "Backoffice support module." },
]

export default function NavigationMenuDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Navigation"
        title="Navigation Menu"
        description="Top-level horizontal nav with hover-mega-menus. Use for marketing site, public Dash dashboard, multi-product shell. For sidebar shell use Sidebar."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add navigation-menu`} />
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="Top nav with mega menu"
          preview={
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Tribes</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[28rem] gap-2 p-3 md:grid-cols-2">
                      {tribes.map((t) => (
                        <li key={t.href}>
                          <NavigationMenuLink asChild>
                            <a
                              href={t.href}
                              className="block rounded-md p-3 hover:bg-bg-weak-50"
                            >
                              <div className="text-sm font-medium text-text-strong-950">{t.title}</div>
                              <p className="text-xs text-text-sub-600 mt-0.5 leading-relaxed">
                                {t.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/docs" className={navigationMenuTriggerStyle()}>
                    Docs
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/changelog" className={navigationMenuTriggerStyle()}>
                    Changelog
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          }
          code={`<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Tribes</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[28rem] gap-2 p-3 md:grid-cols-2">
          {tribes.map((t) => (
            <li key={t.href}>
              <NavigationMenuLink asChild>
                <a href={t.href}>…</a>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/docs" className={navigationMenuTriggerStyle()}>
        Docs
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
        />
      </DocsSection>

      <DocsSection title="Simple link bar">
        <DocsExample
          title="No mega menu — flat nav"
          description="When you don&apos;t need dropdowns, use plain links with the shared trigger style."
          preview={
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/dashboard" className={navigationMenuTriggerStyle()}>Dashboard</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/mitra" className={navigationMenuTriggerStyle()}>Mitra</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/dispatch" className={navigationMenuTriggerStyle()}>Dispatch</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/halo-dash" className={navigationMenuTriggerStyle()}>Halo-dash</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          }
          code={`<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="/dashboard" className={navigationMenuTriggerStyle()}>
        Dashboard
      </NavigationMenuLink>
    </NavigationMenuItem>
    …
  </NavigationMenuList>
</NavigationMenu>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">NavigationMenu</h3>
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Controlled open menu id." },
            { name: "onValueChange", type: "(value: string) => void", description: "Open-menu callback." },
            { name: "delayDuration", type: "number", defaultValue: "200", description: "Hover-open delay (ms)." },
            { name: "skipDelayDuration", type: "number", defaultValue: "300", description: "Skip-delay window after first open." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">Slots</h3>
        <DocsPropsTable
          rows={[
            { name: "NavigationMenuList", type: "wrapper", description: "Flex row of items." },
            { name: "NavigationMenuItem", type: "wrapper", description: "One column. Holds either Trigger+Content or a plain Link." },
            { name: "NavigationMenuTrigger", type: "button", description: "Hover-opens mega menu with auto-rotating chevron." },
            { name: "NavigationMenuContent", type: "panel", description: "Mega menu content area, portal-rendered." },
            { name: "NavigationMenuLink", type: "anchor", description: "Wrap with asChild + Next/Link for client routing." },
            { name: "navigationMenuTriggerStyle()", type: "() => string", description: "Class string so plain links match Trigger height." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Top-level horizontal nav with hover-driven mega menus.</li>
          <li>• Use grid layout inside <code className="text-xs">NavigationMenuContent</code> for column-rich mega menus.</li>
          <li>• Pair with Tailwind&apos;s <code className="text-xs">md:hidden</code> + Sheet for mobile collapse — Navigation Menu is desktop-first.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Built on Radix Navigation Menu — full WAI-ARIA disclosure pattern.</li>
          <li>• Keyboard: <code className="text-xs">Tab</code> enters; <code className="text-xs">Arrow Left/Right</code> moves between triggers; <code className="text-xs">Arrow Down</code> opens content + moves focus inside; <code className="text-xs">Esc</code> closes.</li>
          <li>• Active route should set <code className="text-xs">data-active</code> or <code className="text-xs">aria-current=&quot;page&quot;</code> on the matching Link.</li>
          <li>• Mega menus must remain reachable for low-vision and slow-mouse users — Radix wires hover-intent timing automatically.</li>
          <li>• Don&apos;t put critical actions only inside hover-open content; always have a tappable parent route.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
