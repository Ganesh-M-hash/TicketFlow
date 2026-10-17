import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebars.jsx";
import Header from "./Header.jsx";

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;