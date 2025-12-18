import React, { PropsWithChildren } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ImageProps,
  ViewProps,
  TextProps,
} from 'react-native';

interface AvatarProps extends ViewProps {
  size?: number;
}

export function Avatar({
  size = 40,
  style,
  children,
  ...rest
}: PropsWithChildren<AvatarProps>) {
  return (
    <View
      style={[
        styles.root,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

interface AvatarImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
}

export function AvatarImage({ uri, style, ...rest }: AvatarImageProps) {
  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      resizeMode="cover"
      {...rest}
    />
  );
}

interface AvatarFallbackProps extends TextProps {
  children?: React.ReactNode;
}

export function AvatarFallback({
  style,
  children,
  ...rest
}: AvatarFallbackProps) {
  return (
    <View style={styles.fallbackContainer}>
      <Text style={[styles.fallbackText, style]} {...rest}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
});
