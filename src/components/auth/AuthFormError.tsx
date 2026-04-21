import { Box, Text } from '@/theme/ui'

type AuthFormErrorProps = {
  message: string
}

export function AuthFormError({ message }: AuthFormErrorProps) {
  return (
    <Box
      backgroundColor="errorSurface"
      borderColor="errorBorder"
      borderRadius="md"
      borderWidth={1}
      marginBottom="s4"
      paddingHorizontal="s3"
      paddingVertical="s3"
    >
      <Text color="error" fontSize={13} textAlign="center">
        {message}
      </Text>
    </Box>
  )
}
