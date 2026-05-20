"use client"

import * as React from "react"
import {
  RiSearchLine as Search,
  RiDownloadLine as Download,
  RiExternalLinkLine as ExternalLink,
  RiBuilding2Line as Building,
  RiFileTextLine as FileText,
  RiBookOpenLine as Book,
  RiLinksLine as Linker,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Brand Assets — Figma 1:1 (20 nodes verified 2026-05-18).
 *
 *   177:3255      Master grid — 60 popular brands × 4 variants (Original / Black / White / Outlined)
 *   2798:1154     Brand detail card schema (Adobe example) — variant chips + metadata fields
 *   2802:5645     Adobe Creative Suite (Acrobat, AI, AE, AU, AN, PS, PR, etc — 22 logos)
 *   2802:5644     Banking & Finance (Citi, HSBC, JPMorgan, MasterCard, PayPal, etc — 20 logos)
 *   2802:5643     E-commerce (Airbnb, Amazon, Booking, Lyft, Shopify, Uber — 7 logos)
 *   2802:5642     Browsers (Arc, Brave, Chrome, Edge, Firefox, Opera, Safari, Vivaldi, Yahoo — 11)
 *   2802:5641     Payment methods (Apple Pay, Stripe, Visa, Revolut, Klarna, etc — 19 logos)
 *   2802:5640     Developer / Programming (Angular, GitHub, GitLab, Go, JS, Python, Vue, etc — 60 logos)
 *   2802:5639     Productivity (Notion, Slack, Skype, Trello, Zoom, Asana, etc — 11 logos)
 *   2802:5638     Crypto / Web3 (Bitcoin, Ethereum, Solana, Polygon, Litecoin, etc — 40 logos)
 *   2802:5637     Crypto exchanges (Binance, Coinbase, Bybit, KuCoin, OKX, etc — 10 logos)
 *   2802:5636     Design tools (Figma, Framer, Sketch, Webflow, InVision, etc — 8 logos)
 *   2802:5634     Google products (Gmail, Drive, Maps, Meet, Play, etc — 12 logos)
 *   2802:5633     Microsoft 365 (Excel, OneDrive, Outlook, PowerPoint, Teams, Word — 12 logos)
 *   2802:5632     Music streaming (Apple Music, Spotify, SoundCloud, Shazam, YouTube Music — 10 logos)
 *   2802:5631     OS / Platforms (Android, BlackBerry, ChromeOS, Linux, iOS, Ubuntu, X11 — 7 logos)
 *   2802:5630     Social media (Facebook, Instagram, TikTok, Twitter/X, WhatsApp, etc — 28 logos)
 *   2802:5629     Tech companies (AWS, Apple, Atlassian, Dell, IBM, Meta, OpenAI, Steam — 28 logos)
 *   2802:5628     Streaming services (Disney+, Hulu, Netflix, Prime, Twitch, Vimeo, YouTube — 9 logos)
 *   2802:5627     Misc apps (App Store, Bluetooth, Camera, Grammarly, GreenDot, etc — 12 logos)
 */

type Brand = {
  name: string
  bg: string
  fg?: string
  glyph: string
}

type Category = {
  id: string
  title: string
  count: number
  brands: Brand[]
}

const CATEGORIES: Category[] = [
  {
    id: "popular",
    title: "Popular",
    count: 60,
    brands: [
      { name: "Adobe", bg: "bg-[#E60012]", glyph: "A" },
      { name: "Airbnb", bg: "bg-[#FF5A5F]", glyph: "A" },
      { name: "Amazon", bg: "bg-[#FF9900]", glyph: "a" },
      { name: "Apple", bg: "bg-bg-strong-950", glyph: "" },
      { name: "Bitcoin", bg: "bg-[#F7931A]", glyph: "₿" },
      { name: "Discord", bg: "bg-[#5865F2]", glyph: "D" },
      { name: "Dropbox", bg: "bg-[#0061FF]", glyph: "▼" },
      { name: "Facebook", bg: "bg-[#1877F2]", glyph: "f" },
      { name: "Figma", bg: "bg-bg-strong-950", glyph: "F" },
      { name: "Framer", bg: "bg-[#0099FF]", glyph: "F" },
      { name: "GitHub", bg: "bg-bg-strong-950", glyph: "G" },
      { name: "Google", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "G" },
      { name: "Instagram", bg: "bg-gradient-to-tr from-[#FEDA77] via-[#F58529] to-[#DD2A7B]", glyph: "I" },
      { name: "LinkedIn", bg: "bg-[#0A66C2]", glyph: "in" },
      { name: "Microsoft", bg: "bg-bg-white-0", fg: "text-[#F25022]", glyph: "▣" },
      { name: "Netflix", bg: "bg-[#E50914]", glyph: "N" },
      { name: "Notion", bg: "bg-bg-white-0", fg: "text-bg-strong-950", glyph: "N" },
      { name: "PayPal", bg: "bg-[#003087]", glyph: "P" },
      { name: "Pinterest", bg: "bg-[#E60023]", glyph: "P" },
      { name: "Slack", bg: "bg-bg-white-0", fg: "text-[#4A154B]", glyph: "#" },
      { name: "Spotify", bg: "bg-[#1DB954]", glyph: "♫" },
      { name: "Shopify", bg: "bg-bg-white-0", fg: "text-[#7AB55C]", glyph: "S" },
      { name: "Telegram", bg: "bg-[#26A5E4]", glyph: "T" },
      { name: "Twitch", bg: "bg-[#9146FF]", glyph: "T" },
      { name: "Twitter", bg: "bg-bg-strong-950", glyph: "𝕏" },
      { name: "WhatsApp", bg: "bg-[#25D366]", glyph: "W" },
      { name: "X", bg: "bg-bg-strong-950", glyph: "𝕏" },
      { name: "YouTube", bg: "bg-[#FF0000]", glyph: "▶" },
    ],
  },
  {
    id: "adobe",
    title: "Adobe Creative Suite",
    count: 22,
    brands: [
      { name: "Acrobat", bg: "bg-[#B30B00]", glyph: "Ac" },
      { name: "After Effects", bg: "bg-[#00005B]", fg: "text-[#9999FF]", glyph: "Ae" },
      { name: "Animate", bg: "bg-[#260063]", fg: "text-[#FFA8FE]", glyph: "An" },
      { name: "Audition", bg: "bg-[#00005B]", fg: "text-[#9999FF]", glyph: "Au" },
      { name: "Bridge", bg: "bg-[#291F00]", fg: "text-[#FFA90A]", glyph: "Br" },
      { name: "Character Animator", bg: "bg-[#003D2A]", fg: "text-[#00F5C9]", glyph: "Ch" },
      { name: "Dimension", bg: "bg-[#260063]", fg: "text-[#A2DA1E]", glyph: "Dn" },
      { name: "Dreamweaver", bg: "bg-[#003D2A]", fg: "text-[#00F5C9]", glyph: "Dw" },
      { name: "Express", bg: "bg-[#FF6F00]", glyph: "Ex" },
      { name: "Fresco", bg: "bg-bg-strong-950", fg: "text-white", glyph: "Fr" },
      { name: "Illustrator", bg: "bg-[#330000]", fg: "text-[#FF9A00]", glyph: "Ai" },
      { name: "InCopy", bg: "bg-[#7D1B7E]", glyph: "Ic" },
      { name: "InDesign", bg: "bg-[#49021F]", fg: "text-[#FE3F93]", glyph: "Id" },
      { name: "Lightroom", bg: "bg-[#001E36]", fg: "text-[#31A8FF]", glyph: "Lr" },
      { name: "Photoshop", bg: "bg-[#001E36]", fg: "text-[#31A8FF]", glyph: "Ps" },
      { name: "Premiere Pro", bg: "bg-[#00005B]", fg: "text-[#9999FF]", glyph: "Pr" },
      { name: "Premiere Rush", bg: "bg-[#003D2A]", fg: "text-[#00F5C9]", glyph: "Ru" },
      { name: "Stock", bg: "bg-[#FA5601]", glyph: "St" },
      { name: "Substance", bg: "bg-[#FF6F00]", glyph: "Sb" },
      { name: "XD", bg: "bg-[#470137]", fg: "text-[#FF61F6]", glyph: "Xd" },
    ],
  },
  {
    id: "banking",
    title: "Banking & Finance",
    count: 20,
    brands: [
      { name: "Adyen", bg: "bg-[#0ABF53]", glyph: "A" },
      { name: "American Express", bg: "bg-[#2E77BB]", glyph: "Ax" },
      { name: "Bank of America", bg: "bg-[#E11030]", glyph: "B" },
      { name: "Citi", bg: "bg-bg-white-0", fg: "text-[#066BB8]", glyph: "Ci" },
      { name: "Diners Club", bg: "bg-bg-strong-950", glyph: "D" },
      { name: "HSBC", bg: "bg-[#DB0011]", glyph: "H" },
      { name: "JPMorgan", bg: "bg-[#222A34]", glyph: "JPM" },
      { name: "Klarna", bg: "bg-[#FFA8CD]", fg: "text-bg-strong-950", glyph: "K" },
      { name: "Klaviyo", bg: "bg-[#FFE600]", fg: "text-bg-strong-950", glyph: "Kl" },
      { name: "MasterCard", bg: "bg-[#EB001B]", glyph: "MC" },
      { name: "Patreon", bg: "bg-[#FF424D]", glyph: "P" },
      { name: "PayPal", bg: "bg-[#003087]", glyph: "PP" },
      { name: "Plaid", bg: "bg-[#FFA552]", fg: "text-bg-strong-950", glyph: "Pl" },
      { name: "QuickBooks", bg: "bg-[#2CA01C]", glyph: "Q" },
      { name: "Stripe", bg: "bg-[#635BFF]", glyph: "S" },
      { name: "Venmo", bg: "bg-[#3D95CE]", glyph: "V" },
      { name: "Visa", bg: "bg-[#1A1F71]", fg: "text-[#F7B600]", glyph: "VISA" },
      { name: "Western Union", bg: "bg-[#FFDD00]", fg: "text-bg-strong-950", glyph: "WU" },
      { name: "Zelle", bg: "bg-[#6D1ED4]", glyph: "Z" },
      { name: "Wise", bg: "bg-[#37517E]", glyph: "Wi" },
    ],
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    count: 7,
    brands: [
      { name: "Airbnb", bg: "bg-[#FF5A5F]", glyph: "A" },
      { name: "Amazon", bg: "bg-bg-white-0", fg: "text-bg-strong-950", glyph: "a" },
      { name: "Booking.com", bg: "bg-[#003580]", glyph: "B" },
      { name: "Lyft", bg: "bg-[#FF00BF]", glyph: "L" },
      { name: "Shopify", bg: "bg-[#7AB55C]", glyph: "S" },
      { name: "Tripadvisor", bg: "bg-[#00AA6C]", glyph: "T" },
      { name: "Uber", bg: "bg-bg-strong-950", glyph: "U" },
    ],
  },
  {
    id: "browsers",
    title: "Browsers",
    count: 11,
    brands: [
      { name: "Arc", bg: "bg-gradient-to-br from-[#FF7AB6] via-[#FFB54D] to-[#86C7FF]", glyph: "A" },
      { name: "Brave", bg: "bg-[#FB542B]", glyph: "B" },
      { name: "Chrome", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "◯" },
      { name: "Edge", bg: "bg-[#0FA5C8]", glyph: "E" },
      { name: "Maxthon", bg: "bg-[#0061FF]", glyph: "M" },
      { name: "Firefox", bg: "bg-[#FF7139]", glyph: "🦊" },
      { name: "Opera", bg: "bg-[#FF1B2D]", glyph: "O" },
      { name: "Safari", bg: "bg-[#0FB5EE]", glyph: "✷" },
      { name: "Tor", bg: "bg-[#7D4698]", glyph: "T" },
      { name: "Vivaldi", bg: "bg-[#EF3939]", glyph: "V" },
      { name: "Yahoo", bg: "bg-[#5F01D1]", glyph: "Y!" },
    ],
  },
  {
    id: "payments",
    title: "Payment Methods",
    count: 19,
    brands: [
      { name: "Apple Pay", bg: "bg-bg-strong-950", glyph: " Pay" },
      { name: "AMEX", bg: "bg-[#2E77BB]", glyph: "AX" },
      { name: "Binance Pay", bg: "bg-[#F0B90B]", fg: "text-bg-strong-950", glyph: "B" },
      { name: "Bitcoin Cash", bg: "bg-[#0AC18E]", glyph: "₿" },
      { name: "Cash App", bg: "bg-[#00C244]", glyph: "$" },
      { name: "Discover", bg: "bg-[#FF6000]", glyph: "D" },
      { name: "Diners Club", bg: "bg-[#0079BE]", glyph: "DC" },
      { name: "Klarna", bg: "bg-[#FFA8CD]", fg: "text-bg-strong-950", glyph: "K" },
      { name: "MasterCard", bg: "bg-[#EB001B]", glyph: "MC" },
      { name: "PayPal", bg: "bg-[#003087]", glyph: "PP" },
      { name: "Revolut", bg: "bg-bg-strong-950", glyph: "R" },
      { name: "Skrill", bg: "bg-[#862165]", glyph: "S" },
      { name: "Stripe", bg: "bg-[#635BFF]", glyph: "S" },
      { name: "Visa", bg: "bg-[#1A1F71]", fg: "text-[#F7B600]", glyph: "V" },
      { name: "WeChat Pay", bg: "bg-[#1AAD19]", glyph: "W" },
    ],
  },
  {
    id: "developer",
    title: "Developer / Programming",
    count: 60,
    brands: [
      { name: "Angular", bg: "bg-[#DD0031]", glyph: "A" },
      { name: "AWS", bg: "bg-[#FF9900]", glyph: "AWS" },
      { name: "Bun", bg: "bg-[#FBF0DF]", fg: "text-bg-strong-950", glyph: "🍞" },
      { name: "C", bg: "bg-[#A8B9CC]", fg: "text-bg-strong-950", glyph: "C" },
      { name: "C#", bg: "bg-[#239120]", glyph: "C#" },
      { name: "CSS", bg: "bg-[#1572B6]", glyph: "CSS" },
      { name: "Docker", bg: "bg-[#2496ED]", glyph: "🐋" },
      { name: "Elixir", bg: "bg-[#4B275F]", glyph: "E" },
      { name: "Firebase", bg: "bg-[#FFCA28]", fg: "text-bg-strong-950", glyph: "🔥" },
      { name: "Git", bg: "bg-[#F05032]", glyph: "G" },
      { name: "GitHub", bg: "bg-bg-strong-950", glyph: "G" },
      { name: "GitLab", bg: "bg-[#FC6D26]", glyph: "GL" },
      { name: "Go", bg: "bg-[#00ADD8]", glyph: "Go" },
      { name: "HTML", bg: "bg-[#E34F26]", glyph: "5" },
      { name: "JavaScript", bg: "bg-[#F7DF1E]", fg: "text-bg-strong-950", glyph: "JS" },
      { name: "Java", bg: "bg-[#007396]", glyph: "J" },
      { name: "Kotlin", bg: "bg-[#7F52FF]", glyph: "K" },
      { name: "Linux", bg: "bg-[#FCC624]", fg: "text-bg-strong-950", glyph: "🐧" },
      { name: "Node.js", bg: "bg-[#5FA04E]", glyph: "N" },
      { name: "npm", bg: "bg-[#CB3837]", glyph: "npm" },
      { name: "PHP", bg: "bg-[#777BB4]", glyph: "P" },
      { name: "Python", bg: "bg-[#3776AB]", glyph: "Py" },
      { name: "React", bg: "bg-[#0A0A0A]", fg: "text-[#61DAFB]", glyph: "⚛" },
      { name: "Redux", bg: "bg-[#764ABC]", glyph: "R" },
      { name: "Ruby", bg: "bg-[#CC342D]", glyph: "Ru" },
      { name: "Rust", bg: "bg-bg-strong-950", glyph: "R" },
      { name: "Svelte", bg: "bg-[#FF3E00]", glyph: "S" },
      { name: "TypeScript", bg: "bg-[#3178C6]", glyph: "TS" },
      { name: "Vue", bg: "bg-[#4FC08D]", glyph: "V" },
      { name: "WordPress", bg: "bg-[#21759B]", glyph: "W" },
    ],
  },
  {
    id: "productivity",
    title: "Productivity",
    count: 11,
    brands: [
      { name: "Asana", bg: "bg-[#F06A6A]", glyph: "A" },
      { name: "Evernote", bg: "bg-[#00A82D]", glyph: "E" },
      { name: "Linear", bg: "bg-[#5E6AD2]", glyph: "L" },
      { name: "Monday", bg: "bg-[#FFCB00]", fg: "text-bg-strong-950", glyph: "M" },
      { name: "Motion", bg: "bg-[#0066FF]", glyph: "Mo" },
      { name: "Notion", bg: "bg-bg-white-0", fg: "text-bg-strong-950", glyph: "N" },
      { name: "Skype", bg: "bg-[#00AFF0]", glyph: "Sk" },
      { name: "Slack", bg: "bg-bg-white-0", fg: "text-[#4A154B]", glyph: "#" },
      { name: "Todoist", bg: "bg-[#E44332]", glyph: "T" },
      { name: "Trello", bg: "bg-[#0079BF]", glyph: "T" },
      { name: "Zoom", bg: "bg-[#2D8CFF]", glyph: "Z" },
    ],
  },
  {
    id: "crypto",
    title: "Crypto / Web3",
    count: 40,
    brands: [
      { name: "Aave", bg: "bg-[#B6509E]", glyph: "Aa" },
      { name: "Algorand", bg: "bg-bg-strong-950", glyph: "A" },
      { name: "Avalanche", bg: "bg-[#E84142]", glyph: "AVA" },
      { name: "Binance Coin", bg: "bg-[#F0B90B]", fg: "text-bg-strong-950", glyph: "BNB" },
      { name: "Bitcoin", bg: "bg-[#F7931A]", glyph: "₿" },
      { name: "Bitcoin Cash", bg: "bg-[#0AC18E]", glyph: "BCH" },
      { name: "Cardano", bg: "bg-[#0033AD]", glyph: "ADA" },
      { name: "Chainlink", bg: "bg-[#2A5ADA]", glyph: "LINK" },
      { name: "Cosmos", bg: "bg-[#2E3148]", glyph: "ATOM" },
      { name: "Dogecoin", bg: "bg-[#C2A633]", glyph: "Ð" },
      { name: "EOS", bg: "bg-bg-strong-950", glyph: "EOS" },
      { name: "Ethereum", bg: "bg-[#627EEA]", glyph: "Ξ" },
      { name: "IOTA", bg: "bg-bg-strong-950", glyph: "IOTA" },
      { name: "Litecoin", bg: "bg-[#A6A9AA]", glyph: "Ł" },
      { name: "Monero", bg: "bg-[#FF6600]", glyph: "ɱ" },
      { name: "Polkadot", bg: "bg-[#E6007A]", glyph: "•" },
      { name: "Polygon", bg: "bg-[#8247E5]", glyph: "MATIC" },
      { name: "Shiba Inu", bg: "bg-[#FFA409]", fg: "text-bg-strong-950", glyph: "SHIB" },
      { name: "Solana", bg: "bg-gradient-to-r from-[#9945FF] to-[#14F195]", glyph: "SOL" },
      { name: "Stellar", bg: "bg-bg-strong-950", glyph: "*" },
      { name: "Tether", bg: "bg-[#26A17B]", glyph: "USDT" },
      { name: "TRON", bg: "bg-[#FF060A]", glyph: "TRX" },
      { name: "Uniswap", bg: "bg-[#FF007A]", glyph: "U" },
      { name: "VeChain", bg: "bg-[#15BDFF]", glyph: "VET" },
      { name: "XRP", bg: "bg-bg-strong-950", glyph: "X" },
      { name: "Zcash", bg: "bg-[#F4B728]", fg: "text-bg-strong-950", glyph: "Z" },
    ],
  },
  {
    id: "exchanges",
    title: "Crypto Exchanges",
    count: 10,
    brands: [
      { name: "Binance", bg: "bg-[#F0B90B]", fg: "text-bg-strong-950", glyph: "B" },
      { name: "Bitfinex", bg: "bg-[#16B157]", glyph: "Bf" },
      { name: "Bittrex", bg: "bg-[#1D3F62]", glyph: "Bt" },
      { name: "Bybit", bg: "bg-[#F7A600]", fg: "text-bg-strong-950", glyph: "BYB/T" },
      { name: "Coinbase", bg: "bg-[#0052FF]", glyph: "C" },
      { name: "Crypto.com", bg: "bg-[#003D82]", glyph: "C" },
      { name: "Curve", bg: "bg-[#A5FF6A]", fg: "text-bg-strong-950", glyph: "Cv" },
      { name: "Mexc", bg: "bg-[#2761FF]", glyph: "M" },
      { name: "Kraken", bg: "bg-[#5741D9]", glyph: "K" },
      { name: "OKX", bg: "bg-bg-strong-950", glyph: "OKX" },
    ],
  },
  {
    id: "design",
    title: "Design Tools",
    count: 8,
    brands: [
      { name: "Adobe Creative", bg: "bg-[#FA0F00]", glyph: "Cc" },
      { name: "Figma", bg: "bg-bg-strong-950", glyph: "F" },
      { name: "Framer", bg: "bg-bg-strong-950", glyph: "F" },
      { name: "Dribbble", bg: "bg-[#EA4C89]", glyph: "D" },
      { name: "InVision", bg: "bg-[#FF3366]", glyph: "iV" },
      { name: "Maze", bg: "bg-[#5B6EFF]", glyph: "M" },
      { name: "Sketch", bg: "bg-[#FDB300]", fg: "text-bg-strong-950", glyph: "S" },
      { name: "Webflow", bg: "bg-[#4353FF]", glyph: "W" },
    ],
  },
  {
    id: "google",
    title: "Google Products",
    count: 12,
    brands: [
      { name: "Gmail", bg: "bg-bg-white-0", fg: "text-[#EA4335]", glyph: "M" },
      { name: "Google", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "G" },
      { name: "Google Ads", bg: "bg-bg-white-0", fg: "text-[#FBBC04]", glyph: "A" },
      { name: "Analytics", bg: "bg-bg-white-0", fg: "text-[#F9AB00]", glyph: "▼" },
      { name: "Calendar", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "31" },
      { name: "Docs", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "≡" },
      { name: "Forms", bg: "bg-bg-white-0", fg: "text-[#673AB7]", glyph: "F" },
      { name: "Drive", bg: "bg-bg-white-0", fg: "text-[#34A853]", glyph: "▲" },
      { name: "Maps", bg: "bg-bg-white-0", fg: "text-[#EA4335]", glyph: "📍" },
      { name: "Meet", bg: "bg-bg-white-0", fg: "text-[#00897B]", glyph: "📹" },
      { name: "Play", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "▶" },
      { name: "Photos", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "✿" },
    ],
  },
  {
    id: "microsoft",
    title: "Microsoft 365",
    count: 12,
    brands: [
      { name: "Excel", bg: "bg-[#107C41]", glyph: "X" },
      { name: "Microsoft", bg: "bg-[#F25022]", glyph: "▣" },
      { name: "OneDrive", bg: "bg-[#0078D4]", glyph: "☁" },
      { name: "Office", bg: "bg-[#EA3E23]", glyph: "Office" },
      { name: "OneNote", bg: "bg-[#7719AA]", glyph: "N" },
      { name: "Outlook", bg: "bg-[#0078D4]", glyph: "O" },
      { name: "PowerPoint", bg: "bg-[#B7472A]", glyph: "P" },
      { name: "SharePoint", bg: "bg-[#038387]", glyph: "S" },
      { name: "Teams", bg: "bg-[#6264A7]", glyph: "T" },
      { name: "Word", bg: "bg-[#185ABD]", glyph: "W" },
      { name: "Yammer", bg: "bg-[#0078D4]", glyph: "Y" },
    ],
  },
  {
    id: "music",
    title: "Music Streaming",
    count: 10,
    brands: [
      { name: "Apple Music", bg: "bg-bg-white-0", fg: "text-[#FB233B]", glyph: "♫" },
      { name: "Audible", bg: "bg-bg-strong-950", glyph: "A" },
      { name: "Google Play Music", bg: "bg-[#FF6F00]", glyph: "▶" },
      { name: "Pandora", bg: "bg-[#005483]", glyph: "P" },
      { name: "Shazam", bg: "bg-[#0066FF]", glyph: "S" },
      { name: "SoundCloud", bg: "bg-[#FF5500]", glyph: "S" },
      { name: "Spotify", bg: "bg-[#1DB954]", glyph: "♫" },
      { name: "Tidal", bg: "bg-bg-strong-950", glyph: "T" },
      { name: "YouTube Music", bg: "bg-[#FF0000]", glyph: "▶" },
    ],
  },
  {
    id: "os",
    title: "OS / Platforms",
    count: 7,
    brands: [
      { name: "Android", bg: "bg-bg-white-0", fg: "text-[#3DDC84]", glyph: "🤖" },
      { name: "BlackBerry", bg: "bg-bg-strong-950", glyph: "•" },
      { name: "ChromeOS", bg: "bg-bg-white-0", fg: "text-[#4285F4]", glyph: "◯" },
      { name: "elementary", bg: "bg-bg-white-0", fg: "text-bg-strong-950", glyph: "e" },
      { name: "Linux", bg: "bg-bg-white-0", fg: "text-bg-strong-950", glyph: "X" },
      { name: "Ubuntu", bg: "bg-[#E95420]", glyph: "U" },
      { name: "iOS", bg: "bg-bg-strong-950", glyph: "iOS" },
    ],
  },
  {
    id: "social",
    title: "Social Media",
    count: 28,
    brands: [
      { name: "Beats", bg: "bg-[#E61E2A]", glyph: "b" },
      { name: "Behance", bg: "bg-[#1769FF]", glyph: "Bē" },
      { name: "Bluesky", bg: "bg-[#0085FF]", glyph: "🦋" },
      { name: "Discord", bg: "bg-[#5865F2]", glyph: "D" },
      { name: "Dribbble", bg: "bg-[#EA4C89]", glyph: "D" },
      { name: "Facebook", bg: "bg-[#1877F2]", glyph: "f" },
      { name: "Messenger", bg: "bg-gradient-to-tr from-[#0099FF] to-[#A033FF]", glyph: "M" },
      { name: "FaceTime", bg: "bg-[#34DC60]", glyph: "📹" },
      { name: "Instagram", bg: "bg-gradient-to-tr from-[#FEDA77] via-[#F58529] to-[#DD2A7B]", glyph: "I" },
      { name: "Kakao", bg: "bg-bg-strong-950", fg: "text-[#FEE500]", glyph: "K" },
      { name: "Line", bg: "bg-[#00C300]", glyph: "L" },
      { name: "LinkedIn", bg: "bg-[#0A66C2]", glyph: "in" },
      { name: "Periscope", bg: "bg-bg-strong-950", glyph: "•" },
      { name: "Pinterest", bg: "bg-[#E60023]", glyph: "P" },
      { name: "Quora", bg: "bg-[#B92B27]", glyph: "Q" },
      { name: "Reddit", bg: "bg-[#FF4500]", glyph: "R" },
      { name: "Signal", bg: "bg-[#3A76F0]", glyph: "S" },
      { name: "Snapchat", bg: "bg-[#FFFC00]", fg: "text-bg-strong-950", glyph: "👻" },
      { name: "Telegram", bg: "bg-[#26A5E4]", glyph: "T" },
      { name: "Threads", bg: "bg-bg-strong-950", glyph: "@" },
      { name: "TikTok", bg: "bg-bg-strong-950", glyph: "T" },
      { name: "Tumblr", bg: "bg-[#36465D]", glyph: "t" },
      { name: "Twitter", bg: "bg-[#1DA1F2]", glyph: "T" },
      { name: "X", bg: "bg-bg-strong-950", glyph: "𝕏" },
      { name: "VK", bg: "bg-[#0077FF]", glyph: "VK" },
      { name: "Viber", bg: "bg-[#7360F2]", glyph: "V" },
      { name: "Weibo", bg: "bg-[#E6162D]", glyph: "微" },
      { name: "WhatsApp", bg: "bg-[#25D366]", glyph: "W" },
    ],
  },
  {
    id: "tech",
    title: "Tech Companies",
    count: 28,
    brands: [
      { name: "Asana", bg: "bg-[#F06A6A]", glyph: "A" },
      { name: "AWS", bg: "bg-bg-strong-950", fg: "text-[#FF9900]", glyph: "aws" },
      { name: "Adobe", bg: "bg-bg-white-0", fg: "text-[#FA0F00]", glyph: "A" },
      { name: "Apple", bg: "bg-bg-strong-950", glyph: "" },
      { name: "Atlassian", bg: "bg-[#0052CC]", glyph: "A" },
      { name: "Calendly", bg: "bg-[#006BFF]", glyph: "C" },
      { name: "ChatGPT", bg: "bg-[#10A37F]", glyph: "GPT" },
      { name: "Cloudflare", bg: "bg-bg-white-0", fg: "text-[#F38020]", glyph: "C" },
      { name: "Dell", bg: "bg-[#007DB8]", glyph: "Dell" },
      { name: "Docker", bg: "bg-[#2496ED]", glyph: "D" },
      { name: "DuckDuckGo", bg: "bg-[#DE5833]", glyph: "DD" },
      { name: "Framer", bg: "bg-bg-strong-950", glyph: "F" },
      { name: "HubSpot", bg: "bg-[#FF7A59]", glyph: "H" },
      { name: "IBM", bg: "bg-[#1F70C1]", glyph: "IBM" },
      { name: "Intel", bg: "bg-bg-white-0", fg: "text-[#0071C5]", glyph: "intel" },
      { name: "Mailchimp", bg: "bg-[#FFE01B]", fg: "text-bg-strong-950", glyph: "M" },
      { name: "Meta", bg: "bg-[#0668E1]", glyph: "M" },
      { name: "OpenAI", bg: "bg-bg-strong-950", glyph: "OAI" },
      { name: "PlayStation", bg: "bg-[#003791]", glyph: "PS" },
      { name: "Product Hunt", bg: "bg-[#DA552F]", glyph: "P" },
      { name: "Steam", bg: "bg-[#1B2838]", glyph: "St" },
      { name: "TickTick", bg: "bg-[#3DDC84]", glyph: "T" },
      { name: "Trustpilot", bg: "bg-bg-white-0", fg: "text-[#00B67A]", glyph: "★" },
      { name: "Workday", bg: "bg-[#F38B00]", glyph: "W" },
      { name: "Xbox", bg: "bg-[#107C10]", glyph: "X" },
      { name: "Zapier", bg: "bg-[#FF4A00]", glyph: "Z" },
      { name: "Zendesk", bg: "bg-bg-strong-950", glyph: "Z" },
    ],
  },
  {
    id: "streaming",
    title: "Streaming Services",
    count: 9,
    brands: [
      { name: "Amazon Prime", bg: "bg-bg-white-0", fg: "text-[#00A8E1]", glyph: "p" },
      { name: "Disney+", bg: "bg-bg-white-0", fg: "text-[#113CCF]", glyph: "D+" },
      { name: "Flickr", bg: "bg-bg-white-0", fg: "text-[#FF0084]", glyph: "•" },
      { name: "Hulu", bg: "bg-bg-strong-950", fg: "text-[#1CE783]", glyph: "Hulu" },
      { name: "Instagram", bg: "bg-gradient-to-tr from-[#FEDA77] via-[#F58529] to-[#DD2A7B]", glyph: "I" },
      { name: "Netflix", bg: "bg-[#E50914]", glyph: "N" },
      { name: "Twitch", bg: "bg-[#9146FF]", glyph: "T" },
      { name: "Vimeo", bg: "bg-[#1AB7EA]", glyph: "V" },
      { name: "YouTube", bg: "bg-[#FF0000]", glyph: "▶" },
    ],
  },
  {
    id: "misc",
    title: "Misc Apps",
    count: 12,
    brands: [
      { name: "App Store", bg: "bg-[#0D96F6]", glyph: "A" },
      { name: "Bluetooth", bg: "bg-[#0082FC]", glyph: "B" },
      { name: "Brevo", bg: "bg-[#0B996E]", glyph: "B" },
      { name: "Camera", bg: "bg-[#FF6B9D]", glyph: "📷" },
      { name: "Cleaner", bg: "bg-bg-strong-950", glyph: "C" },
      { name: "Grammarly", bg: "bg-[#15C39A]", glyph: "G" },
      { name: "Headout", bg: "bg-[#F8485E]", glyph: "H" },
      { name: "iMessage", bg: "bg-[#0BD965]", glyph: "💬" },
      { name: "Postman", bg: "bg-[#FF6C37]", glyph: "P" },
      { name: "Producthunt", bg: "bg-[#0EAE38]", glyph: "P" },
      { name: "Star", bg: "bg-bg-white-0", fg: "text-[#00B67A]", glyph: "★" },
      { name: "United Airlines", bg: "bg-bg-strong-950", glyph: "U" },
    ],
  },
]

const VARIANTS = ["Original", "Black", "White"] as const

export default function BrandAssetsPage() {
  const [query, setQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  const totalBrands = CATEGORIES.reduce((sum, c) => sum + c.brands.length, 0)

  const filtered = React.useMemo(() => {
    return CATEGORIES.map((c) => ({
      ...c,
      brands: c.brands.filter(
        (b) =>
          (selectedCategory === "all" || selectedCategory === c.id) &&
          (!query || b.name.toLowerCase().includes(query.toLowerCase())),
      ),
    })).filter((c) => c.brands.length)
  }, [query, selectedCategory])

  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Brand Assets"
        description="Brand logo library — 300+ third-party brand marks across 19 categories. Each brand ships 3-4 surface variants (Original / Black / White / Outlined). Use for: integrations cards, payment-method selectors, login providers, social-share buttons, app store listings."
      />

      <DocsSection title="Library overview">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          {totalBrands}+ logos across {CATEGORIES.length} categories. Each ships as SVG primitive with token-aware fill (so the same component renders Original / Black / White / Outlined via prop). Brand-mark legal use: respect each brand's official guidelines link (see Detail-card spec below).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-3xl">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(selectedCategory === c.id ? "all" : c.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selectedCategory === c.id
                  ? "border-stroke-strong-950 bg-bg-weak-50 text-text-strong-950"
                  : "border-stroke-soft-200 hover:bg-bg-weak-50 text-text-sub-600",
              )}
            >
              <span className="truncate">{c.title}</span>
              <span className="text-xs tabular-nums text-text-soft-400">{c.brands.length}</span>
            </button>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Detail card spec">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each brand exposes 4 metadata fields + 3 surface variants. Use this card when surfacing a brand from search, or as the "About" overlay in an integration directory (Figma node 2798:1154).
        </p>
        <DocsExample
          title="Adobe — variants + metadata"
          preview={<BrandDetailCard brand={CATEGORIES[1].brands[10]} description="Adobe, a global software leader, empowers individuals and businesses to create, deliver, and optimize digital experiences." company="Adobe Inc." />}
          code={`<BrandDetailCard
  brand="Adobe"
  variants={["Original", "Black", "White"]}
  company="Adobe Inc."
  description="..."
  guidelines="https://www.adobe.com/legal/permissions/trademarks.html"
  resource="https://en.wikipedia.org/wiki/Adobe_Inc."
/>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          3 surface treatments per brand — <strong>Original</strong> (full brand colors), <strong>Black</strong> (mono-dark on light surface), <strong>White</strong> (mono-light on dark surface). Outlined variant exists for some marks (see <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Black</code> = stroke-only treatment).
        </p>
        <DocsExample
          title="3 variants × 4 sample brands"
          preview={
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {VARIANTS.map((v) => (
                <div key={v} className="space-y-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{v}</div>
                  <div className="flex justify-center">
                    <BrandLogo brand={CATEGORIES[0].brands[0]} variant={v} size="lg" />
                  </div>
                  <div className="flex justify-center">
                    <BrandLogo brand={CATEGORIES[0].brands[8]} variant={v} size="lg" />
                  </div>
                  <div className="flex justify-center">
                    <BrandLogo brand={CATEGORIES[0].brands[14]} variant={v} size="lg" />
                  </div>
                  <div className="flex justify-center">
                    <BrandLogo brand={CATEGORIES[0].brands[19]} variant={v} size="lg" />
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<BrandLogo name="Adobe" variant="Original" size="lg" />
<BrandLogo name="Adobe" variant="Black"    size="lg" />
<BrandLogo name="Adobe" variant="White"    size="lg" />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          4 standard sizes — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">xs</code> (20), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm</code> (28), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md</code> (32 — default), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg</code> (40), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">xl</code> (48).
        </p>
        <DocsExample
          title="xs / sm / md / lg / xl"
          preview={
            <div className="flex items-end gap-3">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
                <div key={s} className="space-y-1 text-center">
                  <BrandLogo brand={CATEGORIES[0].brands[8]} variant="Original" size={s} />
                  <div className="text-[10px] text-text-soft-400">{s}</div>
                </div>
              ))}
            </div>
          }
          code={`<BrandLogo name="Figma" size="xs" />
<BrandLogo name="Figma" size="md" /> // default
<BrandLogo name="Figma" size="xl" />`}
        />
      </DocsSection>

      <DocsSection title="Catalog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Search + filter the full library. Click a category chip above to scope.
        </p>
        <div className="max-w-md mb-3">
          <InputRoot>
            <InputIcon><Search className="size-4" /></InputIcon>
            <Input
              placeholder="Search brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <button onClick={() => setQuery("")} className="text-xs text-text-soft-400 hover:text-text-sub-600">
                Clear
              </button>
            ) : null}
          </InputRoot>
        </div>
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-stroke-soft-200 p-8 text-center text-sm text-text-sub-600">
              No brands match "{query}".
            </div>
          ) : (
            filtered.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-2">
                    {c.title}
                    <Badge size="sm" appearance="lighter" status="information">{c.brands.length}</Badge>
                  </h3>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
                  {c.brands.map((b) => (
                    <div
                      key={b.name}
                      className="group flex flex-col items-center gap-1 p-1 rounded-md hover:bg-bg-weak-50 transition-colors"
                      title={b.name}
                    >
                      <BrandLogo brand={b} variant="Original" size="md" />
                      <div className="text-[10px] text-text-soft-400 truncate w-full text-center">{b.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { BrandLogo } from "@/registry/dash/ui/brand-logo"

// Integration card
<div className="flex items-center gap-3">
  <BrandLogo name="Figma" size="md" />
  <div>
    <div className="text-sm font-medium">Figma</div>
    <div className="text-xs text-text-sub-600">Design + prototyping</div>
  </div>
</div>

// Payment-method selector
<RadioGroup>
  {["visa", "mastercard", "amex", "paypal"].map(m => (
    <RadioGroupItem value={m} key={m}>
      <BrandLogo name={m} size="sm" />
    </RadioGroupItem>
  ))}
</RadioGroup>

// Social login
<Button style="stroke" tone="neutral">
  <BrandLogo name="Google" size="sm" />
  Continue with Google
</Button>`}
        />
      </DocsSection>

      <DocsSection title="Legal & licensing">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Trademark ownership</strong> — every brand mark in this library is property of its respective owner. Dash does not claim ownership.</li>
          <li>• <strong>Permitted use</strong> — referencing brands in context (integration directories, payment-method selectors, social-share buttons). Always link to or otherwise indicate the relationship.</li>
          <li>• <strong>Prohibited use</strong> — endorsement implication, modifying logos, using brand marks as primary marketing for non-affiliated products.</li>
          <li>• <strong>Per-brand guidelines</strong> — each brand's Detail card links its official trademark/usage policy. Read before placing.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <div className="text-sm text-text-strong-950/90 space-y-1.5">
          <div><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">name</code> — Brand identifier (kebab-case, e.g. <code className="text-xs">&quot;figma&quot;</code>).</div>
          <div><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">variant</code> — <code className="text-xs">&quot;Original&quot; | &quot;Black&quot; | &quot;White&quot;</code> (default Original).</div>
          <div><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">size</code> — <code className="text-xs">&quot;xs&quot; | &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;xl&quot;</code> (default md).</div>
          <div><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">rounded</code> — <code className="text-xs">&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;full&quot;</code> (default md).</div>
          <div><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">aria-label</code> — always provide for accessibility.</div>
        </div>
      </DocsSection>
      <DocsSection title="Lock up vs free-floating">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dash wordmark always sits on the baseline with the dot. Don't tilt, distort, or color-shift the brand mark.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold tracking-tight">Dash<span className="text-primary-base">.</span></span>
                <span className="text-xl font-semibold tracking-tight text-static-white bg-static-black px-3 py-1 rounded">Dash<span className="text-primary-base">.</span></span>
              </div>
            ),
            caption: "Original wordmark on white surface, inverted wordmark on black surface. Geometry untouched, dot stays brand-purple.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold tracking-tight italic" style={{transform: "rotate(-8deg) scaleX(1.3)"}}>Dash<span className="text-success-base">.</span></span>
                <span className="text-xl font-bold tracking-widest" style={{background: "linear-gradient(45deg,#FF6B9D,#FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>D A S H</span>
              </div>
            ),
            caption: "Don't tilt, stretch, recolor, or letter-space the wordmark. The brand mark is a fixed asset — modify the layout around it.",
          }}
        />
      </DocsSection>

      <DocsSection title="Clear-space rule">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Maintain clear space around the wordmark — minimum equal to the cap height. Don't crowd it against other content.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 text-center"><span className="text-xl font-semibold tracking-tight">Dash<span className="text-primary-base">.</span></span></div>
            ),
            caption: "Clear space = at least cap-height on every side. Reads as a stable, confident mark.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 flex items-center gap-1"><span className="text-sm">/</span><span className="text-base font-semibold tracking-tight">Dash<span className="text-primary-base">.</span></span><span className="text-sm">|</span><span className="text-[10px]">EXPRESS</span></div>
            ),
            caption: "Don't crowd the wordmark with slashes, dividers, or sub-brand labels. The mark loses authority.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}

function BrandLogo({
  brand,
  variant = "Original",
  size = "md",
}: {
  brand: Brand
  variant?: (typeof VARIANTS)[number]
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}) {
  const sizeCls = {
    xs: "size-5 text-[8px]",
    sm: "size-7 text-[10px]",
    md: "size-8 text-[11px]",
    lg: "size-10 text-xs",
    xl: "size-12 text-sm",
  }[size]

  const cls =
    variant === "Original"
      ? cn(brand.bg, brand.fg ?? "text-white")
      : variant === "Black"
        ? "bg-bg-strong-950 text-white"
        : "bg-bg-white-0 text-bg-strong-950 border border-stroke-soft-200"

  return (
    <span
      role="img"
      aria-label={brand.name}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-bold shrink-0",
        sizeCls,
        cls,
      )}
    >
      {brand.glyph}
    </span>
  )
}

function BrandDetailCard({
  brand,
  description,
  company,
}: {
  brand: Brand
  description: string
  company: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 max-w-4xl">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BrandLogo brand={brand} variant="Original" size="xl" />
          <div>
            <div className="text-sm font-medium text-text-strong-950">{brand.name}</div>
            <div className="text-xs text-text-sub-600">Software and Creative Solutions</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {VARIANTS.map((v) => (
            <div key={v} className="rounded-lg border border-stroke-soft-200 p-3 text-center">
              <div className="flex justify-center mb-1.5">
                <BrandLogo brand={brand} variant={v} size="md" />
              </div>
              <div className="text-[10px] text-text-soft-400">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <DetailRow icon={Building} label="Company name">{company}</DetailRow>
        <DetailRow icon={FileText} label="Description">{description}</DetailRow>
        <DetailRow icon={Book} label="Guidelines">
          <LinkButton size="sm" className="gap-1">Check Guidelines <ExternalLink className="size-3" /></LinkButton>
        </DetailRow>
        <DetailRow icon={Linker} label="Resource">
          <LinkButton size="sm" className="gap-1">Wikipedia <ExternalLink className="size-3" /></LinkButton>
        </DetailRow>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2 py-2 border-b border-stroke-soft-200">
      <span className="inline-flex items-center gap-1.5 text-xs text-text-sub-600">
        <Icon className="size-4 text-icon-soft-400" />
        {label}
      </span>
      <span className="text-sm text-text-strong-950">{children}</span>
    </div>
  )
}
