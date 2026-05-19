# Component → Figma Node ID Map

Source: `.figma-cache/pages.json` (page-level node IDs). To pull each component's full spec: `pnpm figma:nodes <id>` → emits to `.figma-cache/node-<id>.json`.

## Atoms / Foundations

| Component | Node ID | Dash file |
|---|---|---|
| Color Palette | `553:14956` | `app/(docs)/docs/foundations/colors/page.tsx` |
| Typography | `553:14957` | `app/(docs)/docs/foundations/typography/page.tsx` |
| Icons | `41:136` | HOLD (3061 icons, awaiting signal) |
| Grid System | `553:14958` | TBD |
| Shadows | `553:14959` | `app/(docs)/docs/foundations/shadows/page.tsx` |
| Motions | `553:14960` | TBD |
| Corner Radius | `553:14961` | TBD |

## Assets

| Component | Node ID | Dash file |
|---|---|---|
| Brand | `2771:1469` | `registry/dash/ui/brand-mark.tsx` |
| Placeholder | `172:5573` | TBD |
| Country Flags | `2771:1471` | HOLD (assets) |
| Emojies | `2771:1472` | HOLD (assets) |
| Appstore Badges | `2771:1470` | HOLD (assets) |
| Others | `2771:1473` | HOLD (assets) |

## Base Components (45)

| Component | Node ID | Dash file |
|---|---|---|
| Accordion | `210:4006` | `registry/dash/ui/accordion.tsx` |
| Activity Feed | `164611:26451` | `registry/dash/ui/activity-feed.tsx` |
| Alert, Notification & Toast | `169:2358` | `alert.tsx`, `toaster.tsx`, `notification-feed.tsx` |
| Avatar | `210:4129` | `registry/dash/ui/avatar.tsx` |
| Badge | `119:2863` | `registry/dash/ui/badge.tsx` (audited ✓) |
| Banner | `224:2224` | `registry/dash/ui/banner.tsx` (audited ✓) |
| Breadcrumbs | `447:8760` | `registry/dash/ui/breadcrumb.tsx` |
| Button | `129:605` | `registry/dash/ui/button.tsx` + `icon-button.tsx` + `link-button.tsx` + `fancy-button.tsx` + `social-button.tsx` |
| Button Group | `225:2363` | `registry/dash/ui/button-group.tsx` |
| Checkbox | `227:1986` | `registry/dash/ui/checkbox.tsx` |
| Color Picker | `553:22078` | `registry/dash/ui/color-picker.tsx` |
| Content Divider | `414:4397` | `registry/dash/ui/divider.tsx` |
| Command Menu | `4152:24764` | `registry/dash/ui/command.tsx` |
| Date Picker | `435:8548` | `registry/dash/ui/date-picker.tsx` + `calendar.tsx` |
| Drawer | `486:7366` | `registry/dash/ui/drawer.tsx` |
| Dropdown | `166999:140904` | `registry/dash/ui/dropdown-menu.tsx` |
| File Upload | `450:9364` | `registry/dash/ui/file-upload.tsx` |
| Filter | `3880:66172` | `registry/dash/ui/filter.tsx` |
| Key Components | `263:1844` | `registry/dash/ui/kbd.tsx` |
| Modal | `466:4630` | `registry/dash/ui/modal.tsx` |
| Notification Feed | `4096:21398` | `registry/dash/ui/notification-feed.tsx` |
| Pagination | `486:8465` | `registry/dash/ui/pagination.tsx` |
| Progress Bar | `450:17758` | `registry/dash/ui/progress-bar.tsx` + `progress-circle.tsx` |
| Popover | `553:22099` | `registry/dash/ui/popover.tsx` |
| Radio | `515:3884` | `registry/dash/ui/radio.tsx` |
| Rating | `532:4130` | `registry/dash/ui/rating.tsx` |
| Rich Editor | `164611:20259` | `registry/dash/ui/rich-editor.tsx` |
| Scroll | `165475:768` | `registry/dash/ui/scroll-area.tsx` |
| Select | `270:1084` | `registry/dash/ui/select.tsx` |
| Slider | `2604:3416` | `registry/dash/ui/slider.tsx` |
| Step Indicator | `479:14388` | `registry/dash/ui/step-indicator.tsx` + `dot-stepper.tsx` |
| Tab Menu | `553:734` | `registry/dash/ui/tabs.tsx` |
| Table | `553:14955` | `registry/dash/ui/table.tsx` + `data-table.tsx` |
| Tag | `417:12348` | `registry/dash/ui/tag.tsx` |
| Text Area | `434:6100` | `registry/dash/ui/textarea.tsx` |
| Text Input | `266:5230` | `registry/dash/ui/input.tsx` + `password-input.tsx` + `input-otp.tsx` |
| Time Picker | `164611:83414` | `registry/dash/ui/time-picker.tsx` |
| Switch | `379:6649` | `registry/dash/ui/switch.tsx` |
| Segmented Control | `553:14953` | `registry/dash/ui/segmented-control.tsx` |
| Tooltip | `553:14954` | `registry/dash/ui/tooltip.tsx` |

## Sector Products (Block pages)

| Sector | Node ID | Dash file |
|---|---|---|
| HR Management | `3715:42038` | `app/(docs)/docs/templates/hr-dashboard/page.tsx` |
| Finance & Banking | `3911:35677` | `app/(docs)/docs/templates/finance-dashboard/page.tsx` |
| Marketing & Sales | `6696:81119` | `app/(docs)/docs/templates/marketing-dashboard/page.tsx` |
| Cryptocurrency | `6696:81120` | HOLD (Figma "Soon") |
| AI Product | `164601:2064` | HOLD (Figma "Soon") |

## Product Components

| Component | Node ID | Dash file |
|---|---|---|
| Navigation | `3789:4743` | `registry/dash/ui/navigation-menu.tsx` + `sidebar.tsx` |
| Headers | `3829:27858` | TBD (likely block) |
| Widgets | `2950:5881` | `registry/dash/ui/stat.tsx` + various |
| Empty States | `3860:4301` | `registry/dash/ui/empty-state.tsx` |
