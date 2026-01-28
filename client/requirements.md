## Packages
framer-motion | Complex animations for the power station visualization (turbines, panels)
recharts | For visualizing energy mining history and financial growth
lucide-react | Icon set (already in base, but emphasizing use)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
  mono: ["var(--font-mono)"],
}
Tailwind Config - extend colors:
colors: {
  energy: {
    50: "hsl(142, 70%, 96%)",
    500: "hsl(142, 76%, 36%)",
    600: "hsl(142, 72%, 29%)",
  },
  tech: {
    500: "hsl(199, 89%, 48%)",
  }
}
