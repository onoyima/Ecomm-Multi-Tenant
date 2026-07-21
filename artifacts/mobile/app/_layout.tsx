import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

setBaseUrl(process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1");

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(vendor)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="product/[id]" options={{ headerShown: true, headerTitle: "" }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: true, headerTitle: "Order Details" }} />
      <Stack.Screen name="checkout/index" options={{ headerShown: true, headerTitle: "Checkout" }} />
      <Stack.Screen name="wallet/index" options={{ headerShown: true, headerTitle: "My Wallet" }} />
      <Stack.Screen name="ai-chat/index" options={{ headerShown: true, headerTitle: "AI Assistant" }} />
      <Stack.Screen name="add-product/index" options={{ headerShown: true, headerTitle: "Add Product" }} />
      <Stack.Screen name="visual-search/index" options={{ headerShown: true, headerTitle: "Visual Search" }} />
      <Stack.Screen name="product-compare/index" options={{ headerShown: true, headerTitle: "Compare Products" }} />
      <Stack.Screen name="referral/index" options={{ headerShown: true, headerTitle: "Refer & Earn" }} />
      <Stack.Screen name="loyalty/index" options={{ headerShown: true, headerTitle: "Loyalty Rewards" }} />
      <Stack.Screen name="coupons/index" options={{ headerShown: true, headerTitle: "My Coupons" }} />
      <Stack.Screen name="help/index" options={{ headerShown: true, headerTitle: "Help Center" }} />
      <Stack.Screen name="order-templates/index" options={{ headerShown: true, headerTitle: "Order Templates" }} />
      <Stack.Screen name="bulk-upload/index" options={{ headerShown: true, headerTitle: "Bulk Upload" }} />
      <Stack.Screen name="seo-dashboard/index" options={{ headerShown: true, headerTitle: "SEO Dashboard" }} />
      <Stack.Screen name="suppliers/index" options={{ headerShown: true, headerTitle: "Supplier Management" }} />
      <Stack.Screen name="customer-segmentation/index" options={{ headerShown: true, headerTitle: "Customer Segmentation" }} />
      <Stack.Screen name="marketing/index" options={{ headerShown: true, headerTitle: "Marketing Tools" }} />
      <Stack.Screen name="escrow/index" options={{ headerShown: true, headerTitle: "Escrow Overview" }} />
      <Stack.Screen name="commissions/index" options={{ headerShown: true, headerTitle: "Commission Management" }} />
      <Stack.Screen name="payouts/index" options={{ headerShown: true, headerTitle: "Payout Management" }} />
      <Stack.Screen name="recently-viewed/index" options={{ headerShown: false }} />
      <Stack.Screen name="low-stock-alerts/index" options={{ headerShown: false }} />
      <Stack.Screen name="flash-sales/index" options={{ headerShown: false }} />
      <Stack.Screen name="shipping-zones/index" options={{ headerShown: false }} />
      <Stack.Screen name="delivery-confirmation/index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <CurrencyProvider>
                <RecentlyViewedProvider>
                  <GestureHandlerRootView>
                    <KeyboardProvider>
                      <RootLayoutNav />
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </RecentlyViewedProvider>
              </CurrencyProvider>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
