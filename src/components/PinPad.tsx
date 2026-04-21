import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface Props {
  length?: number;
  onComplete: (pin: string) => void;
  label?: string;
  error?: string;
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function PinPad({ length = 4, onComplete, label = 'Enter PIN', error }: Props) {
  const [pin, setPin] = useState('');

  const handleKey = (key: string) => {
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key) return;
    const next = pin + key;
    setPin(next);
    if (next.length === length) {
      onComplete(next);
      setPin('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        {keys.map((key, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.key, !key && styles.keyEmpty]}
            onPress={() => handleKey(key)}
            activeOpacity={key ? 0.7 : 1}
            disabled={!key && key !== '0'}
          >
            {key === 'del' ? (
              <Ionicons name="backspace-outline" size={22} color={colors.text} />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20 },
  label: { color: colors.textSecondary, fontSize: 16, marginBottom: 32 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.border, backgroundColor: 'transparent' },
  dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { color: colors.error, fontSize: 13, marginBottom: 16 },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', marginTop: 24 },
  key: { width: '33.33%', height: 72, alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { opacity: 0 },
  keyText: { color: colors.text, fontSize: 26, fontWeight: '400' },
});
