import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("components/DashboardLayout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("dashboard/users", "routes/dashboard.users.tsx"),
    route("dashboard/users/:id", "routes/dashboard.users.$id.tsx"),
    route("dashboard/admins", "routes/dashboard.admins.tsx"),
    route("dashboard/challenges", "routes/dashboard.challenges.tsx"),
    route("dashboard/quizzes", "routes/dashboard.quizzes.tsx"),
    route("dashboard/certificates", "routes/dashboard.certificates.tsx"),
    route("dashboard/job-offers", "routes/dashboard.job-offers.tsx"),
    route("dashboard/analytics", "routes/dashboard.analytics.tsx"),
  ]),
] satisfies RouteConfig;
