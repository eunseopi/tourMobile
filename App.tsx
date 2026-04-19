import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "src/screens/MainScreen";
import ShopScreen from "src/screens/ShopScreen";
import ProductDetailScreen from "src/screens/ProductDetailScreen";
import MyPageScreen from "src/screens/MyPageScreen";
import CommunityScreen from "src/screens/CommunityScreen";
import PostDetailScreen from "src/screens/PostDetailScreen";
import type { ProductCategory } from "src/types/ProductTypes";

export type RootStackParamList = {
  Main: undefined;
  Shop: undefined;
  MyPage: undefined;
  Community: undefined;
  PostDetail: {
    postId: number;
  };
  ProductDetail: {
    productId: string | number;
    category?: ProductCategory;
  };
};

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={MainScreen} options={{ title: "제주데이" }} />
          <Stack.Screen name="Shop" component={ShopScreen} options={{ title: "구매하기" }} />
          <Stack.Screen name="MyPage" component={MyPageScreen} options={{ title: "마이페이지" }} />
          <Stack.Screen name="Community" component={CommunityScreen} options={{ title: "커뮤니티" }} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: "게시글" }} />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: "상품소개" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
