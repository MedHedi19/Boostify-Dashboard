import mongoose from "mongoose";
import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import connectDB from "../lib/db.server";

type QuizModuleCard = {
  _id: string;
  name?: string;
  slug?: string;
  order?: number;
  questions?: { _id?: string }[];
};

export async function loader() {
  await connectDB();

  const quizModules = await mongoose.connection
    .collection("quizmodules")
    .find(
      { isActive: true },
      {
        projection: {
          _id: 1,
          name: 1,
          slug: 1,
          order: 1,
          "questions._id": 1,
        },
      }
    )
    .sort({ order: 1 })
    .toArray();

  return {
    quizModules: JSON.parse(JSON.stringify(quizModules || [])),
  };
}

export default function Quizzes7PManagementPage() {
  const { quizModules } = useLoaderData<typeof loader>() as { quizModules: QuizModuleCard[] };
  const [searchTerm, setSearchTerm] = useState("");

  const searchQuery = searchTerm.trim().toLowerCase();
  const filteredModules = useMemo(() => {
    if (!searchQuery) {
      return quizModules;
    }

    return quizModules.filter((quizModule) => {
      const moduleName = typeof quizModule.name === "string" ? quizModule.name.toLowerCase() : "";
      const moduleSlug = typeof quizModule.slug === "string" ? quizModule.slug.toLowerCase() : "";
      return moduleName.includes(searchQuery) || moduleSlug.includes(searchQuery);
    });
  }, [quizModules, searchQuery]);

  const totalModules = quizModules.length;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/dashboard/quizzes" className="hover:text-blue-600 transition-colors">
          Gestion des Quiz
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium font-inter">Details de progression</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-inter">Management 7P</h1>
            <p className="mt-2 text-sm text-gray-500 font-inter">
              Choose a module to explore all questions, options, and correct answers.
            </p>
          </div>

          <div className="w-full lg:w-80">
            <label
              htmlFor="module-search"
              className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 font-inter"
            >
              Search modules
            </label>
            <input
              id="module-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by module name or slug"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <p className="text-xs text-blue-700 uppercase tracking-wide font-bold font-inter">Modules actifs</p>
            <p className="text-2xl font-black text-blue-700 mt-1 font-inter">{totalModules}</p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
            <p className="text-xs text-emerald-700 uppercase tracking-wide font-bold font-inter">Modules affiches</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-inter">{filteredModules.length}</p>
          </div>
        </div>
      </div>

      {filteredModules.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
            M
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-1 font-inter">No module found</h3>
          <p className="text-gray-500 font-inter">Try another search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredModules.map((quizModule, index) => {
            const questionCount = Array.isArray(quizModule.questions) ? quizModule.questions.length : 0;

            return (
            <Link
              key={String(quizModule._id)}
              to={`/dashboard/quizzes/management/${String(quizModule._id)}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-bold text-white font-inter">
                  #{Number.isInteger(quizModule.order) ? Number(quizModule.order) + 1 : index + 1}
                </div>
                <span className="text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-semibold font-inter">
                  Active
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 font-inter mb-2 group-hover:text-blue-700 transition-colors">
                {quizModule.name && quizModule.name.trim().length > 0
                  ? quizModule.name
                  : "Unnamed module"}
              </h2>
              <p className="text-xs text-gray-500 font-medium font-inter mb-3">
                Slug: {quizModule.slug || "-"}
              </p>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-inter">Questions: {questionCount}</span>
                <span className="text-xs text-blue-600 font-bold font-inter">Open module</span>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
