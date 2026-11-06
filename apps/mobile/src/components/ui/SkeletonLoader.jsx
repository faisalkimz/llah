import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export default function SkeletonLoader({ width, height, borderRadius = 8, className }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width ?? '100%',
          height: height ?? 16,
          borderRadius,
          backgroundColor: '#e3e8ee',
          opacity,
        },
      ]}
      className={className}
    />
  );
}
