export type NavItem = {
  title: string
  href: string
  status?: "shipped" | "wip" | "planned"
  /** Optional 1-line tagline for overview-page cards. */
  blurb?: string
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export type NavSection = {
  title: string
  groups: NavGroup[]
}

/* -------------------------------------------------------------------------- */
/*  SIDEBAR — shadcn-style IA (May 2026 restructure)                          */
/*                                                                            */
/*  Sections mirror shadcn/ui's mental model: Get Started → Installation →    */
/*  Theming → Library → Verticals → Registry → Tools. Each section surfaces  */
/*  the page-level routes the user actually needs in the rail; long detail   */
/*  inventories (76 components, 22 blocks, 70+ widgets, 100+ templates) live  */
/*  on overview pages (/docs/components, /docs/blocks, /docs/templates,       */
/*  /docs/product/widgets) and in the cmd+K command palette. Keeps the rail   */
/*  scannable instead of a 200-item firehose.                                 */
/* -------------------------------------------------------------------------- */

export const navSections: NavSection[] = [
  /* ----- Get Started (shadcn: Introduction → Installation → Theming → CLI) */
  {
    title: "Get Started",
    groups: [
      {
        title: "",
        items: [
          { title: "Introduction",   href: "/docs", status: "shipped" },
          { title: "Installation",   href: "/docs/installation", status: "shipped" },
          { title: "Quick Start",    href: "/docs/quick-start", status: "shipped" },
          { title: "PE Onboarding (Wave 5)", href: "/docs/onboarding", status: "new" },
          { title: "Dark Mode",      href: "/docs/foundations/dark-mode", status: "shipped" },
          { title: "Dash CLI",       href: "/docs/tools/cli", status: "shipped" },
          { title: "AI Rules",       href: "/docs/tools/ai-rules", status: "shipped" },
          { title: "Changelog",      href: "/docs/changelog", status: "shipped" },
        ],
      },
    ],
  },

  /* ----- Foundations (the design *system* layer — design tokens & assets) */
  {
    title: "Foundations",
    groups: [
      {
        title: "",
        items: [
          { title: "Color",         href: "/docs/foundations/color", status: "shipped" },
          { title: "Typography",    href: "/docs/foundations/typography", status: "shipped" },
          { title: "Icons",         href: "/docs/foundations/icons", status: "shipped" },
          { title: "Grid",          href: "/docs/foundations/grid", status: "shipped" },
          { title: "Shadows",       href: "/docs/foundations/shadows", status: "shipped" },
          { title: "Corner Radius", href: "/docs/foundations/corner-radius", status: "shipped" },
          { title: "Motion",        href: "/docs/foundations/motion", status: "shipped" },
        ],
      },
      {
        title: "Brand",
        items: [
          { title: "Dash Logo",        href: "/docs/foundations/dash-logo", status: "shipped" },
          { title: "Brand Assets",     href: "/docs/foundations/brand-assets", status: "shipped" },
          { title: "App Store Badges", href: "/docs/foundations/app-store-badges", status: "shipped" },
          { title: "Country Flags",    href: "/docs/foundations/country-flags", status: "shipped" },
          { title: "Emojis",           href: "/docs/foundations/emojis", status: "shipped" },
          { title: "Cursors",          href: "/docs/foundations/cursors", status: "shipped" },
        ],
      },
    ],
  },

  /* ----- Theming (CSS vars, semantic tokens, runtime customization) */
  {
    title: "Theming",
    groups: [
      {
        title: "",
        items: [
          { title: "Overview", href: "/docs/theming", status: "shipped" },
          { title: "Colors",   href: "/docs/theming/colors", status: "shipped" },
          { title: "Tokens",   href: "/docs/resources/tokens", status: "shipped" },
        ],
      },
    ],
  },

  /* ----- Library (the 3 catalog overviews — detail in cmd+K) */
  {
    title: "Library",
    groups: [
      {
        title: "",
        items: [
          { title: "Components", href: "/docs/components", status: "shipped", blurb: "76 primitives — buttons, inputs, overlays, navigation, feedback." },
          { title: "Blocks",     href: "/docs/blocks", status: "shipped", blurb: "22 production sections — auth, tables, lists, dashboard, settings." },
          { title: "Templates",  href: "/docs/templates", status: "shipped", blurb: "Page-level shells — generic + verticalized (Finance / HR / Marketing) + Dash-specific." },
          { title: "Patterns",   href: "/docs/patterns/tables", status: "shipped", blurb: "Composition recipes — common UI situations resolved end-to-end." },
        ],
      },
    ],
  },

  /* ----- Forms (top-level for discoverability — matches shadcn) */
  {
    title: "Forms",
    groups: [
      {
        title: "",
        items: [
          { title: "React Hook Form", href: "/docs/forms/react-hook-form", status: "shipped" },
          { title: "TanStack Form",   href: "/docs/forms/tanstack-form", status: "shipped" },
        ],
      },
    ],
  },

  /* ----- Product (sector verticals — sidebar shows only 3 overviews;
           70+ widget detail pages live in the per-section overview page) */
  {
    title: "Product",
    groups: [
      {
        title: "",
        items: [
          { title: "Navigation", href: "/docs/product/navigation", status: "shipped", blurb: "App shell navigation patterns." },
          { title: "Header",     href: "/docs/product/header", status: "shipped", blurb: "Top-bar variants with search, profile, theme toggle." },
          { title: "Widgets",    href: "/docs/product/widgets", status: "shipped", blurb: "70+ data widgets — HR, Finance, Marketing." },
        ],
      },
    ],
  },

  /* ----- Registry (build & publish your own) */
  {
    title: "Registry",
    groups: [
      {
        title: "",
        items: [
          { title: "Overview",            href: "/docs/registry", status: "shipped" },
          { title: "registry.json",       href: "/docs/registry/registry-json", status: "shipped" },
          { title: "registry-item.json",  href: "/docs/registry/registry-item-json", status: "shipped" },
          { title: "Authentication",      href: "/docs/registry/authentication", status: "shipped" },
          { title: "Examples",            href: "/docs/registry/examples", status: "shipped" },
        ],
      },
    ],
  },

  /* ----- Tools (MCP, skill — Dash CLI promoted to Get Started) */
  {
    title: "Tools",
    groups: [
      {
        title: "",
        items: [
          { title: "Install via CLI", href: "/docs/installation/cli", status: "shipped" },
          { title: "MCP Server",      href: "/docs/tools/mcp", status: "wip" },
          { title: "Skill",           href: "/docs/tools/skill", status: "wip" },
          { title: "Usage Dashboard", href: "/docs/admin/usage", status: "shipped" },
        ],
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  FULL INVENTORY — every detail page                                         */
/*  Consumed by:                                                              */
/*   - /docs/components, /docs/blocks, /docs/templates overview pages         */
/*   - DocsPageNav (prev/next breadcrumb at bottom of detail pages)          */
/*   - cmd+K command menu search                                              */
/* -------------------------------------------------------------------------- */

export type InventorySection = {
  title: string
  groups: NavGroup[]
}

export const componentInventory: InventorySection = {
  title: "Components",
  groups: [
    {
      title: "Actions",
      items: [
        // Buttons (7 variants) — consolidated under single "Buttons" entry.
        // Direct routes still live at /docs/components/{button-group,icon-button,…}
        // for `dash add <name>` install commands; nav surfaces only the master page.
        { title: "Buttons", href: "/docs/components/button", status: "shipped" },
        { title: "Toggle", href: "/docs/components/toggle", status: "shipped" },
        { title: "Toggle Group", href: "/docs/components/toggle-group", status: "shipped" },
        { title: "Segmented Control", href: "/docs/components/segmented-control", status: "shipped" },
      ],
    },
    {
      title: "Displaying Data",
      items: [
        { title: "Activity Feed", href: "/docs/components/activity-feed", status: "shipped" },
        { title: "Avatar", href: "/docs/components/avatar", status: "shipped" },
        { title: "Badge", href: "/docs/components/badge", status: "shipped" },
        { title: "Banner", href: "/docs/components/banner", status: "shipped" },
        { title: "Brand Mark", href: "/docs/components/brand-mark", status: "shipped" },
        { title: "Card", href: "/docs/components/card", status: "shipped" },
        { title: "Data Table", href: "/docs/components/data-table", status: "shipped" },
        { title: "Carousel", href: "/docs/components/carousel", status: "shipped" },
        { title: "Chart", href: "/docs/components/chart", status: "shipped" },
        { title: "Empty State", href: "/docs/components/empty-state", status: "shipped" },
        { title: "Skeleton", href: "/docs/components/skeleton", status: "shipped" },
        { title: "Stat", href: "/docs/components/stat", status: "shipped" },
        { title: "Kbd", href: "/docs/components/kbd", status: "shipped" },
        { title: "Table", href: "/docs/components/table", status: "shipped" },
        { title: "Table — Use Cases", href: "/docs/patterns/tables", status: "shipped" },
        { title: "Notification Feed", href: "/docs/components/notification-feed", status: "shipped" },
        { title: "Tag", href: "/docs/components/tag", status: "shipped" },
        { title: "Tooltip", href: "/docs/components/tooltip", status: "shipped" },
        { title: "Hover Card", href: "/docs/components/hover-card", status: "shipped" },
      ],
    },
    {
      title: "Charts",
      items: [
        { title: "Bubble Chart", href: "/docs/components/charts/bubble", status: "shipped" },
        { title: "Category Bar", href: "/docs/components/charts/category-bar", status: "shipped" },
        { title: "Pie Chart", href: "/docs/components/charts/pie", status: "shipped" },
        { title: "Progress Chart", href: "/docs/components/charts/progress", status: "shipped" },
      ],
    },
    {
      title: "Portal Primitives",
      items: [
        { title: "Animated Alert", href: "/docs/components/animated-alert", status: "shipped" },
        { title: "Announcement Bar", href: "/docs/components/announcement-bar", status: "shipped" },
        { title: "Information Banner", href: "/docs/components/information-banner", status: "shipped" },
        { title: "Fancy Loader", href: "/docs/components/fancy-loader", status: "shipped" },
        { title: "Spinner Loader", href: "/docs/components/spinner-loader", status: "shipped" },
        { title: "Shimmer", href: "/docs/components/shimmer", status: "shipped" },
        { title: "Availability Status", href: "/docs/components/availability-status", status: "shipped" },
        { title: "Notification Onboarding", href: "/docs/components/notification-onboarding", status: "shipped" },
        { title: "Theme Switch", href: "/docs/components/theme-switch", status: "shipped" },
        { title: "Language Select", href: "/docs/components/language-select", status: "shipped" },
        { title: "Upload Card", href: "/docs/components/upload-card", status: "shipped" },
        { title: "Shield Crown Icon", href: "/docs/components/shield-crown", status: "shipped" },
        { title: "Price With Discount", href: "/docs/components/price-with-discount", status: "shipped" },
        { title: "Discount Line Item", href: "/docs/components/discount-line-item", status: "shipped" },
      ],
    },
    {
      title: "Feedback",
      items: [
        { title: "Alert / Notification / Toast", href: "/docs/components/alert", status: "shipped" },
        { title: "Progress", href: "/docs/components/progress", status: "shipped" },
        { title: "Spinner", href: "/docs/components/spinner", status: "shipped" },
        { title: "Progress Circle", href: "/docs/components/progress-circle", status: "shipped" },
        { title: "Toaster", href: "/docs/components/toaster", status: "shipped" },
      ],
    },
    {
      title: "Form",
      items: [
        { title: "Checkbox", href: "/docs/components/checkbox", status: "shipped" },
        { title: "Color Picker", href: "/docs/components/color-picker", status: "shipped" },
        { title: "Calendar", href: "/docs/components/calendar", status: "shipped" },
        { title: "Date Picker", href: "/docs/components/date-picker", status: "shipped" },
        { title: "Field", href: "/docs/components/field", status: "shipped" },
        { title: "Hint", href: "/docs/components/hint", status: "shipped" },
        { title: "File Upload", href: "/docs/components/file-upload", status: "shipped" },
        { title: "Form", href: "/docs/components/form", status: "shipped" },
        { title: "Input", href: "/docs/components/input", status: "shipped" },
        { title: "Input OTP", href: "/docs/components/input-otp", status: "shipped" },
        { title: "Label", href: "/docs/components/label", status: "shipped" },
        { title: "Password Input", href: "/docs/components/password-input", status: "shipped" },
        { title: "Radio", href: "/docs/components/radio", status: "shipped" },
        { title: "Select", href: "/docs/components/select", status: "shipped" },
        { title: "Slider", href: "/docs/components/slider", status: "shipped" },
        { title: "Switch", href: "/docs/components/switch", status: "shipped" },
        { title: "Textarea", href: "/docs/components/textarea", status: "shipped" },
        { title: "Combobox", href: "/docs/components/combobox", status: "shipped" },
        { title: "Rating", href: "/docs/components/rating", status: "shipped" },
        { title: "Filter", href: "/docs/components/filter", status: "shipped" },
        { title: "Time Picker", href: "/docs/components/time-picker", status: "shipped" },
        { title: "Rich Editor", href: "/docs/components/rich-editor", status: "shipped" },
      ],
    },
    {
      title: "Layout",
      items: [
        { title: "Accordion", href: "/docs/components/accordion", status: "shipped" },
        { title: "Aspect Ratio", href: "/docs/components/aspect-ratio", status: "shipped" },
        { title: "Collapsible", href: "/docs/components/collapsible", status: "shipped" },
        { title: "Resizable", href: "/docs/components/resizable", status: "shipped" },
        { title: "Scroll Area", href: "/docs/components/scroll-area", status: "shipped" },
        { title: "Divider", href: "/docs/components/divider", status: "shipped" },
      ],
    },
    {
      title: "Navigation",
      items: [
        { title: "Breadcrumb", href: "/docs/components/breadcrumb", status: "shipped" },
        { title: "Navigation Menu", href: "/docs/components/navigation-menu", status: "shipped" },
        { title: "Pagination", href: "/docs/components/pagination", status: "shipped" },
        { title: "Sidebar", href: "/docs/components/sidebar", status: "shipped" },
        { title: "Step Indicator", href: "/docs/components/step-indicator", status: "shipped" },
        { title: "Dot Stepper", href: "/docs/components/dot-stepper", status: "shipped" },
        { title: "Tabs", href: "/docs/components/tabs", status: "shipped" },
      ],
    },
    {
      title: "Overlays",
      items: [
        { title: "Alert Dialog", href: "/docs/components/alert-dialog", status: "shipped" },
        { title: "Command Menu", href: "/docs/components/command", status: "shipped" },
        { title: "Context Menu", href: "/docs/components/context-menu", status: "shipped" },
        { title: "Modal", href: "/docs/components/modal", status: "shipped" },
        { title: "Drawer", href: "/docs/components/drawer", status: "shipped" },
        { title: "Dropdown Menu", href: "/docs/components/dropdown-menu", status: "shipped" },
        { title: "Menubar", href: "/docs/components/menubar", status: "shipped" },
        { title: "Popover", href: "/docs/components/popover", status: "shipped" },
        { title: "Sheet", href: "/docs/components/sheet", status: "shipped" },
      ],
    },
    {
      title: "Utils",
      items: [
        { title: "cn (class merge)", href: "/docs/components/utils-cn", status: "wip" },
        { title: "use-mobile", href: "/docs/components/use-mobile", status: "shipped" },
        { title: "use-debounce", href: "/docs/components/use-debounce", status: "shipped" },
      ],
    },
  ],
}

export const blockInventory: InventorySection = {
  title: "Blocks",
  groups: [
    {
      title: "Login",
      items: [
        { title: "Form + 2 SSO", href: "/docs/blocks/auth-login-phoenix", status: "shipped" },
        { title: "3 SSO + Form", href: "/docs/blocks/auth-login-apex", status: "shipped" },
        { title: "Minimal (no SSO)", href: "/docs/blocks/auth-login-key", status: "shipped" },
        { title: "Centered (legacy)", href: "/docs/blocks/login-01", status: "wip" },
        { title: "SSO row (legacy)", href: "/docs/blocks/login-02", status: "wip" },
        { title: "Split-screen (legacy)", href: "/docs/blocks/login-03", status: "wip" },
      ],
    },
    {
      title: "Register",
      items: [
        { title: "1 SSO + 4-field form", href: "/docs/blocks/auth-register-aurora", status: "shipped" },
        { title: "2 SSO + email-only", href: "/docs/blocks/auth-register-solaris", status: "shipped" },
        { title: "Minimal (no SSO)", href: "/docs/blocks/auth-register-key", status: "shipped" },
        { title: "Centered (legacy)", href: "/docs/blocks/signup-01", status: "wip" },
        { title: "SSO row (legacy)", href: "/docs/blocks/signup-02", status: "wip" },
        { title: "Split-screen (legacy)", href: "/docs/blocks/signup-03", status: "wip" },
      ],
    },
    {
      title: "Reset Password",
      items: [
        { title: "Email + support link", href: "/docs/blocks/auth-reset-password-key", status: "shipped" },
        { title: "Forgot Password (legacy)", href: "/docs/blocks/forgot-password-01", status: "wip" },
      ],
    },
    {
      title: "Verification",
      items: [
        { title: "4-digit OTP", href: "/docs/blocks/auth-verification-key", status: "shipped" },
        { title: "6-digit OTP (legacy)", href: "/docs/blocks/verification-otp", status: "wip" },
      ],
    },
    {
      title: "Tables",
      items: [
        { title: "Transactions Table", href: "/docs/blocks/transactions-table", status: "shipped" },
        { title: "Orders Table", href: "/docs/blocks/orders-table", status: "shipped" },
      ],
    },
    {
      title: "Lists",
      items: [
        { title: "Team Grid", href: "/docs/blocks/team-grid", status: "shipped" },
        { title: "Products Grid", href: "/docs/blocks/products-grid", status: "shipped" },
      ],
    },
    {
      title: "Dashboard",
      items: [
        { title: "Stat Card Grid", href: "/docs/blocks/stat-card-grid", status: "shipped" },
        { title: "Empty State Collection", href: "/docs/blocks/empty-state-collection", status: "shipped" },
        { title: "Analytics Grid", href: "/docs/blocks/analytics-grid", status: "shipped" },
        { title: "Activity Timeline", href: "/docs/blocks/activity-timeline", status: "shipped" },
        { title: "My Cards Stack", href: "/docs/blocks/my-cards-stack", status: "shipped" },
      ],
    },
    {
      title: "Settings",
      items: [
        { title: "Profile", href: "/docs/blocks/settings-profile", status: "shipped" },
        { title: "Notifications", href: "/docs/blocks/settings-notifications", status: "shipped" },
        { title: "Integrations", href: "/docs/blocks/settings-integrations", status: "shipped" },
        { title: "Team", href: "/docs/blocks/settings-team", status: "shipped" },
        { title: "Privacy & Security", href: "/docs/blocks/settings-privacy-security", status: "shipped" },
      ],
    },
    {
      title: "Layout Headers",
      items: [
        { title: "Page Header", href: "/docs/blocks/page-header", status: "shipped" },
        { title: "Section Header", href: "/docs/blocks/section-header", status: "shipped" },
      ],
    },
    {
      title: "Sector Widgets",
      items: [
        { title: "HR Widgets", href: "/docs/blocks/hr-widgets", status: "shipped" },
        { title: "Finance Widgets", href: "/docs/blocks/finance-widgets", status: "shipped" },
      ],
    },
    {
      title: "Composition Examples",
      items: [
        { title: "Badge — Top Contributor Card", href: "/docs/blocks/badge-upvote-card", status: "shipped" },
        { title: "Badge — Profile Account Menu", href: "/docs/blocks/badge-profile-account", status: "shipped" },
        { title: "Avatar — Recipient Selection", href: "/docs/blocks/avatar-recipient-selection", status: "shipped" },
        { title: "Button — Export Settings Modal", href: "/docs/blocks/button-export-settings", status: "shipped" },
        { title: "Button — Email Verification Modal", href: "/docs/blocks/button-email-verification", status: "shipped" },
      ],
    },
  ],
}

export const templateInventory: InventorySection = {
  title: "Templates",
  groups: [
    {
      title: "Generic",
      items: [
        { title: "Dashboard Shell", href: "/docs/templates/dashboard-shell", status: "shipped" },
        { title: "List-Detail Page", href: "/docs/templates/list-detail-page", status: "shipped" },
        { title: "Settings Tabs", href: "/docs/templates/settings-tabs-page", status: "shipped" },
        { title: "Form Stepper", href: "/docs/templates/form-stepper-page", status: "shipped" },
        { title: "Auth Shell", href: "/docs/templates/auth-shell", status: "shipped" },
      ],
    },
    {
      title: "Finance",
      items: [
        { title: "Finance Dashboard", href: "/docs/templates/finance-dashboard", status: "shipped" },
        { title: "Finance Cards", href: "/docs/templates/finance-cards", status: "shipped" },
        { title: "Finance My Card Detail", href: "/docs/templates/finance-my-card-detail", status: "shipped" },
        { title: "Finance Transactions", href: "/docs/templates/finance-transactions", status: "shipped" },
        { title: "Finance Send · Recipient", href: "/docs/templates/finance-send-recipient", status: "shipped" },
        { title: "Finance Send · Amount", href: "/docs/templates/finance-send-amount", status: "shipped" },
        { title: "Finance Send · Method", href: "/docs/templates/finance-send-method", status: "shipped" },
        { title: "Finance Login", href: "/docs/templates/finance-login", status: "shipped" },
        { title: "Finance Register", href: "/docs/templates/finance-register", status: "shipped" },
        { title: "Finance Reset Password", href: "/docs/templates/finance-reset-password", status: "shipped" },
        { title: "Finance Email Verification", href: "/docs/templates/finance-email-verification", status: "shipped" },
        { title: "Finance Profile Settings", href: "/docs/templates/finance-profile-settings", status: "shipped" },
        { title: "Finance Company Settings", href: "/docs/templates/finance-company-settings", status: "shipped" },
        { title: "Finance Notification Settings", href: "/docs/templates/finance-notification-settings", status: "shipped" },
        { title: "Finance Integration Settings", href: "/docs/templates/finance-integration-settings", status: "shipped" },
        { title: "Finance Localization Settings", href: "/docs/templates/finance-localization-settings", status: "shipped" },
        { title: "Finance Team Settings", href: "/docs/templates/finance-team-settings", status: "shipped" },
        { title: "Finance Privacy & Security", href: "/docs/templates/finance-privacy-security", status: "shipped" },
        { title: "Finance Auth · Login (deep)", href: "/docs/templates/finance-auth-login-deep", status: "shipped" },
        { title: "Finance Auth · Register (deep)", href: "/docs/templates/finance-auth-register-deep", status: "shipped" },
        { title: "Finance Auth · Reset Password (deep)", href: "/docs/templates/finance-auth-reset-password-deep", status: "shipped" },
        { title: "Finance Auth · Verification (deep)", href: "/docs/templates/finance-auth-verification-deep", status: "shipped" },
        { title: "Finance Send Money Wizard (deep, 4-step)", href: "/docs/templates/finance-send-money-wizard", status: "shipped" },
        { title: "Finance Dashboard (deep)", href: "/docs/templates/finance-dashboard-deep", status: "shipped" },
        { title: "Finance My Cards (deep)", href: "/docs/templates/finance-my-cards-deep", status: "shipped" },
        { title: "Finance Transactions (deep)", href: "/docs/templates/finance-transactions-deep", status: "shipped" },
        { title: "Finance Settings · Overview (deep)", href: "/docs/templates/finance-settings-deep", status: "shipped" },
        { title: "Finance Settings · Profile (deep)", href: "/docs/templates/finance-settings-deep/profile", status: "shipped" },
        { title: "Finance Settings · Company (deep)", href: "/docs/templates/finance-settings-deep/company", status: "shipped" },
        { title: "Finance Settings · Integrations (deep)", href: "/docs/templates/finance-settings-deep/integrations", status: "shipped" },
        { title: "Finance Settings · Localization (deep)", href: "/docs/templates/finance-settings-deep/localization", status: "shipped" },
        { title: "Finance Settings · Notifications (deep)", href: "/docs/templates/finance-settings-deep/notifications", status: "shipped" },
        { title: "Finance Settings · Privacy & Security (deep)", href: "/docs/templates/finance-settings-deep/privacy-security", status: "shipped" },
        { title: "Finance Settings · Team (deep)", href: "/docs/templates/finance-settings-deep/team", status: "shipped" },
      ],
    },
    {
      title: "HR",
      items: [
        { title: "HR Dashboard", href: "/docs/templates/hr-dashboard", status: "shipped" },
        { title: "HR Calendar", href: "/docs/templates/hr-calendar", status: "shipped" },
        { title: "HR Teams", href: "/docs/templates/hr-teams", status: "shipped" },
        { title: "HR Integrations", href: "/docs/templates/hr-integrations", status: "shipped" },
        { title: "HR Login", href: "/docs/templates/hr-login", status: "shipped" },
        { title: "HR Register", href: "/docs/templates/hr-register", status: "shipped" },
        { title: "HR Reset Password", href: "/docs/templates/hr-reset-password", status: "shipped" },
        { title: "HR Password Setup", href: "/docs/templates/hr-password-setup", status: "shipped" },
        { title: "HR Enter Verification", href: "/docs/templates/hr-enter-verification", status: "shipped" },
        { title: "HR Get Started", href: "/docs/templates/hr-get-started", status: "shipped" },
        { title: "HR Role Selection", href: "/docs/templates/hr-role-selection", status: "shipped" },
        { title: "HR Position Selection", href: "/docs/templates/hr-position-selection", status: "shipped" },
        { title: "HR Personal Information", href: "/docs/templates/hr-personal-information", status: "shipped" },
        { title: "HR Complete Onboarding", href: "/docs/templates/hr-complete-onboarding", status: "shipped" },
        { title: "HR Profile Settings", href: "/docs/templates/hr-profile-settings", status: "shipped" },
        { title: "HR Company Settings", href: "/docs/templates/hr-company-settings", status: "shipped" },
        { title: "HR General Settings", href: "/docs/templates/hr-general-settings", status: "shipped" },
        { title: "HR Notification Settings", href: "/docs/templates/hr-notification-settings", status: "shipped" },
        { title: "HR Integrations Settings", href: "/docs/templates/hr-integrations-settings", status: "shipped" },
        { title: "HR Privacy & Security", href: "/docs/templates/hr-privacy-security", status: "shipped" },
        { title: "HR Auth · Style 1 · Login (deep)", href: "/docs/templates/hr-auth-style-1-login", status: "shipped" },
        { title: "HR Auth · Style 1 · Register (deep)", href: "/docs/templates/hr-auth-style-1-register", status: "shipped" },
        { title: "HR Auth · Style 1 · Reset Password (deep)", href: "/docs/templates/hr-auth-style-1-reset-password", status: "shipped" },
        { title: "HR Auth · Style 1 · Verification (deep)", href: "/docs/templates/hr-auth-style-1-verification", status: "shipped" },
        { title: "HR Auth · Style 2 · Login (deep)", href: "/docs/templates/hr-auth-style-2-login", status: "shipped" },
        { title: "HR Auth · Style 2 · Register (deep)", href: "/docs/templates/hr-auth-style-2-register", status: "shipped" },
        { title: "HR Auth · Style 2 · Reset Password (deep)", href: "/docs/templates/hr-auth-style-2-reset-password", status: "shipped" },
        { title: "HR Auth · Style 2 · Verification (deep)", href: "/docs/templates/hr-auth-style-2-verification", status: "shipped" },
        { title: "HR Auth · Style 3 · Login (deep)", href: "/docs/templates/hr-auth-style-3-login", status: "shipped" },
        { title: "HR Auth · Style 3 · Register (deep)", href: "/docs/templates/hr-auth-style-3-register", status: "shipped" },
        { title: "HR Auth · Style 3 · Reset Password (deep)", href: "/docs/templates/hr-auth-style-3-reset-password", status: "shipped" },
        { title: "HR Auth · Style 3 · Verification (deep)", href: "/docs/templates/hr-auth-style-3-verification", status: "shipped" },
        { title: "HR Onboarding Wizard (deep, 5-step)", href: "/docs/templates/hr-onboarding-wizard", status: "shipped" },
        { title: "HR Dashboard (deep)", href: "/docs/templates/hr-dashboard-deep", status: "shipped" },
        { title: "HR Dashboard · Empty (deep)", href: "/docs/templates/hr-dashboard-empty", status: "shipped" },
        { title: "HR Calendar (deep)", href: "/docs/templates/hr-calendar-deep", status: "shipped" },
        { title: "HR Teams (deep)", href: "/docs/templates/hr-teams-deep", status: "shipped" },
        { title: "HR Integrations (deep)", href: "/docs/templates/hr-integrations-deep", status: "shipped" },
        { title: "HR Settings · Overview (deep)", href: "/docs/templates/hr-settings-deep", status: "shipped" },
        { title: "HR Settings · Profile (deep)", href: "/docs/templates/hr-settings-deep/profile", status: "shipped" },
        { title: "HR Settings · Company (deep)", href: "/docs/templates/hr-settings-deep/company", status: "shipped" },
        { title: "HR Settings · General (deep)", href: "/docs/templates/hr-settings-deep/general", status: "shipped" },
        { title: "HR Settings · Integrations (deep)", href: "/docs/templates/hr-settings-deep/integrations", status: "shipped" },
        { title: "HR Settings · Notifications (deep)", href: "/docs/templates/hr-settings-deep/notifications", status: "shipped" },
        { title: "HR Settings · Privacy & Security (deep)", href: "/docs/templates/hr-settings-deep/privacy-security", status: "shipped" },
      ],
    },
    {
      title: "Marketing",
      items: [
        { title: "Marketing Dashboard", href: "/docs/templates/marketing-dashboard", status: "shipped" },
        { title: "Marketing Analytics", href: "/docs/templates/marketing-analytics", status: "shipped" },
        { title: "Marketing Products", href: "/docs/templates/marketing-products", status: "shipped" },
        { title: "Marketing Orders", href: "/docs/templates/marketing-orders", status: "shipped" },
        { title: "Marketing Account Settings", href: "/docs/templates/marketing-account-settings", status: "shipped" },
        { title: "Marketing Login", href: "/docs/templates/marketing-login", status: "shipped" },
        { title: "Marketing Add Product", href: "/docs/templates/marketing-add-product", status: "shipped" },
        { title: "Marketing Account Settings v2", href: "/docs/templates/marketing-account-settings-v2", status: "shipped" },
        { title: "Marketing Products Settings", href: "/docs/templates/marketing-products-settings", status: "shipped" },
        { title: "Marketing Payment & Billing", href: "/docs/templates/marketing-payment-billing", status: "shipped" },
        { title: "Marketing Shipping & Delivery", href: "/docs/templates/marketing-shipping-delivery", status: "shipped" },
        { title: "Marketing Privacy & Security", href: "/docs/templates/marketing-privacy-security", status: "shipped" },
        { title: "Marketing Integrations", href: "/docs/templates/marketing-integrations", status: "shipped" },
        { title: "Marketing Appearance", href: "/docs/templates/marketing-appearance", status: "shipped" },
        { title: "Marketing Products (Card Opened)", href: "/docs/templates/marketing-products-card-opened", status: "shipped" },
        { title: "Marketing Add Product · General (Filled)", href: "/docs/templates/marketing-general-information-filled", status: "shipped" },
        { title: "Marketing Add Product · Pricing (Empty)", href: "/docs/templates/marketing-pricing-detail-empty", status: "shipped" },
        { title: "Marketing Add Product · Pricing (Filled)", href: "/docs/templates/marketing-pricing-detail-filled", status: "shipped" },
        { title: "Marketing Add Product · Image & Stock", href: "/docs/templates/marketing-add-product-image-stock", status: "shipped" },
        { title: "Marketing Add Product · Summary", href: "/docs/templates/marketing-summary", status: "shipped" },
        { title: "Marketing Reset Password", href: "/docs/templates/marketing-reset-password", status: "shipped" },
        { title: "Marketing Register", href: "/docs/templates/marketing-register", status: "shipped" },
        { title: "Marketing Email Verification", href: "/docs/templates/marketing-email-verification", status: "shipped" },
        { title: "Marketing Auth · Login (deep)", href: "/docs/templates/marketing-auth-login", status: "shipped" },
        { title: "Marketing Auth · Register (deep)", href: "/docs/templates/marketing-auth-register", status: "shipped" },
        { title: "Marketing Auth · Reset Password (deep)", href: "/docs/templates/marketing-auth-reset-password", status: "shipped" },
        { title: "Marketing Auth · Verification (deep)", href: "/docs/templates/marketing-auth-verification", status: "shipped" },
        { title: "Marketing Settings · Overview", href: "/docs/templates/marketing-settings", status: "shipped" },
        { title: "Marketing Settings · Account", href: "/docs/templates/marketing-settings/account", status: "shipped" },
        { title: "Marketing Settings · Appearance", href: "/docs/templates/marketing-settings/appearance", status: "shipped" },
        { title: "Marketing Settings · Integrations", href: "/docs/templates/marketing-settings/integrations", status: "shipped" },
        { title: "Marketing Settings · Payment & Billing", href: "/docs/templates/marketing-settings/payment-billing", status: "shipped" },
        { title: "Marketing Settings · Privacy & Security", href: "/docs/templates/marketing-settings/privacy-security", status: "shipped" },
        { title: "Marketing Settings · Product", href: "/docs/templates/marketing-settings/product", status: "shipped" },
        { title: "Marketing Settings · Shipping & Delivery", href: "/docs/templates/marketing-settings/shipping-delivery", status: "shipped" },
        { title: "Marketing Settings · Store", href: "/docs/templates/marketing-settings/store", status: "shipped" },
        { title: "Marketing Add Product Wizard (deep, 5-step)", href: "/docs/templates/marketing-add-product-wizard", status: "shipped" },
      ],
    },
    {
      title: "Dash Next Portal v2",
      items: [
        { title: "Portal · Home (redirect)", href: "/docs/templates/portal-home", status: "shipped" },
        { title: "Portal · Sign In", href: "/docs/templates/portal-signin", status: "shipped" },
        { title: "Portal · Sign Up (3-step)", href: "/docs/templates/portal-signup", status: "shipped" },
        { title: "Portal · Verification", href: "/docs/templates/portal-verification", status: "shipped" },
        { title: "Portal · Reset Password", href: "/docs/templates/portal-reset-password", status: "shipped" },
        { title: "Portal · Accept Invitation", href: "/docs/templates/portal-accept-invitation", status: "shipped" },
        { title: "Portal · Dashboard Shell", href: "/docs/templates/portal-dashboard-shell", status: "shipped" },
        { title: "Portal · Addresses", href: "/docs/templates/portal-addresses", status: "shipped" },
        { title: "Portal · Billing", href: "/docs/templates/portal-billing", status: "shipped" },
        { title: "Portal · Deliveries (List)", href: "/docs/templates/portal-deliveries-list", status: "shipped" },
        { title: "Portal · Delivery Detail", href: "/docs/templates/portal-delivery-detail", status: "shipped" },
        { title: "Portal · Outlets", href: "/docs/templates/portal-outlets", status: "shipped" },
        { title: "Portal · Policies", href: "/docs/templates/portal-policies", status: "shipped" },
        { title: "Portal · Simulation (List)", href: "/docs/templates/portal-simulation", status: "shipped" },
        { title: "Portal · Simulation Detail", href: "/docs/templates/portal-simulation-detail", status: "shipped" },
        { title: "Portal · Users", href: "/docs/templates/portal-users", status: "shipped" },
        { title: "Portal · Developer", href: "/docs/templates/portal-developer", status: "shipped" },
        { title: "Portal · Setting", href: "/docs/templates/portal-setting", status: "shipped" },
      ],
    },
    {
      title: "Dash Custom",
      items: [
        { title: "Mitra Suspend Page", href: "/docs/templates/mitra-suspend-page", status: "shipped" },
        { title: "Halo-Dash 3-Pane Shell", href: "/docs/templates/halo-dash-3pane", status: "shipped" },
        { title: "Phase7 Results Dashboard", href: "/docs/templates/phase7-results", status: "shipped" },
      ],
    },
  ],
}

export const foundationInventory: InventorySection = {
  title: "Foundations",
  groups: [
    {
      title: "",
      items: [
        { title: "Color", href: "/docs/foundations/color", status: "shipped" },
        { title: "Typography", href: "/docs/foundations/typography", status: "shipped" },
        { title: "Icons", href: "/docs/foundations/icons", status: "shipped" },
        { title: "Grid System", href: "/docs/foundations/grid", status: "shipped" },
        { title: "Shadows", href: "/docs/foundations/shadows", status: "shipped" },
        { title: "Corner Radius", href: "/docs/foundations/corner-radius", status: "shipped" },
        { title: "Motion", href: "/docs/foundations/motion", status: "shipped" },
        { title: "Dark Mode", href: "/docs/foundations/dark-mode", status: "shipped" },
      ],
    },
  ],
}

/** Every detail page in flat order — used by DocsPageNav for prev/next. */
export const fullInventoryFlat: NavItem[] = [
  ...foundationInventory.groups.flatMap((g) => g.items),
  ...componentInventory.groups.flatMap((g) => g.items),
  ...blockInventory.groups.flatMap((g) => g.items),
  ...templateInventory.groups.flatMap((g) => g.items),
]
