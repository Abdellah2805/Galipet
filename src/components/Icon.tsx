import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, G, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

// Icon name type based on all used icons in the app
type IconName =
  | 'add'
  | 'arrow-back'
  | 'ban'
  | 'bar-chart'
  | 'calendar'
  | 'calendar-outline'
  | 'camera'
  | 'cash-outline'
  | 'chatbubble'
  | 'chatbubble-ellipses'
  | 'chatbubble-ellipses-outline'
  | 'chevron-back'
  | 'chevron-down'
  | 'chevron-forward'
  | 'close'
  | 'cut'
  | 'grid'
  | 'heart'
  | 'home'
  | 'image-outline'
  | 'location'
  | 'logo-octocat'
  | 'map'
  | 'medical'
  | 'notifications'
  | 'notifications-outline'
  | 'options'
  | 'paw'
  | 'pencil'
  | 'people-outline'
  | 'person'
  | 'person-outline'
  | 'restaurant'
  | 'school'
  | 'search'
  | 'star'
  | 'star-outline'
  | 'tennisball'
  | 'time-outline'
  | 'trash-outline'
  | 'trending-up-outline';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// SVG path definitions for each icon
const ICON_PATHS: Record<IconName, React.ReactNode> = {
  // Navigation arrows
  'chevron-back': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Polyline points="15 18 9 12 15 6" />
    </G>
  ),
  'chevron-forward': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Polyline points="9 18 15 12 9 6" />
    </G>
  ),
  'chevron-down': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Polyline points="6 9 12 15 18 9" />
    </G>
  ),
  'arrow-back': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Line x1="19" y1="12" x2="5" y2="12" />
      <Polyline points="12 19 5 12 12 5" />
    </G>
  ),
  'close': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </G>
  ),

  // User / person
  'person': (
    <>
      <Circle cx="12" cy="7" r="4" fill="currentColor" />
      <Path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </>
  ),
  'person-outline': (
    <>
      <Circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <Path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </>
  ),

  // Chat / messages
  'chatbubble': (
    <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" fill="currentColor" />
  ),
  'chatbubble-ellipses': (
    <>
      <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" fill="currentColor" />
      <Circle cx="12" cy="12" r="1" fill="white" />
      <Circle cx="8" cy="12" r="1" fill="white" />
      <Circle cx="16" cy="12" r="1" fill="white" />
    </>
  ),
  'chatbubble-ellipses-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </G>
  ),

  // Notifications
  'notifications': (
    <Path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  ),
  'notifications-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </G>
  ),

  // Calendar
  'calendar': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="3" y1="10" x2="21" y2="10" />
    </G>
  ),
  'calendar-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="3" y1="10" x2="21" y2="10" />
    </G>
  ),

  // Time / clock
  'time-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Circle cx="12" cy="12" r="10" />
      <Polyline points="12 6 12 12 16 14" />
    </G>
  ),

  // Search
  'search': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </G>
  ),

  // Heart
  'heart': (
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="currentColor" />
  ),

  // Home
  'home': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </G>
  ),

  // Medical / health
  'medical': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </G>
  ),

  // Cut / scissors
  'cut': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Circle cx="6" cy="6" r="3" />
      <Circle cx="6" cy="18" r="3" />
      <Line x1="20" y1="4" x2="8.12" y2="15.88" />
      <Line x1="14.47" y1="14.48" x2="20" y2="20" />
      <Line x1="8.12" y1="8.12" x2="12" y2="12" />
    </G>
  ),

  // School / education
  'school': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M22 10l-10-6-10 6 10 6 10-6z" />
      <Path d="M6 12v5c3 3 9 3 12 0v-5" />
    </G>
  ),

  // Tennis ball / sports
  'tennisball': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M4.93 4.93a10 10 0 000 14.14M19.07 19.07a10 10 0 000-14.14M12 12a10 10 0 01-10-10" />
    </G>
  ),

  // Restaurant / food
  'restaurant': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M3 2v20M21 2v20M9 2v8a3 3 0 003 3v0a3 3 0 003-3V2M9 13h6M15 13v8" />
    </G>
  ),

  // Location / map pin
  'location': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <Circle cx="12" cy="10" r="3" />
    </G>
  ),

  // Map
  'map': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <Line x1="8" y1="2" x2="8" y2="18" />
      <Line x1="16" y1="6" x2="16" y2="22" />
    </G>
  ),

  // Grid
  'grid': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Rect x="3" y="3" width="7" height="7" />
      <Rect x="14" y="3" width="7" height="7" />
      <Rect x="14" y="14" width="7" height="7" />
      <Rect x="3" y="14" width="7" height="7" />
    </G>
  ),

  // Options / sliders
  'options': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Line x1="3" y1="12" x2="21" y2="12" />
      <Line x1="3" y1="6" x2="21" y2="6" />
      <Line x1="3" y1="18" x2="21" y2="18" />
    </G>
  ),

  // Add / plus
  'add': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </G>
  ),

  // Ban / forbidden
  'ban': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Circle cx="12" cy="12" r="10" />
      <Line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </G>
  ),

  // Bar chart
  'bar-chart': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Line x1="12" y1="20" x2="12" y2="10" />
      <Line x1="18" y1="20" x2="18" y2="4" />
      <Line x1="6" y1="20" x2="6" y2="16" />
    </G>
  ),

  // Cash / money
  'cash-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Rect x="2" y="6" width="20" height="12" rx="2" />
      <Circle cx="12" cy="12" r="4" />
      <Line x1="6" y1="12" x2="6.01" y2="12" />
      <Line x1="18" y1="12" x2="18.01" y2="12" />
    </G>
  ),

  // People / users
  'people-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </G>
  ),

  // Trending up
  'trending-up-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <Polyline points="17 6 23 6 23 12" />
    </G>
  ),

  // Star
  'star': (
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />
  ),
  'star-outline': (
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  ),

  // Pencil / edit
  'pencil': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </G>
  ),

  // Trash / delete
  'trash-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </G>
  ),

  // Camera
  'camera': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <Circle cx="12" cy="13" r="4" />
    </G>
  ),

  // Paw / pet (custom paw shape)
  'paw': (
    <G fill="currentColor">
      <Ellipse cx="9.5" cy="7.5" rx="2" ry="2.5" />
      <Ellipse cx="14.5" cy="7.5" rx="2" ry="2.5" />
      <Ellipse cx="7" cy="13.5" rx="1.8" ry="2.2" />
      <Ellipse cx="17" cy="13.5" rx="1.8" ry="2.2" />
      <Ellipse cx="12" cy="14" rx="3.5" ry="4" />
    </G>
  ),

  // Image / photo
  'image-outline': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" />
      <Polyline points="21 15 16 10 5 21" />
    </G>
  ),

  // Octocat / generic pet icon (simplified)
  'logo-octocat': (
    <G fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z" />
    </G>
  ),
};

export default function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  const content = ICON_PATHS[name];

  if (!content) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        color={color}
        style={{ width: size, height: size }}
      >
        {content}
      </Svg>
    </View>
  );
}

export type { IconName };
