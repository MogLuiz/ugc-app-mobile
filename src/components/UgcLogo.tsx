import { Circle, Defs, LinearGradient, Path, Rect, Stop, Svg, G } from 'react-native-svg'

type Props = {
  size?: number
}

export function UgcLogo({ size = 44 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <LinearGradient id="ugc-logo-grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#6B46C1" />
          <Stop offset="1" stopColor="#8B5CF6" />
        </LinearGradient>
      </Defs>
      <Rect width="32" height="32" rx="8" fill="url(#ugc-logo-grad)" />
      <G
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(16 16) scale(0.67) translate(-12 -11.4)"
      >
        <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <Circle cx="12" cy="10" r="3" />
      </G>
    </Svg>
  )
}
