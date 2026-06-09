import type { FC } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet><title>Not Found | The Hive</title></Helmet>
      <div className="min-h-screen bg-pitch-900 flex flex-col items-center justify-center px-4">
        <p className="font-display text-6xl font-700 text-ember mb-4">404</p>
        <h1 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 mb-2">
          Page Not Found
        </h1>
        <p className="text-base font-body text-pitch-400 mb-8 text-center">
          Looks like this page doesn't exist.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/teams" })}
          className="py-3.5 px-8 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm active:bg-ember-600"
        >
          Go to My Teams
        </button>
      </div>
    </>
  );
};
