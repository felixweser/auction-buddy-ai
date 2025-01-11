import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Messages from "./pages/Messages";
import MyItems from "./pages/MyItems";
import CreateListing from "./pages/CreateListing";
import SearchResults from "./pages/SearchResults";
import PropertyDetails from "./pages/PropertyDetails";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/my-items" element={<MyItems />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;