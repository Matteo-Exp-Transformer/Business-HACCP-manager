// Custom Button component with Postini styling
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  style,
  textStyle,
  icon,
  ...props 
}) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostButton);
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
    }

    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostText);
        break;
    }

    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {icon && <Text style={[getTextStyle(), { marginRight: SPACING.sm }]}>{icon}</Text>}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.light,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.buttonTint,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },

  // Sizes
  smallButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  mediumButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  largeButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },

  // Text styles
  text: {
    fontFamily: FONTS.medium,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.secondary,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.text,
  },

  // Text sizes
  smallText: {
    fontSize: FONTS.sizes.sm,
  },
  mediumText: {
    fontSize: FONTS.sizes.md,
  },
  largeText: {
    fontSize: FONTS.sizes.lg,
  },

  // Disabled state
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.surface,
  },
});

export default Button;