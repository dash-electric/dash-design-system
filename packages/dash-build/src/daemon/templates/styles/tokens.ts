/**
 * Dash registry tokens — INLINED into the daemon CSS bundle so the daemon
 * stays dependency-free while still sharing the same source-of-truth
 * surface as the docs app.
 *
 * Source: /apps/docs/app/globals.css (regenerated from Figma via
 *         `pnpm tsx scripts/figma-tokens-sync.ts`).
 *
 * Inlined blocks (CSS variable definitions only):
 *   - `:root { ... }`   Foundations + radius + spacing + primary theme +
 *                       state semantic + LIGHT semantic surface tokens.
 *   - `.dark { ... }`   Dark-mode semantic + state overrides.
 *   - `:root { ... }`   Shadow tokens.
 *   - `:root { ... }`   Motion tokens (Dash extension).
 *
 * Stripped:
 *   - `@import "tailwindcss"`   (Tailwind v4 runtime, irrelevant outside docs).
 *   - `@theme inline { ... }`   (Tailwind v4 utility wiring).
 *   - Typography utility classes (`.text-title-h1`, ...; the daemon ships
 *     its own typography ramp in dashboard.ts and Agent A2 will reconcile).
 *
 * Refresh procedure:
 *   When globals.css regenerates, re-run the inline-tokens script (Phase A4)
 *   or manually copy the four blocks above verbatim.
 */

/* INLINED from globals.css registry @ 2026-05-25 */
export const REGISTRY_TOKENS_CSS = `
/* ============================================================ *
 * Dash registry tokens — inlined from apps/docs/app/globals.css *
 * Source of truth: Figma (AlignUI Pro) via figma-tokens-sync.ts *
 * Do NOT hand-edit; regen via tokens-inline script (Phase A4).  *
 * ============================================================ */

:root {
  /* ------ Foundations (06-foundations.*) — raw hex ------ */
  --dash-slate-0: #ffffff;
  --dash-slate-50: #f5f7fa;
  --dash-slate-100: #f2f5f8;
  --dash-slate-200: #e1e4ea;
  --dash-slate-300: #cacfd8;
  --dash-slate-400: #99a0ae;
  --dash-slate-500: #717784;
  --dash-slate-600: #525866;
  --dash-slate-700: #2b303b;
  --dash-slate-800: #222530;
  --dash-slate-900: #181b25;
  --dash-slate-950: #0e121b;
  --dash-slate-alpha-10: #99a0ae1a;
  --dash-slate-alpha-16: #99a0ae29;
  --dash-slate-alpha-24: #99a0ae3d;

  --dash-gray-0: #ffffff;
  --dash-gray-50: #f7f7f7;
  --dash-gray-100: #f5f5f5;
  --dash-gray-200: #ebebeb;
  --dash-gray-300: #d1d1d1;
  --dash-gray-400: #a3a3a3;
  --dash-gray-500: #7b7b7b;
  --dash-gray-600: #5c5c5c;
  --dash-gray-700: #333333;
  --dash-gray-800: #262626;
  --dash-gray-900: #1c1c1c;
  --dash-gray-950: #171717;
  --dash-gray-alpha-10: #a3a3a31a;
  --dash-gray-alpha-16: #a3a3a329;
  --dash-gray-alpha-24: #a3a3a33d;

  --dash-red-50: #ffebec;
  --dash-red-100: #ffd5d8;
  --dash-red-200: #ffc0c5;
  --dash-red-300: #ff97a0;
  --dash-red-400: #ff6875;
  --dash-red-500: #fb3748;
  --dash-red-600: #e93544;
  --dash-red-700: #d02533;
  --dash-red-800: #ad1f2b;
  --dash-red-900: #8b1822;
  --dash-red-950: #681219;
  --dash-red-alpha-10: #fb37481a;
  --dash-red-alpha-16: #fb374829;
  --dash-red-alpha-24: #fb37483d;

  --dash-orange-50: #fff3eb;
  --dash-orange-100: #ffe6d5;
  --dash-orange-200: #ffd9c0;
  --dash-orange-300: #ffc197;
  --dash-orange-400: #ffa468;
  --dash-orange-500: #fa7319;
  --dash-orange-600: #e16614;
  --dash-orange-700: #ce5e12;
  --dash-orange-800: #b75310;
  --dash-orange-900: #96440d;
  --dash-orange-950: #71330a;
  --dash-orange-alpha-10: #fa73191a;
  --dash-orange-alpha-16: #fa731929;
  --dash-orange-alpha-24: #fa73193d;

  --dash-yellow-50: #fffaeb;
  --dash-yellow-100: #ffefcc;
  --dash-yellow-200: #ffecc0;
  --dash-yellow-300: #ffe097;
  --dash-yellow-400: #ffd268;
  --dash-yellow-500: #f6b51e;
  --dash-yellow-600: #e6a819;
  --dash-yellow-700: #c99a2c;
  --dash-yellow-800: #a78025;
  --dash-yellow-900: #86661d;
  --dash-yellow-950: #624c18;
  --dash-yellow-alpha-10: #fbc64b1a;
  --dash-yellow-alpha-16: #fbc64b29;
  --dash-yellow-alpha-24: #fbc64b3d;

  --dash-green-50: #e0faec;
  --dash-green-100: #d0fbe9;
  --dash-green-200: #c2f5da;
  --dash-green-300: #84ebb4;
  --dash-green-400: #3ee089;
  --dash-green-500: #1fc16b;
  --dash-green-600: #1daf61;
  --dash-green-700: #178c4e;
  --dash-green-800: #1a7544;
  --dash-green-900: #16643b;
  --dash-green-950: #0b4627;
  --dash-green-alpha-10: #1fc16b1a;
  --dash-green-alpha-16: #1fc16b29;
  --dash-green-alpha-24: #1fc16b3d;

  --dash-teal-50: #e4fbf8;
  --dash-teal-100: #d0fbf5;
  --dash-teal-200: #c2f5ee;
  --dash-teal-300: #84ebdd;
  --dash-teal-400: #3fdec9;
  --dash-teal-500: #22d3bb;
  --dash-teal-600: #1daf9c;
  --dash-teal-700: #178c7d;
  --dash-teal-800: #1a7569;
  --dash-teal-900: #16645a;
  --dash-teal-950: #0b463e;
  --dash-teal-alpha-10: #22d3bb1a;
  --dash-teal-alpha-16: #22d3bb29;
  --dash-teal-alpha-24: #22d3bb3d;

  --dash-sky-50: #ebf8ff;
  --dash-sky-100: #d5f1ff;
  --dash-sky-200: #c0eaff;
  --dash-sky-300: #97dcff;
  --dash-sky-400: #68cdff;
  --dash-sky-500: #47c2ff;
  --dash-sky-600: #35ade9;
  --dash-sky-700: #2597d0;
  --dash-sky-800: #1f7ead;
  --dash-sky-900: #18658b;
  --dash-sky-950: #124b68;
  --dash-sky-alpha-10: #47c2ff1a;
  --dash-sky-alpha-16: #47c2ff29;
  --dash-sky-alpha-24: #47c2ff3d;

  --dash-blue-50: #ebf1ff;
  --dash-blue-100: #d5e2ff;
  --dash-blue-200: #c0d5ff;
  --dash-blue-300: #97baff;
  --dash-blue-400: #6895ff;
  --dash-blue-500: #335cff;
  --dash-blue-600: #3559e9;
  --dash-blue-700: #2547d0;
  --dash-blue-800: #1f3bad;
  --dash-blue-900: #182f8b;
  --dash-blue-950: #122368;
  --dash-blue-alpha-10: #476cff1a;
  --dash-blue-alpha-16: #476cff29;
  --dash-blue-alpha-24: #476cff3d;

  --dash-purple-50: #efeaf7;
  --dash-purple-100: #cdbde5;
  --dash-purple-200: #b59dd9;
  --dash-purple-300: #9370c7;
  --dash-purple-400: #7e55bd;
  --dash-purple-500: #5e2aac;
  --dash-purple-600: #56269d;
  --dash-purple-700: #431e7a;
  --dash-purple-800: #34175f;
  --dash-purple-900: #271248;
  --dash-purple-950: #1b0c32;
  --dash-purple-alpha-10: #784def1a;
  --dash-purple-alpha-16: #784def29;
  --dash-purple-alpha-24: #784def3d;

  --dash-pink-50: #ffebf4;
  --dash-pink-100: #ffd5ea;
  --dash-pink-200: #ffc0df;
  --dash-pink-300: #ff97cb;
  --dash-pink-400: #ff68b3;
  --dash-pink-500: #fb4ba3;
  --dash-pink-600: #e9358f;
  --dash-pink-700: #d0257a;
  --dash-pink-800: #ad1f66;
  --dash-pink-900: #8b1852;
  --dash-pink-950: #68123d;
  --dash-pink-alpha-10: #fb4ba31a;
  --dash-pink-alpha-16: #fb4ba329;
  --dash-pink-alpha-24: #fb4ba33d;

  --dash-black-alpha-10: #1717171a;
  --dash-black-alpha-16: #17171729;
  --dash-black-alpha-24: #1717173d;
  --dash-white-alpha-10: #ffffff1a;
  --dash-white-alpha-16: #ffffff29;
  --dash-white-alpha-24: #ffffff3d;


  /* ------ Radius (04-radius.*) ------ */
  --radius-full: 9999px;
  --radius-10: 10px;
  --radius-8: 8px;
  --radius-6: 6px;
  --radius-12: 12px;
  --radius-4: 4px;
  --radius-16: 16px;
  --radius-20: 20px;
  --radius-24: 24px;
  --radius-2: 2px;
  --radius-0: 0px;
  --radius-28: 28px;

  /* ------ Spacing (05-spacing.*) ------ */
  --spacing-0: 0px;
  --spacing-2: 2px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-10: 10px;
  --spacing-6: 6px;
  --spacing-12: 12px;
  --spacing-14: 14px;
  --spacing-16: 16px;
  --spacing-48: 48px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;

  /* ------ Text-size ramp (Dash extension; matches dashboard.ts utility classes) ------ */
  --text-xs:         11px;
  --text-sm:         12px;
  --text-body-sm:    13px;
  --text-md:         14px;
  --text-body:       15px;
  --text-lg:         16px;
  --text-title-sm:   18px;
  --text-subtitle:   20px;
  --text-title-md:   22px;
  --text-display-sm: 24px;
  --text-display-md: 28px;
  --text-display-lg: 32px;

  /* ------ Primary theme (Dash extension: purple) ------ */
  --primary-base:     var(--dash-purple-500);
  --primary-dark:     var(--dash-purple-700);
  --primary-darker:   var(--dash-purple-800);
  --primary-alpha-10: var(--dash-purple-alpha-10);
  --primary-alpha-16: var(--dash-purple-alpha-16);
  --primary-alpha-24: var(--dash-purple-alpha-24);

  /* ------ State semantic (LIGHT) — Figma 1:1 ------ */
  --state-error-dark:        var(--dash-red-950);
  --state-error-base:        var(--dash-red-500);
  --state-error-light:       var(--dash-red-200);
  --state-error-lighter:     var(--dash-red-50);
  --state-warning-dark:      var(--dash-orange-950);
  --state-warning-base:      var(--dash-orange-500);
  --state-warning-light:     var(--dash-orange-200);
  --state-warning-lighter:   var(--dash-orange-50);
  --state-success-dark:      var(--dash-green-950);
  --state-success-base:      var(--dash-green-500);
  --state-success-light:     var(--dash-green-200);
  --state-success-lighter:   var(--dash-green-50);
  --state-information-dark:  var(--dash-blue-950);
  --state-information-base:  var(--dash-blue-500);
  --state-information-light: var(--dash-blue-200);
  --state-information-lighter: var(--dash-blue-50);
  --state-feature-dark:      var(--dash-purple-950);
  --state-feature-base:      var(--dash-purple-500);
  --state-feature-light:     var(--dash-purple-200);
  --state-feature-lighter:   var(--dash-purple-50);
  --state-highlighted-dark:  var(--dash-pink-950);
  --state-highlighted-base:  var(--dash-pink-500);
  --state-highlighted-light: var(--dash-pink-200);
  --state-highlighted-lighter: var(--dash-pink-50);
  --state-stable-dark:       var(--dash-teal-950);
  --state-stable-base:       var(--dash-teal-500);
  --state-stable-light:      var(--dash-teal-200);
  --state-stable-lighter:    var(--dash-teal-50);
  --state-verified-dark:     var(--dash-sky-950);
  --state-verified-base:     var(--dash-sky-500);
  --state-verified-light:    var(--dash-sky-200);
  --state-verified-lighter:  var(--dash-sky-50);
  --state-away-dark:         var(--dash-yellow-950);
  --state-away-base:         var(--dash-yellow-500);
  --state-away-light:        var(--dash-yellow-200);
  --state-away-lighter:      var(--dash-yellow-50);
  --state-faded-dark:        var(--dash-slate-800);
  --state-faded-base:        var(--dash-slate-500);
  --state-faded-light:       var(--dash-slate-200);
  --state-faded-lighter:     var(--dash-slate-100);

  /* ------ Semantic (LIGHT mode default) ------ */
  /* -- bg -- */
  --bg-white-0: var(--dash-slate-0);
  --bg-weak-50: var(--dash-slate-100);
  --bg-strong-950: var(--dash-slate-950);
  --bg-surface-800: var(--dash-slate-700);
  --bg-soft-200: var(--dash-slate-200);
  --bg-sub-300: var(--dash-slate-300);
  /* -- text -- */
  --text-strong-950: var(--dash-slate-950);
  --text-sub-600: var(--dash-slate-500);
  --text-disabled-300: var(--dash-slate-300);
  --text-white-0: var(--dash-slate-0);
  --text-soft-400: var(--dash-slate-400);
  /* -- icon -- */
  --icon-sub-600: var(--dash-slate-500);
  --icon-strong-950: var(--dash-slate-950);
  --icon-soft-400: var(--dash-slate-400);
  --icon-disabled-300: var(--dash-slate-300);
  --icon-white-0: var(--dash-slate-0);
  /* -- stroke -- */
  --stroke-soft-200: var(--dash-slate-100);
  --stroke-strong-950: var(--dash-slate-950);
  --stroke-white-0: var(--dash-slate-0);
  --stroke-sub-300: var(--dash-slate-300);
  /* -- illustration -- */
  --illustration-strong-400: #5c5c5c;
  --illustration-sub-300: #333333;
  --illustration-soft-200: #262626;
  --illustration-weak-100: #1c1c1c;
  --illustration-white-0: #171717;
  --static-white: var(--dash-slate-0);
  --static-black: var(--dash-slate-950);
  --overlay-overlay-gray: #3333338f;
  --overlay-overlay-slate: #2b303b8f;
  --social-apple: #ffffff;
  --social-twitter: #ffffff;
  --social-github: #ffffff;
  --social-notion: #ffffff;
  --social-tidal: #ffffff;
  --social-amazon: #ffffff;
  --social-zendesk: #ffffff;
}

.dark {
  /* ------ Semantic (DARK mode override) ------ */
  /* -- bg -- */
  --bg-white-0: var(--dash-slate-950);
  --bg-weak-50: var(--dash-slate-800);
  --bg-strong-950: var(--dash-slate-0);
  --bg-surface-800: var(--dash-slate-200);
  --bg-soft-200: var(--dash-slate-700);
  --bg-sub-300: var(--dash-slate-600);
  /* -- text -- */
  --text-strong-950: var(--dash-slate-0);
  --text-sub-600: var(--dash-slate-400);
  --text-disabled-300: var(--dash-slate-600);
  --text-white-0: var(--dash-slate-950);
  --text-soft-400: var(--dash-slate-500);
  /* -- icon -- */
  --icon-sub-600: var(--dash-slate-400);
  --icon-strong-950: var(--dash-slate-0);
  --icon-soft-400: var(--dash-slate-500);
  --icon-disabled-300: var(--dash-slate-600);
  --icon-white-0: var(--dash-slate-950);
  /* -- stroke -- */
  --stroke-soft-200: var(--dash-slate-800);
  --stroke-strong-950: var(--dash-slate-0);
  --stroke-white-0: var(--dash-slate-950);
  --stroke-sub-300: var(--dash-slate-600);
  /* -- illustration -- */
  --illustration-strong-400: #5c5c5c;
  --illustration-sub-300: #333333;
  --illustration-soft-200: #262626;
  --illustration-weak-100: #1c1c1c;
  --illustration-white-0: #171717;
  --static-white: var(--dash-slate-0);
  --static-black: var(--dash-slate-950);
  --overlay-overlay-gray: #3333338f;
  --overlay-overlay-slate: #2b303b8f;
  --social-apple: #ffffff;
  --social-twitter: #ffffff;
  --social-github: #ffffff;
  --social-notion: #ffffff;
  --social-tidal: #ffffff;
  --social-amazon: #ffffff;
  --social-zendesk: #ffffff;

  /* ------ State semantic — Dark mode override ------ */
  --state-error-dark:        var(--dash-red-400);
  --state-error-base:        var(--dash-red-600);
  --state-error-light:       var(--dash-red-alpha-24);
  --state-error-lighter:     var(--dash-red-alpha-16);
  --state-warning-dark:      var(--dash-orange-400);
  --state-warning-base:      var(--dash-orange-600);
  --state-warning-light:     var(--dash-orange-alpha-24);
  --state-warning-lighter:   var(--dash-orange-alpha-16);
  --state-success-dark:      var(--dash-green-400);
  --state-success-base:      var(--dash-green-600);
  --state-success-light:     var(--dash-green-alpha-24);
  --state-success-lighter:   var(--dash-green-alpha-16);
  --state-information-dark:  var(--dash-blue-400);
  --state-information-base:  var(--dash-blue-600);
  --state-information-light: var(--dash-blue-alpha-24);
  --state-information-lighter: var(--dash-blue-alpha-16);
  --state-feature-dark:      var(--dash-purple-400);
  --state-feature-base:      var(--dash-purple-600);
  --state-feature-light:     var(--dash-purple-alpha-24);
  --state-feature-lighter:   var(--dash-purple-alpha-16);
  --state-highlighted-dark:  var(--dash-pink-400);
  --state-highlighted-base:  var(--dash-pink-600);
  --state-highlighted-light: var(--dash-pink-alpha-24);
  --state-highlighted-lighter: var(--dash-pink-alpha-16);
  --state-stable-dark:       var(--dash-teal-400);
  --state-stable-base:       var(--dash-teal-600);
  --state-stable-light:      var(--dash-teal-alpha-24);
  --state-stable-lighter:    var(--dash-teal-alpha-16);
  --state-verified-dark:     var(--dash-sky-400);
  --state-verified-base:     var(--dash-sky-600);
  --state-verified-light:    var(--dash-sky-alpha-24);
  --state-verified-lighter:  var(--dash-sky-alpha-16);
  --state-away-dark:         var(--dash-yellow-400);
  --state-away-base:         var(--dash-yellow-600);
  --state-away-light:        var(--dash-yellow-alpha-24);
  --state-away-lighter:      var(--dash-yellow-alpha-16);
  --state-faded-dark:        var(--dash-slate-300);
  --state-faded-base:        var(--dash-slate-500);
  --state-faded-light:       var(--dash-slate-alpha-24);
  --state-faded-lighter:     var(--dash-slate-alpha-16);
}

/* ------ Shadows (effect.*) ------ */
:root {
  --shadow-custom-shadows-large: 0px 96px 96px -32px #3333330f, 0px 48px 48px -24px #3333330a, 0px 24px 24px -12px #3333330a, 0px 12px 12px -6px #3333330a, 0px 6px 6px -3px #3333330a, 0px 3px 3px -1.5px #33333305, 0px 1px 1px 0.5px #3333330a, 0px 0px 0px 1px #3333330a, inset 0px -1px 1px -0.5px #3333330f;
  --shadow-custom-shadows-medium: 0px 48px 48px -24px #3333330a, 0px 24px 24px -12px #3333330a, 0px 12px 12px -6px #3333330a, 0px 6px 6px -3px #3333330a, 0px 3px 3px -1.5px #33333305, 0px 1px 1px 0.5px #3333330a, 0px 0px 0px 1px #3333330a, inset 0px -1px 1px -0.5px #3333330f;
  --shadow-custom-shadows-small: 0px 1px 3px -1.5px #33333329, 0px 5px 5px -2.5px #33333314, 0px 12px 6px -6px #33333305, 0px 16px 8px -8px #33333303, 0px 0px 0px 1px #3333330a, inset 0px -0.5px 0.5px 0px #33333314;
  --shadow-custom-shadows-x-small: 0px 1px 2px 0px #3333330a, 0px 2px 4px 0px #3333330a, 0px 4px 8px -2px #3333330f, 0px 0px 0px 1px #3333330a, inset 0px -1px 1px -0.5px #3333330f;
  --shadow-tooltip: inset 0px -1px 1px -0.5px #1717170f, 0px 0px 0px 1px #ebebebff, 0px 48px 48px -24px #1717170a, 0px 24px 24px -12px #1717170a, 0px 12px 12px -6px #1717170a, 0px 6px 6px -3px #1717170a, 0px 3px 3px -1.5px #17171705, 0px 1px 1px 0.5px #1717170a;
  /* Semantic aliases for daemon UI consumption */
  --shadow-xs: var(--shadow-custom-shadows-x-small);
  --shadow-sm: var(--shadow-custom-shadows-small);
  --shadow-md: var(--shadow-custom-shadows-medium);
  --shadow-lg: var(--shadow-custom-shadows-large);
  /* Inset glass highlight (90% white) — used on glass / floating chrome */
  --shadow-inset-hi: inset 0 1px 0 #ffffffe6;
  --shadow-focus: 0 0 0 3px var(--primary-alpha-24);
  /* Composer dock — upward soft drop for elements pinned to bottom */
  --shadow-dock-up: 0 -8px 24px rgba(20, 14, 36, 0.06);
  /* Purple-tinted card lift — clarify / primary-themed surfaces */
  --shadow-primary-lift: 0 6px 18px rgba(94, 42, 172, 0.10);
  /* Light hairline lift used on chat scenes */
  --shadow-scene-lift: 0 10px 28px rgba(26, 26, 26, 0.06);
  /* Soft floating overlay for modal popups */
  --shadow-overlay-soft: 0 16px 36px rgba(26, 26, 26, 0.05);
  /* Primary-tinted micro-shadow used on chip ribbons */
  --shadow-chip-tint: 0 1px 3px rgba(94, 42, 172, 0.08);
}

/* ------ Motion (Dash extension, NOT in Figma export) ------ */
:root {
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

/* ------ Theme toggle (Phase A1 — daemon-only chrome) ------
 * Uses semantic registry vars so the button auto-themes with .dark.
 */
.db-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--stroke-soft-200);
  border-radius: var(--radius-8);
  background: var(--bg-white-0);
  color: var(--icon-sub-600);
  font-size: var(--text-lg);
  line-height: 1;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out),
              color var(--duration-fast) var(--ease-out);
}
.db-theme-toggle:hover {
  background: var(--bg-weak-50);
  color: var(--icon-strong-950);
}
.db-theme-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-alpha-24);
  border-color: var(--primary-base);
}
.db-theme-toggle[aria-pressed="true"] {
  background: var(--bg-weak-50);
  color: var(--icon-strong-950);
  border-color: var(--stroke-sub-300);
}
.db-theme-toggle-icon {
  display: inline-block;
  transform: rotate(0deg);
  transition: transform var(--duration-base) var(--ease-out);
}
.db-theme-toggle[aria-pressed="true"] .db-theme-toggle-icon {
  transform: rotate(180deg);
}
`
