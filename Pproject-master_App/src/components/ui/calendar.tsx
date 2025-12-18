import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import {
  Calendar as RNCalendar,
  DateData,
} from 'react-native-calendars';

export type MarkedDates = {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dotColor?: string;
    disabled?: boolean;
  };
};

export interface CalendarProps {
  /** 선택된 날짜 (YYYY-MM-DD) */
  selectedDate?: string;
  /** 날짜 선택 시 호출 */
  onSelectDate?: (dateString: string, dateData: DateData) => void;
  /** 마킹할 날짜들 (점/색 등) */
  markedDates?: MarkedDates;
  /** 최소 / 최대 선택 가능 날짜 */
  minDate?: string;
  maxDate?: string;
  /** 스타일 커스터마이징 */
  style?: ViewStyle;
}

/**
 * Expo / React Native용 Calendar 컴포넌트
 * react-day-picker 대체
 */
export function Calendar({
  selectedDate,
  onSelectDate,
  markedDates,
  minDate,
  maxDate,
  style,
}: CalendarProps) {
  return (
    <RNCalendar
      style={[styles.calendar, style]}
      current={selectedDate}
      markedDates={{
        ...(markedDates || {}),
        ...(selectedDate
          ? {
              [selectedDate]: {
                ...(markedDates?.[selectedDate] || {}),
                selected: true,
              },
            }
          : {}),
      }}
      onDayPress={(day: DateData) => {
        onSelectDate?.(day.dateString, day);
      }}
      minDate={minDate}
      maxDate={maxDate}
      theme={{
        backgroundColor: '#FFFFFF',
        calendarBackground: '#FFFFFF',
        textSectionTitleColor: '#6B7280', // gray-500
        selectedDayBackgroundColor: '#3B82F6', // blue-500
        selectedDayTextColor: '#FFFFFF',
        todayTextColor: '#2563EB', // blue-600
        dayTextColor: '#111827', // gray-900
        textDisabledColor: '#D1D5DB', // gray-300
        monthTextColor: '#111827',
        arrowColor: '#111827',
        textDayFontSize: 14,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 12,
      }}
    />
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 12,
    padding: 8,
  },
});
