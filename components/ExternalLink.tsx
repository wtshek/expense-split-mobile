import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';
import { pwaService } from '@/utils/pwa';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  const isStandalone = Platform.OS === 'web' && pwaService.isStandalone();
  
  return (
    <Link
      // Only use target="_blank" if not in PWA standalone mode
      {...(isStandalone ? {} : { target: "_blank" })}
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        } else if (isStandalone) {
          // In PWA standalone mode, prevent opening in new tab
          // Links will open in the same PWA window
          // No event.preventDefault() needed for internal navigation
        }
      }}
    />
  );
}
