import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({ label, error, icon, rightIcon, onRightIconPress, secureTextEntry, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        {icon && <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.leftIcon} />}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, (isPassword || rightIcon) && styles.inputWithRight, style as any]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          secureTextEntry={hidden}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} style={styles.rightIcon}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
  },
  inputError: { borderColor: colors.error },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingHorizontal: 16 },
  inputWithIcon: { paddingLeft: 8 },
  inputWithRight: { paddingRight: 8 },
  leftIcon: { marginLeft: 14 },
  rightIcon: { paddingHorizontal: 14 },
  error: { color: colors.error, fontSize: 12, marginTop: 5 },
});
