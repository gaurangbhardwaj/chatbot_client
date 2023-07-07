import { Login, ChatQnAController } from "./components";


const routes = [
  {
    type: "collapse",
    name: "Home",
    key: "dashboard",
    route: "/dashboard",
    component: <ChatQnAController />,
    noCollapse: true,
    protected: true,
  }
];

export default routes;
