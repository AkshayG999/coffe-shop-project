/**
 * Centralized Z-Index Scale
 * Defines all z-index values used throughout the application
 * Ensures no conflicts and maintains clear layering hierarchy
 */

export const Z_INDEX = {
  // Base layers
  HIDDEN: -1,
  BASE: 0,
  STICKY_CONTENT: 30,

  // Navigation and persistent UI (below modals)
  HEADER: 50,

  // Modal and overlay layer (portals rendered separately)
  MODAL_BACKDROP: 1000,
  MODAL: 1100,
  TOOLTIP: 1200,
  NOTIFICATION: 1300,
} as const

/**
 * Usage:
 * - Backdrops (portals): z-[1000]
 * - Modals (portals): z-[1100]
 * - Header (fixed): z-50 (Tailwind class or Z_INDEX.HEADER)
 * 
 * Never use arbitrary z-index values. Always reference from Z_INDEX.
 * The 1000+ layer is reserved for portals only, ensuring they always appear on top.
 */
