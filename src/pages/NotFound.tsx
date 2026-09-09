import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-1 w-full flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-black text-lime-300 mb-4">404</h1>
      <p className="text-xl text-green-200 mb-6">Oops! Page not found</p>
      <a href="/" className="text-amber-300 hover:text-amber-200 underline font-semibold">
        Return to Home
      </a>
    </div>
  );
};

export default NotFound;
