# 📊 Vercel Analytics Setup Guide

## 🚀 Quick Start

The analytics system is configured for **Vercel Analytics** by default. It's free, automatic, and provides comprehensive tracking for your Farcaster widget.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# Analytics Configuration
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

**Note**: Vercel Analytics is automatically enabled in production when deployed to Vercel.

## 📱 Usage in Components

### Basic Usage

```tsx
import { useAppAnalytics } from "../hooks/useAnalytics";

function MyComponent() {
  const { trackAppOpened, trackTabChanged, trackSwipeAction } =
    useAppAnalytics();

  useEffect(() => {
    trackAppOpened({ source: "mini_app" });
  }, []);

  const handleTabChange = (tabName: string) => {
    trackTabChanged(tabName, { previousTab: currentTab });
  };

  const handleSwipe = (action: "mark_as_read" | "discard") => {
    trackSwipeAction(action, { castHash: "0x..." });
  };
}
```

### Error Tracking

```tsx
import { useAppAnalytics } from "../hooks/useAnalytics";

function MyComponent() {
  const { trackAppError, trackApiError } = useAppAnalytics();

  const handleApiCall = async () => {
    try {
      const data = await fetch("/api/data");
    } catch (error) {
      trackApiError("/api/data", error, { userId: "123" });
    }
  };
}
```

### Enable/Disable Analytics

```tsx
import { useAnalytics } from "../hooks/useAnalytics";

function SettingsComponent() {
  const { setEnabled } = useAnalytics();

  const disableAnalytics = () => {
    setEnabled(false);
  };

  const enableAnalytics = () => {
    setEnabled(true);
  };
}
```

## 🎯 Available Events

### App Events

- `app_opened` - App launched
- `tab_changed` - User switched tabs
- `refresh_data` - Data refresh triggered

### User Actions

- `swipe_action` - Swipe gesture performed
- `cast_viewed` - Cast opened
- `mark_as_read` - Cast marked as read
- `discard_cast` - Cast discarded
- `theme_changed` - Theme switched
- `settings_opened` - Settings accessed
- `add_to_farcaster` - Add to Farcaster action
- `tutorial_completed` - Tutorial finished

### Error Events

- `error_occurred` - General error
- `api_call_failed` - API call failed
- `performance_issue` - Performance problem

## 📊 Vercel Analytics Features

### Automatic Tracking

- ✅ **Page views** - Automatically tracked
- ✅ **Performance** - Core Web Vitals
- ✅ **Errors** - JavaScript errors
- ✅ **Real-time** - Live user sessions

### Custom Events

```tsx
import { trackEvent } from "../utils/analytics";

// Track custom events
trackEvent("custom_event", {
  property: "value",
  userId: "123",
});
```

## 🧪 Testing

### Development Mode

- **Console logging** for all events
- **No external calls** made
- **Easy debugging** with detailed logs

### Production Mode

- **Real analytics** sent to Vercel
- **Error tracking** enabled
- **Performance monitoring** active

## 🚀 Deployment

### Vercel Deployment

1. **Analytics automatically enabled**
2. **No additional setup** required
3. **Real-time data** available in Vercel dashboard

### Other Platforms

1. **Set environment variables**
2. **Deploy normally**
3. **Analytics will work** if enabled

## 📈 Monitoring

### Vercel Dashboard

- **Real-time analytics**
- **Performance metrics**
- **Error tracking**
- **User sessions**

### Key Metrics to Monitor

- **App opens** - How often users open your widget
- **Tab usage** - Which tabs are most popular
- **Swipe actions** - User engagement with swipe gestures
- **Error rates** - API failures and JavaScript errors
- **Performance** - Load times and Core Web Vitals

## 🔧 Troubleshooting

### Analytics Not Working

1. **Check environment variables**
2. **Verify Vercel deployment**
3. **Check browser console** for errors
4. **Ensure analytics enabled**

### No Data in Dashboard

1. **Wait 24-48 hours** for data to appear
2. **Check if app is getting traffic**
3. **Verify deployment** is live
4. **Check browser console** for analytics logs

## 💡 Best Practices

### Event Naming

- **Use consistent** naming conventions
- **Include context** in properties
- **Avoid PII** in event data

### Error Tracking

- **Track all errors** with context
- **Include user info** when safe
- **Monitor performance** issues

### Performance

- **Minimize impact** on app performance
- **Use batching** for multiple events
- **Avoid blocking** operations

## 🎯 Implementation Examples

### Track App Open

```tsx
const { trackAppOpened } = useAppAnalytics();

useEffect(() => {
  trackAppOpened({
    source: "mini_app",
    theme: themeMode,
    userAgent: navigator.userAgent,
  });
}, []);
```

### Track Tab Changes

```tsx
const { trackTabChanged } = useAppAnalytics();

const handleTabChange = (newTab: string) => {
  trackTabChanged(newTab, {
    previousTab: activeTab,
    sessionDuration: Date.now() - sessionStart,
  });
};
```

### Track Swipe Actions

```tsx
const { trackSwipeAction } = useAppAnalytics();

const handleSwipe = (action: "mark_as_read" | "discard", castHash: string) => {
  trackSwipeAction(action, {
    castHash,
    swipeDirection: action === "mark_as_read" ? "right" : "left",
    timestamp: Date.now(),
  });
};
```

### Track Errors

```tsx
const { trackApiError } = useAppAnalytics();

try {
  const response = await fetch("/api/farcaster-data");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
} catch (error) {
  trackApiError("/api/farcaster-data", error, {
    userId: user?.fid,
    retryCount: 0,
  });
}
```

---

_This analytics system provides comprehensive tracking for your Farcaster widget using Vercel Analytics._
