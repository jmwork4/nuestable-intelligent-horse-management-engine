import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ─── Theme ───────────────────────────────────────────────────────────────────

const colors = {
  primary: "#1B5E20",
  primaryLight: "#4CAF50",
  primaryDark: "#0D3B12",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  accent: "#FF6F00",
  error: "#D32F2F",
  tabInactive: "#9E9E9E",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Horses: undefined;
  Races: undefined;
  Operations: undefined;
  More: undefined;
};

type MoreStackParamList = {
  MoreMenu: undefined;
  Health: undefined;
  Documents: undefined;
  Financial: undefined;
  Notifications: undefined;
};

// ─── Navigators ──────────────────────────────────────────────────────────────

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

// ─── Placeholder Screen Component ───────────────────────────────────────────

function ComingSoonScreen({
  title,
  icon,
  description,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}) {
  return (
    <View style={styles.comingSoonContainer}>
      <View style={styles.comingSoonIconWrapper}>
        <Ionicons name={icon} size={64} color={colors.primary} />
      </View>
      <Text style={styles.comingSoonTitle}>{title}</Text>
      <Text style={styles.comingSoonDescription}>{description}</Text>
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
      </View>
    </View>
  );
}

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <KeyboardAvoidingView
      style={styles.loginContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <View style={styles.loginHeader}>
        <Ionicons name="shield-checkmark" size={48} color={colors.surface} />
        <Text style={styles.loginTitle}>Nuestable</Text>
        <Text style={styles.loginSubtitle}>
          Intelligent Horse Management
        </Text>
      </View>
      <View style={styles.loginForm}>
        <View style={styles.inputGroup}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.replace("Main")}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
        <Text style={styles.loginHint}>
          Demo: michael.torres@emeralddowns.com / password123
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Tab Screens ─────────────────────────────────────────────────────────────

function DashboardScreen() {
  return (
    <ComingSoonScreen
      title="Dashboard"
      icon="grid-outline"
      description="Your stable at a glance: active horses, upcoming races, recent results, and daily tasks."
    />
  );
}

function HorsesScreen() {
  return (
    <ComingSoonScreen
      title="Horses"
      icon="heart-outline"
      description="Full roster of horses with profiles, health status, ownership details, and performance history."
    />
  );
}

function RacesScreen() {
  return (
    <ComingSoonScreen
      title="Races"
      icon="trophy-outline"
      description="Race calendar, entries, results, speed figures, and race analysis tools."
    />
  );
}

function OperationsScreen() {
  return (
    <ComingSoonScreen
      title="Operations"
      icon="clipboard-outline"
      description="Daily checklists, feed logs, therapy schedules, barn management, and task assignments."
    />
  );
}

function HealthScreen() {
  return (
    <ComingSoonScreen
      title="Health"
      icon="medkit-outline"
      description="Vet records, medications with withdrawal tracking, vaccinations, injuries, and lab results."
    />
  );
}

function DocumentsScreen() {
  return (
    <ComingSoonScreen
      title="Documents"
      icon="document-text-outline"
      description="Coggins tests, registration certificates, insurance policies, and health certificates with expiry alerts."
    />
  );
}

function FinancialScreen() {
  return (
    <ComingSoonScreen
      title="Financial"
      icon="wallet-outline"
      description="Expenses, purse earnings, invoices, owner payouts, and financial reports."
    />
  );
}

function NotificationsScreen() {
  return (
    <ComingSoonScreen
      title="Notifications"
      icon="notifications-outline"
      description="Race results, health alerts, document expiry warnings, invoice reminders, and daily reports."
    />
  );
}

// ─── More Menu Screen ────────────────────────────────────────────────────────

function MoreMenuScreen({ navigation }: { navigation: any }) {
  const menuItems = [
    {
      title: "Health Records",
      icon: "medkit-outline" as const,
      screen: "Health",
      badge: null,
    },
    {
      title: "Documents",
      icon: "document-text-outline" as const,
      screen: "Documents",
      badge: "2",
    },
    {
      title: "Financial",
      icon: "wallet-outline" as const,
      screen: "Financial",
      badge: null,
    },
    {
      title: "Notifications",
      icon: "notifications-outline" as const,
      screen: "Notifications",
      badge: "8",
    },
  ];

  return (
    <View style={styles.moreContainer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.moreItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.moreItemLeft}>
            <View style={styles.moreIconWrapper}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
            </View>
            <Text style={styles.moreItemTitle}>{item.title}</Text>
          </View>
          <View style={styles.moreItemRight}>
            {item.badge && (
              <View style={styles.moreBadge}>
                <Text style={styles.moreBadgeText}>{item.badge}</Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      ))}
      <View style={styles.moreFooter}>
        <Text style={styles.moreFooterText}>Nuestable v2.0.0</Text>
        <Text style={styles.moreFooterSubtext}>
          Intelligent Horse Management Engine
        </Text>
      </View>
    </View>
  );
}

// ─── More Stack Navigator ────────────────────────────────────────────────────

function MoreNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: "More" }} />
      <MoreStack.Screen name="Health" component={HealthScreen} options={{ title: "Health Records" }} />
      <MoreStack.Screen name="Documents" component={DocumentsScreen} />
      <MoreStack.Screen name="Financial" component={FinancialScreen} />
      <MoreStack.Screen name="Notifications" component={NotificationsScreen} />
    </MoreStack.Navigator>
  );
}

// ─── Main Tab Navigator ──────────────────────────────────────────────────────

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: "600" },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "Horses":
              iconName = focused ? "heart" : "heart-outline";
              break;
            case "Races":
              iconName = focused ? "trophy" : "trophy-outline";
              break;
            case "Operations":
              iconName = focused ? "clipboard" : "clipboard-outline";
              break;
            case "More":
              iconName = focused ? "ellipsis-horizontal" : "ellipsis-horizontal-outline";
              break;
            default:
              iconName = "help-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen name="Dashboard" component={DashboardScreen} />
      <MainTab.Screen name="Horses" component={HorsesScreen} />
      <MainTab.Screen name="Races" component={RacesScreen} />
      <MainTab.Screen name="Operations" component={OperationsScreen} />
      <MainTab.Screen
        name="More"
        component={MoreNavigator}
        options={{ headerShown: false }}
      />
    </MainTab.Navigator>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Main" component={MainNavigator} />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Login
  loginContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loginHeader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.surface,
    marginTop: 12,
    letterSpacing: 1,
  },
  loginSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  loginForm: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 48,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loginHint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },

  // Coming Soon
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 32,
  },
  comingSoonIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(27,94,32,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  comingSoonDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 24,
  },
  comingSoonBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comingSoonBadgeText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // More Menu
  moreContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 12,
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  moreItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(27,94,32,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  moreItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  moreItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginRight: 8,
  },
  moreBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "700",
  },
  moreFooter: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  moreFooterText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  moreFooterSubtext: {
    fontSize: 12,
    color: colors.tabInactive,
    marginTop: 4,
  },
});
