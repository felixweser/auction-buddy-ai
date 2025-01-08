import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SearchResultsPage from "./pages/SearchResults";
import CreateListing from "./pages/CreateListing";
import ProductPage from "./pages/ProductPage";
import MyItems from "./pages/MyItems";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import ListingInsights from "./pages/ListingInsights";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/my-items" element={<MyItems />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/listing/:id/insights" element={<ListingInsights />} />
      </Routes>
    </Router>
  );
}

export default App;