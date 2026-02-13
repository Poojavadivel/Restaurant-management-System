import { BrowserRouter } from "react-router-dom";
import FigmaApp from "@/app/App";
import { LoyaltyProvider } from "@/app/context/LoyaltyContext";
import { NotificationsProvider } from "@/context/NotificationsContext";

export default function App() {
  return (
    <BrowserRouter>
      <LoyaltyProvider>
        <NotificationsProvider>
          <FigmaApp />
        </NotificationsProvider>
      </LoyaltyProvider>
    </BrowserRouter>
  );
}
