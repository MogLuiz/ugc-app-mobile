import { Pressable } from 'react-native'

import { Box, Text } from '@/theme/ui'

type AuthFooterLinkProps = {
  prefix: string
  linkLabel: string
  onPress: () => void
}

export function AuthFooterLink({ prefix, linkLabel, onPress }: AuthFooterLinkProps) {
  return (
    <Box alignItems="center" flexDirection="row" justifyContent="center" marginTop="s6">
      <Text variant="bodySm" color="textTertiary">
        {prefix}
      </Text>
      <Pressable onPress={onPress}>
        <Text color="primary" fontSize={14} fontWeight="700">
          {linkLabel}
        </Text>
      </Pressable>
    </Box>
  )
}
