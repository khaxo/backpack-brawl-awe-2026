import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { HALL_OF_FAME, ROUTES } from "./game/game";
import { BattlePage } from "./pages/BattlePage";
import { HallOfFamePage } from "./pages/HallOfFamePage";
import { Layout } from "./pages/Layout";
import { ResultPage } from "./pages/ResultPage";
import { ShopPage } from "./pages/ShopPage";
import { StartPage } from "./pages/StartPage";
import { GameProvider } from "./state/GameProvider";
import { RequireRoute } from "./state/RequireRoute";

const router = createBrowserRouter([
  {
    path: ROUTES.start,
    element: <Layout />,
    children: [
      // B6 Also behind RequireRoute: with a restored run in progress this page
      // would offer "New run", which throws that run away.
      { index: true, element: <RequireRoute route={ROUTES.start}><StartPage /></RequireRoute> },
      { path: ROUTES.shop, element: <RequireRoute route={ROUTES.shop}><ShopPage /></RequireRoute> },
      { path: ROUTES.battle, element: <RequireRoute route={ROUTES.battle}><BattlePage /></RequireRoute> },
      { path: ROUTES.result, element: <RequireRoute route={ROUTES.result}><ResultPage /></RequireRoute> },
      // B7 Outside RequireRoute: the hall of fame is readable with no run in progress.
      { path: HALL_OF_FAME, element: <HallOfFamePage /> },
      { path: "*", element: <Navigate to={ROUTES.start} replace /> },
    ],
  },
]);

export default function App() {
  return (
    <GameProvider>
      <RouterProvider router={router} />
    </GameProvider>
  );
}
