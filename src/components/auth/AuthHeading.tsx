import { Box, Text } from '@/theme/ui'

type AuthHeadingProps = {
  title: string
  subtitle: string
}

export function AuthHeading({ title, subtitle }: AuthHeadingProps) {
  return (
    <Box alignItems="center" marginBottom="s8" gap="s2">
      <Text variant="h2" textAlign="center">
        {title}
      </Text>
      <Text variant="bodySm" color="textTertiary" textAlign="center">
        {subtitle}
      </Text>
    </Box>
  )
}
