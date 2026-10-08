import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Projects from "./pages/Projects";
import Issues from "./pages/Issues";
import PlanPage from "./pages/Plan";
import Mentor from "./pages/Mentor";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/issues/:id" element={<Issues />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/mentor" element={<Mentor />} />
        <Route path="/recursos" element={<Resources />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
