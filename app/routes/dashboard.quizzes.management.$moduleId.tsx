import { useEffect, useMemo, useState } from "react";
import mongoose from "mongoose";
import { Link, useFetcher, useLoaderData, useRevalidator } from "react-router";
import connectDB from "../lib/db.server";

type LocalizedText = {
  fr?: string;
  en?: string;
  ar?: string;
};

type QuizQuestion = {
  _id: string;
  order?: number;
  isActive?: boolean;
  question?: LocalizedText;
  options?: LocalizedText[];
  correct?: LocalizedText;
};

type QuizModuleDetails = {
  _id: string;
  name?: string;
  slug?: string;
  order?: number;
  questions?: QuizQuestion[];
};

type ActionResult = {
  success?: boolean;
  action?: "delete-questions" | "add-question" | "update-question";
  deletedCount?: number;
  addedCount?: number;
  updatedCount?: number;
  optionCount?: number;
  error?: string;
};

type LanguageView = "all" | "fr" | "en" | "ar";

type DraftOption = {
  id: string;
  fr: string;
  en: string;
  ar: string;
};

const toText = (value?: string) => (typeof value === "string" ? value.trim() : "");

const normalizeLocalizedText = (value: any): LocalizedText => ({
  fr: toText(value?.fr),
  en: toText(value?.en),
  ar: toText(value?.ar),
});

const hasAllLocalizedValues = (value?: LocalizedText) =>
  Boolean(value && toText(value.fr) && toText(value.en) && toText(value.ar));

const localizedEquals = (left?: LocalizedText, right?: LocalizedText) =>
  toText(left?.fr) === toText(right?.fr) &&
  toText(left?.en) === toText(right?.en) &&
  toText(left?.ar) === toText(right?.ar);

const parseJsonField = <T,>(raw: FormDataEntryValue | null, fallback: T): T => {
  if (typeof raw !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const getLocalizedText = (value: LocalizedText | undefined, language: Exclude<LanguageView, "all">) => {
  if (!value) {
    return "";
  }

  return toText(value[language]) || toText(value.fr) || toText(value.en) || toText(value.ar);
};

const isOptionCorrect = (option?: LocalizedText, correct?: LocalizedText) => {
  const optionFr = toText(option?.fr);
  const optionEn = toText(option?.en);
  const optionAr = toText(option?.ar);

  const correctFr = toText(correct?.fr);
  const correctEn = toText(correct?.en);
  const correctAr = toText(correct?.ar);

  return (
    (optionFr && correctFr && optionFr === correctFr) ||
    (optionEn && correctEn && optionEn === correctEn) ||
    (optionAr && correctAr && optionAr === correctAr)
  );
};

const textMatches = (query: string, value?: string) => {
  if (!query) {
    return true;
  }

  return toText(value).toLowerCase().includes(query);
};

const createDraftOption = (): DraftOption => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  fr: "",
  en: "",
  ar: "",
});

const mapLocalizedOptionsToDraft = (options: LocalizedText[] | undefined): DraftOption[] => {
  const source = Array.isArray(options) ? options : [];
  if (source.length === 0) {
    return [createDraftOption(), createDraftOption()];
  }

  return source.map((option) => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    fr: toText(option?.fr),
    en: toText(option?.en),
    ar: toText(option?.ar),
  }));
};

const draftOptionToLocalized = (option: DraftOption): LocalizedText => ({
  fr: toText(option.fr),
  en: toText(option.en),
  ar: toText(option.ar),
});

export async function loader({ params }: any) {
  await connectDB();

  const moduleId = params?.moduleId;
  if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
    throw new Response("Invalid module id", { status: 400 });
  }

  const objectId = new mongoose.Types.ObjectId(moduleId);
  const quizModule = await mongoose.connection.collection("quizmodules").findOne(
    { _id: objectId, isActive: true },
    {
      projection: {
        _id: 1,
        name: 1,
        slug: 1,
        order: 1,
        "questions._id": 1,
        "questions.order": 1,
        "questions.isActive": 1,
        "questions.question": 1,
        "questions.options": 1,
        "questions.correct": 1,
      },
    }
  );

  if (!quizModule) {
    throw new Response("Quiz module not found", { status: 404 });
  }

  return {
    quizModule: JSON.parse(JSON.stringify(quizModule)),
  };
}

export async function action({ request, params }: any) {
  await connectDB();

  const moduleId = params?.moduleId;
  if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
    return Response.json({ error: "Invalid module id" }, { status: 400 });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  const objectId = new mongoose.Types.ObjectId(moduleId);

  if (intent === "delete-questions") {
    const rawQuestionIds = String(formData.get("questionIds") || "[]");
    let selectedQuestionIds: string[] = [];

    try {
      const parsed = JSON.parse(rawQuestionIds);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid question ids payload");
      }

      selectedQuestionIds = parsed.map((id) => String(id)).filter(Boolean);
    } catch (error) {
      return Response.json({ error: "Invalid question ids format" }, { status: 400 });
    }

    if (selectedQuestionIds.length === 0) {
      return Response.json({ error: "Select at least one question to delete" }, { status: 400 });
    }

    const moduleDoc = await mongoose.connection.collection("quizmodules").findOne(
      { _id: objectId, isActive: true },
      { projection: { questions: 1 } }
    );

    if (!moduleDoc) {
      return Response.json({ error: "Quiz module not found" }, { status: 404 });
    }

    const originalQuestions = Array.isArray(moduleDoc.questions) ? moduleDoc.questions : [];
    const selectedSet = new Set(selectedQuestionIds);

    const remainingQuestions = originalQuestions.filter(
      (question: any) => !selectedSet.has(String(question?._id))
    );

    const deletedCount = originalQuestions.length - remainingQuestions.length;
    if (deletedCount <= 0) {
      return Response.json({ error: "No matching questions found" }, { status: 400 });
    }

    const reorderedQuestions = remainingQuestions.map((question: any, index: number) => ({
      ...question,
      order: index,
    }));

    await mongoose.connection.collection("quizmodules").updateOne(
      { _id: objectId },
      {
        $set: {
          questions: reorderedQuestions,
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({ success: true, action: "delete-questions", deletedCount });
  }

  if (intent === "add-question") {
    const parsedQuestion = normalizeLocalizedText(parseJsonField<any>(formData.get("question"), {}));
    const parsedOptions = parseJsonField<any[]>(formData.get("options"), []);
    const parsedCorrect = normalizeLocalizedText(parseJsonField<any>(formData.get("correct"), {}));
    const rawCorrectIndex = Number(formData.get("correctIndex"));

    if (!hasAllLocalizedValues(parsedQuestion)) {
      return Response.json({ error: "Question text is required in FR, EN, and AR." }, { status: 400 });
    }

    const normalizedOptions = parsedOptions
      .map((option) => normalizeLocalizedText(option))
      .filter((option) => toText(option.fr) || toText(option.en) || toText(option.ar));

    if (normalizedOptions.some((option) => !hasAllLocalizedValues(option))) {
      return Response.json({ error: "Every option must include FR, EN, and AR values." }, { status: 400 });
    }

    if (normalizedOptions.length < 2) {
      return Response.json({ error: "At least two options are required." }, { status: 400 });
    }

    const selectedByIndex =
      Number.isInteger(rawCorrectIndex) && rawCorrectIndex >= 0 && rawCorrectIndex < normalizedOptions.length
        ? normalizedOptions[rawCorrectIndex]
        : undefined;

    const finalCorrect = selectedByIndex || (hasAllLocalizedValues(parsedCorrect) ? parsedCorrect : undefined);
    if (!finalCorrect) {
      return Response.json({ error: "Select the correct option from the options list." }, { status: 400 });
    }

    let fullOptions = normalizedOptions.filter(
      (option, index, array) =>
        array.findIndex((candidate) => localizedEquals(candidate, option)) === index
    );

    if (!fullOptions.some((option) => localizedEquals(option, finalCorrect))) {
      fullOptions = [...fullOptions, finalCorrect];
    }

    if (fullOptions.length < 2) {
      return Response.json({ error: "At least two options are required." }, { status: 400 });
    }

    const moduleDoc = await mongoose.connection.collection("quizmodules").findOne(
      { _id: objectId, isActive: true },
      { projection: { questions: 1 } }
    );

    if (!moduleDoc) {
      return Response.json({ error: "Quiz module not found" }, { status: 404 });
    }

    const existingQuestions = Array.isArray(moduleDoc.questions) ? moduleDoc.questions : [];
    const newQuestion = {
      _id: new mongoose.Types.ObjectId(),
      order: existingQuestions.length,
      question: parsedQuestion,
      options: fullOptions,
      correct: finalCorrect,
      isActive: true,
    };

    const updateResult = await mongoose.connection.collection("quizmodules").updateOne(
      { _id: objectId, isActive: true },
      {
        $push: { questions: newQuestion },
        $set: { updatedAt: new Date() },
      } as any
    );

    if (!updateResult.matchedCount) {
      return Response.json({ error: "Quiz module not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      action: "add-question",
      addedCount: 1,
      optionCount: fullOptions.length,
    });
  }

  if (intent === "update-question") {
    const questionId = String(formData.get("questionId") || "");
    if (!questionId) {
      return Response.json({ error: "Question id is required." }, { status: 400 });
    }

    const parsedQuestion = normalizeLocalizedText(parseJsonField<any>(formData.get("question"), {}));
    const parsedOptions = parseJsonField<any[]>(formData.get("options"), []);
    const parsedCorrect = normalizeLocalizedText(parseJsonField<any>(formData.get("correct"), {}));
    const rawCorrectIndex = Number(formData.get("correctIndex"));

    if (!hasAllLocalizedValues(parsedQuestion)) {
      return Response.json({ error: "Question text is required in FR, EN, and AR." }, { status: 400 });
    }

    const normalizedOptions = parsedOptions
      .map((option) => normalizeLocalizedText(option))
      .filter((option) => toText(option.fr) || toText(option.en) || toText(option.ar));

    if (normalizedOptions.some((option) => !hasAllLocalizedValues(option))) {
      return Response.json({ error: "Every option must include FR, EN, and AR values." }, { status: 400 });
    }

    if (normalizedOptions.length < 2) {
      return Response.json({ error: "At least two options are required." }, { status: 400 });
    }

    const selectedByIndex =
      Number.isInteger(rawCorrectIndex) && rawCorrectIndex >= 0 && rawCorrectIndex < normalizedOptions.length
        ? normalizedOptions[rawCorrectIndex]
        : undefined;

    const finalCorrect = selectedByIndex || (hasAllLocalizedValues(parsedCorrect) ? parsedCorrect : undefined);
    if (!finalCorrect) {
      return Response.json({ error: "Select the correct option from the options list." }, { status: 400 });
    }

    let fullOptions = normalizedOptions.filter(
      (option, index, array) =>
        array.findIndex((candidate) => localizedEquals(candidate, option)) === index
    );

    if (!fullOptions.some((option) => localizedEquals(option, finalCorrect))) {
      fullOptions = [...fullOptions, finalCorrect];
    }

    if (fullOptions.length < 2) {
      return Response.json({ error: "At least two options are required." }, { status: 400 });
    }

    const moduleDoc = await mongoose.connection.collection("quizmodules").findOne(
      { _id: objectId, isActive: true },
      { projection: { questions: 1 } }
    );

    if (!moduleDoc) {
      return Response.json({ error: "Quiz module not found" }, { status: 404 });
    }

    const existingQuestions = Array.isArray(moduleDoc.questions) ? moduleDoc.questions : [];
    const targetIndex = existingQuestions.findIndex(
      (question: any) => String(question?._id) === questionId
    );

    if (targetIndex < 0) {
      return Response.json({ error: "Question not found in this module." }, { status: 404 });
    }

    const existingQuestion = existingQuestions[targetIndex] || {};
    const updatedQuestion = {
      ...existingQuestion,
      _id: existingQuestion._id,
      order: Number.isInteger(existingQuestion.order) ? existingQuestion.order : targetIndex,
      question: parsedQuestion,
      options: fullOptions,
      correct: finalCorrect,
      isActive: existingQuestion.isActive !== false,
    };

    const updatedQuestions = existingQuestions.map((question: any, index: number) =>
      index === targetIndex ? updatedQuestion : question
    );

    await mongoose.connection.collection("quizmodules").updateOne(
      { _id: objectId, isActive: true },
      {
        $set: {
          questions: updatedQuestions,
          updatedAt: new Date(),
        },
      } as any
    );

    return Response.json({
      success: true,
      action: "update-question",
      updatedCount: 1,
      optionCount: fullOptions.length,
    });
  }

  return Response.json({ error: "Unsupported action" }, { status: 400 });
}

export default function ModuleQuestionsManagementPage() {
  const { quizModule } = useLoaderData<typeof loader>() as { quizModule: QuizModuleDetails };
  const fetcher = useFetcher<ActionResult>();
  const revalidator = useRevalidator();

  const [searchTerm, setSearchTerm] = useState("");
  const [languageView, setLanguageView] = useState<LanguageView>("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState<LocalizedText>({ fr: "", en: "", ar: "" });
  const [draftOptions, setDraftOptions] = useState<DraftOption[]>([createDraftOption(), createDraftOption()]);
  const [draftCorrectOptionId, setDraftCorrectOptionId] = useState<string>("");
  const [draftError, setDraftError] = useState<string>("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string>("");
  const [editQuestion, setEditQuestion] = useState<LocalizedText>({ fr: "", en: "", ar: "" });
  const [editOptions, setEditOptions] = useState<DraftOption[]>([createDraftOption(), createDraftOption()]);
  const [editCorrectOptionId, setEditCorrectOptionId] = useState<string>("");
  const [editError, setEditError] = useState<string>("");

  const questions = Array.isArray(quizModule?.questions) ? quizModule.questions : [];
  const searchQuery = searchTerm.trim().toLowerCase();

  const sortedQuestions = useMemo(
    () => questions.slice().sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
    [questions]
  );

  const filteredQuestions = useMemo(() => {
    if (!searchQuery) {
      return sortedQuestions;
    }

    return sortedQuestions.filter((question) => {
      const questionTexts = [question?.question?.fr, question?.question?.en, question?.question?.ar];
      const correctTexts = [question?.correct?.fr, question?.correct?.en, question?.correct?.ar];
      const optionTexts = (question?.options || []).flatMap((option) => [option?.fr, option?.en, option?.ar]);

      return [...questionTexts, ...correctTexts, ...optionTexts].some((value) =>
        textMatches(searchQuery, value)
      );
    });
  }, [sortedQuestions, searchQuery]);

  const displayedQuestionIds = filteredQuestions.map((question) => String(question._id));
  const allDisplayedSelected =
    displayedQuestionIds.length > 0 &&
    displayedQuestionIds.every((questionId) => selectedQuestionIds.includes(questionId));

  const isDeleting =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "delete-questions";

  const isAdding =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "add-question";

  const isUpdating =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "update-question";

  useEffect(() => {
    if (!fetcher.data) {
      return;
    }

    if (fetcher.data.success) {
      if (fetcher.data.action === "delete-questions") {
        setFeedbackMessage(`${fetcher.data.deletedCount || 0} question(s) deleted successfully.`);
        setSelectedQuestionIds([]);
      }

      if (fetcher.data.action === "add-question") {
        setFeedbackMessage(
          `Question added successfully with ${fetcher.data.optionCount || 0} option(s).`
        );
        setDraftQuestion({ fr: "", en: "", ar: "" });
        setDraftOptions([createDraftOption(), createDraftOption()]);
        setDraftCorrectOptionId("");
        setDraftError("");
        setIsAddModalOpen(false);
      }

      if (fetcher.data.action === "update-question") {
        setFeedbackMessage(
          `Question updated successfully with ${fetcher.data.optionCount || 0} option(s).`
        );
        resetEditForm();
        setIsEditModalOpen(false);
      }

      revalidator.revalidate();
      return;
    }

    if (fetcher.data.error) {
      setFeedbackMessage(fetcher.data.error);
    }
  }, [fetcher.data, revalidator]);

  const languageButtons: { key: LanguageView; label: string }[] = [
    { key: "all", label: "All" },
    { key: "fr", label: "FR" },
    { key: "en", label: "EN" },
    { key: "ar", label: "AR" },
  ];

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestionId((current) => (current === questionId ? null : questionId));
  };

  const toggleSingleSelection = (questionId: string, checked: boolean) => {
    setSelectedQuestionIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(questionId);
      } else {
        next.delete(questionId);
      }
      return Array.from(next);
    });
  };

  const toggleDisplayedSelection = (checked: boolean) => {
    setSelectedQuestionIds((current) => {
      const next = new Set(current);
      displayedQuestionIds.forEach((questionId) => {
        if (checked) {
          next.add(questionId);
        } else {
          next.delete(questionId);
        }
      });
      return Array.from(next);
    });
  };

  const handleDeleteSelected = () => {
    if (selectedQuestionIds.length === 0) {
      setFeedbackMessage("Select at least one question to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedQuestionIds.length} selected question(s)? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    fetcher.submit(
      {
        intent: "delete-questions",
        questionIds: JSON.stringify(selectedQuestionIds),
      },
      { method: "post" }
    );
  };

  const resetDraftForm = () => {
    const firstOption = createDraftOption();
    const secondOption = createDraftOption();
    setDraftQuestion({ fr: "", en: "", ar: "" });
    setDraftOptions([firstOption, secondOption]);
    setDraftCorrectOptionId(firstOption.id);
    setDraftError("");
  };

  const openAddModal = () => {
    resetDraftForm();
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setDraftError("");
  };

  const resetEditForm = () => {
    const firstOption = createDraftOption();
    const secondOption = createDraftOption();
    setEditingQuestionId("");
    setEditQuestion({ fr: "", en: "", ar: "" });
    setEditOptions([firstOption, secondOption]);
    setEditCorrectOptionId(firstOption.id);
    setEditError("");
  };

  const openEditModal = (question: QuizQuestion) => {
    const mappedOptions = mapLocalizedOptionsToDraft(question.options);
    const matchedCorrectOption = mappedOptions.find((option) =>
      localizedEquals(draftOptionToLocalized(option), question.correct)
    );

    let nextOptions = mappedOptions;
    let nextCorrectOptionId = matchedCorrectOption?.id || mappedOptions[0]?.id || "";

    if (!matchedCorrectOption && hasAllLocalizedValues(question.correct)) {
      const correctAsOption: DraftOption = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        fr: toText(question.correct?.fr),
        en: toText(question.correct?.en),
        ar: toText(question.correct?.ar),
      };
      nextOptions = [...mappedOptions, correctAsOption];
      nextCorrectOptionId = correctAsOption.id;
    }

    setEditingQuestionId(String(question._id));
    setEditQuestion({
      fr: toText(question.question?.fr),
      en: toText(question.question?.en),
      ar: toText(question.question?.ar),
    });
    setEditOptions(nextOptions);
    setEditCorrectOptionId(nextCorrectOptionId);
    setEditError("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    resetEditForm();
  };

  const addDraftOption = () => {
    setDraftOptions((current) => {
      const nextOption = createDraftOption();
      if (!draftCorrectOptionId) {
        setDraftCorrectOptionId(nextOption.id);
      }
      return [...current, nextOption];
    });
  };

  const removeDraftOption = (optionId: string) => {
    setDraftOptions((current) => {
      if (current.length <= 1) {
        return current;
      }

      const remaining = current.filter((option) => option.id !== optionId);
      if (draftCorrectOptionId === optionId) {
        setDraftCorrectOptionId(remaining[0]?.id || "");
      }
      return remaining;
    });
  };

  const updateDraftOption = (optionId: string, field: keyof Omit<DraftOption, "id">, value: string) => {
    setDraftOptions((current) =>
      current.map((option) =>
        option.id === optionId ? { ...option, [field]: value } : option
      )
    );
  };

  const addEditOption = () => {
    setEditOptions((current) => {
      const nextOption = createDraftOption();
      if (!editCorrectOptionId) {
        setEditCorrectOptionId(nextOption.id);
      }
      return [...current, nextOption];
    });
  };

  const removeEditOption = (optionId: string) => {
    setEditOptions((current) => {
      if (current.length <= 1) {
        return current;
      }

      const remaining = current.filter((option) => option.id !== optionId);
      if (editCorrectOptionId === optionId) {
        setEditCorrectOptionId(remaining[0]?.id || "");
      }
      return remaining;
    });
  };

  const updateEditOption = (optionId: string, field: keyof Omit<DraftOption, "id">, value: string) => {
    setEditOptions((current) =>
      current.map((option) =>
        option.id === optionId ? { ...option, [field]: value } : option
      )
    );
  };

  const hasAllLanguages = (value: LocalizedText) =>
    toText(value.fr).length > 0 && toText(value.en).length > 0 && toText(value.ar).length > 0;

  const handleDraftSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasAllLanguages(draftQuestion)) {
      setDraftError("Question text is required in FR, EN, and AR.");
      return;
    }

    if (draftOptions.length === 0) {
      setDraftError("Add at least one additional option.");
      return;
    }

    if (draftOptions.some((option) => !hasAllLanguages(option))) {
      setDraftError("Every option must include FR, EN, and AR values.");
      return;
    }

    const correctIndex = draftOptions.findIndex((option) => option.id === draftCorrectOptionId);
    if (correctIndex < 0) {
      setDraftError("Select the correct option.");
      return;
    }

    const payload = {
      question: {
        fr: toText(draftQuestion.fr),
        en: toText(draftQuestion.en),
        ar: toText(draftQuestion.ar),
      },
      options: draftOptions.map((option) => ({
        fr: toText(option.fr),
        en: toText(option.en),
        ar: toText(option.ar),
      })),
      correctIndex,
    };

    setDraftError("");
    fetcher.submit(
      {
        intent: "add-question",
        question: JSON.stringify(payload.question),
        options: JSON.stringify(payload.options),
        correctIndex: String(payload.correctIndex),
      },
      { method: "post" }
    );
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingQuestionId) {
      setEditError("Question id is missing.");
      return;
    }

    if (!hasAllLanguages(editQuestion)) {
      setEditError("Question text is required in FR, EN, and AR.");
      return;
    }

    if (editOptions.length === 0) {
      setEditError("Add at least one additional option.");
      return;
    }

    if (editOptions.some((option) => !hasAllLanguages(option))) {
      setEditError("Every option must include FR, EN, and AR values.");
      return;
    }

    const correctIndex = editOptions.findIndex((option) => option.id === editCorrectOptionId);
    if (correctIndex < 0) {
      setEditError("Select the correct option.");
      return;
    }

    const payload = {
      questionId: editingQuestionId,
      question: {
        fr: toText(editQuestion.fr),
        en: toText(editQuestion.en),
        ar: toText(editQuestion.ar),
      },
      options: editOptions.map((option) => ({
        fr: toText(option.fr),
        en: toText(option.en),
        ar: toText(option.ar),
      })),
      correctIndex,
    };

    setEditError("");
    fetcher.submit(
      {
        intent: "update-question",
        questionId: payload.questionId,
        question: JSON.stringify(payload.question),
        options: JSON.stringify(payload.options),
        correctIndex: String(payload.correctIndex),
      },
      { method: "post" }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/dashboard/quizzes" className="hover:text-blue-600 transition-colors">
          Gestion des Quiz
        </Link>
        <span>/</span>
        <Link to="/dashboard/quizzes/management" className="hover:text-blue-600 transition-colors">
          Management 7P
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium font-inter">{quizModule?.name}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-inter">
              {quizModule?.name || "Unnamed module"}
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-inter">
              Browse questions with multilingual content and answer choices.
            </p>
          </div>

          <div className="w-full lg:w-96">
            <label htmlFor="question-search" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 font-inter">
              Search in questions
            </label>
            <input
              id="question-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search FR / EN / AR text..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {languageButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={() => setLanguageView(button.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  languageView === button.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-700"
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={allDisplayedSelected}
                onChange={(event) => toggleDisplayedSelection(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              Select displayed
            </label>

            <button
              type="button"
              onClick={openAddModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Add quiz
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedQuestionIds.length === 0 || isDeleting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : `Delete selected (${selectedQuestionIds.length})`}
            </button>
          </div>
        </div>

        {feedbackMessage && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 font-inter">
            {feedbackMessage}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-700 uppercase tracking-wide font-bold font-inter">Total questions</p>
            <p className="text-2xl font-black text-blue-700 mt-1 font-inter">{questions.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-700 uppercase tracking-wide font-bold font-inter">Displayed</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-inter">{filteredQuestions.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold font-inter">Module slug</p>
            <p className="text-sm font-bold text-gray-800 mt-1 font-inter">{quizModule?.slug || "-"}</p>
          </div>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
            ?
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-1 font-inter">No questions match your search</h3>
          <p className="text-gray-500 font-inter">Try another keyword in French, English, or Arabic.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredQuestions.map((question, index) => {
            const options = Array.isArray(question.options) ? question.options : [];
            const currentQuestionId = String(question._id);
            const isExpanded = expandedQuestionId === currentQuestionId;
            const isSelected = selectedQuestionIds.includes(currentQuestionId);

            const summaryText =
              languageView === "all"
                ? toText(question.question?.fr) || toText(question.question?.en) || toText(question.question?.ar)
                : getLocalizedText(question.question, languageView);

            return (
              <article
                key={currentQuestionId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => toggleSingleSelection(currentQuestionId, event.target.checked)}
                      aria-label={`Select question ${Number.isInteger(question.order) ? Number(question.order) + 1 : index + 1}`}
                      title="Select question"
                      className="h-4 w-4 accent-blue-600"
                    />

                    <button
                      type="button"
                      onClick={() => toggleQuestion(currentQuestionId)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-bold text-white font-inter">
                        Q{Number.isInteger(question.order) ? Number(question.order) + 1 : index + 1}
                      </div>
                      <p className="text-sm text-gray-700 font-medium font-inter truncate">{summaryText || "-"}</p>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(question)}
                      className="px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100"
                    >
                      Edit
                    </button>
                    <span className="text-xs text-blue-600 font-bold font-inter">{isExpanded ? "Hide" : "Show"}</span>
                  </div>
                </div>

                {isExpanded && <div className="p-6 space-y-5">
                  <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 font-inter">Question text</h3>
                    {languageView === "all" ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1">FR</p>
                          <p className="text-sm text-gray-900 font-inter">{question.question?.fr || "-"}</p>
                        </div>
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                          <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1">EN</p>
                          <p className="text-sm text-gray-900 font-inter">{question.question?.en || "-"}</p>
                        </div>
                        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                          <p className="text-[11px] font-bold text-cyan-700 uppercase tracking-wide mb-1">AR</p>
                          <p className="text-sm text-gray-900 font-inter">{question.question?.ar || "-"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1">{languageView.toUpperCase()}</p>
                        <p className="text-sm text-gray-900 font-inter">
                          {getLocalizedText(question.question, languageView) || "-"}
                        </p>
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 font-inter">Possible answers</h3>
                    <div className="space-y-3">
                      {options.map((option, optionIndex) => {
                        const optionIsCorrect = isOptionCorrect(option, question.correct);
                        return (
                          <div
                            key={`${String(question._id)}-option-${optionIndex}`}
                            className={`rounded-xl border p-3 ${
                              optionIsCorrect
                                ? "border-green-200 bg-green-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide font-inter">
                                Option {optionIndex + 1}
                              </span>
                              {optionIsCorrect && (
                                <span className="text-[11px] px-2 py-1 rounded-full border border-green-200 bg-white text-green-700 font-semibold font-inter">
                                  Correct answer
                                </span>
                              )}
                            </div>

                            {languageView === "all" ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <p className="text-sm text-gray-900 font-inter"><span className="text-[11px] font-bold text-gray-500 mr-1">FR:</span>{option?.fr || "-"}</p>
                                <p className="text-sm text-gray-900 font-inter"><span className="text-[11px] font-bold text-gray-500 mr-1">EN:</span>{option?.en || "-"}</p>
                                <p className="text-sm text-gray-900 font-inter"><span className="text-[11px] font-bold text-gray-500 mr-1">AR:</span>{option?.ar || "-"}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-900 font-inter">
                                {getLocalizedText(option, languageView) || "-"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>}
              </article>
            );
          })}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto">
          <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-inter">Add quiz question</h2>
                <p className="text-sm text-gray-500 font-inter">Type options once, then select which one is correct.</p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleDraftSubmit} className="p-6 space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 font-inter">Question (3 languages)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={draftQuestion.fr || ""}
                    onChange={(event) => setDraftQuestion((current) => ({ ...current, fr: event.target.value }))}
                    placeholder="Question FR"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={draftQuestion.en || ""}
                    onChange={(event) => setDraftQuestion((current) => ({ ...current, en: event.target.value }))}
                    placeholder="Question EN"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={draftQuestion.ar || ""}
                    onChange={(event) => setDraftQuestion((current) => ({ ...current, ar: event.target.value }))}
                    placeholder="Question AR"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 font-inter">Options (multi)</h3>
                <p className="text-xs text-gray-500 font-inter">Select the correct option inside the list below.</p>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 font-inter">Options list</h3>
                  <button
                    type="button"
                    onClick={addDraftOption}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"
                  >
                    Add option
                  </button>
                </div>

                <div className="space-y-3">
                  {draftOptions.map((option, index) => (
                    <div key={option.id} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Option {index + 1}</p>
                          <label className="inline-flex items-center gap-2 rounded border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
                            <input
                              type="radio"
                              name="draft-correct-option"
                              checked={draftCorrectOptionId === option.id}
                              onChange={() => setDraftCorrectOptionId(option.id)}
                              className="h-3.5 w-3.5 accent-green-600"
                              aria-label={`Mark option ${index + 1} as correct`}
                            />
                            Correct
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDraftOption(option.id)}
                          className="px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 text-xs font-semibold disabled:opacity-50"
                          disabled={draftOptions.length <= 1}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={option.fr}
                          onChange={(event) => updateDraftOption(option.id, "fr", event.target.value)}
                          placeholder="Option FR"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                        />
                        <input
                          type="text"
                          value={option.en}
                          onChange={(event) => updateDraftOption(option.id, "en", event.target.value)}
                          placeholder="Option EN"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                        />
                        <input
                          type="text"
                          value={option.ar}
                          onChange={(event) => updateDraftOption(option.id, "ar", event.target.value)}
                          placeholder="Option AR"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {draftError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {draftError}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
                >
                  {isAdding ? "Adding..." : "Add question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto">
          <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-inter">Edit quiz question</h2>
                <p className="text-sm text-gray-500 font-inter">Update question and options, then choose the correct option directly from the list.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 font-inter">Question (3 languages)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={editQuestion.fr || ""}
                    onChange={(event) => setEditQuestion((current) => ({ ...current, fr: event.target.value }))}
                    placeholder="Question FR"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={editQuestion.en || ""}
                    onChange={(event) => setEditQuestion((current) => ({ ...current, en: event.target.value }))}
                    placeholder="Question EN"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={editQuestion.ar || ""}
                    onChange={(event) => setEditQuestion((current) => ({ ...current, ar: event.target.value }))}
                    placeholder="Question AR"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 font-inter">Options (multi)</h3>
                <p className="text-xs text-gray-500 font-inter">Select the correct option inside the list below.</p>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 font-inter">Options list</h3>
                  <button
                    type="button"
                    onClick={addEditOption}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"
                  >
                    Add option
                  </button>
                </div>

                <div className="space-y-3">
                  {editOptions.map((option, index) => (
                    <div key={option.id} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Option {index + 1}</p>
                          <label className="inline-flex items-center gap-2 rounded border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
                            <input
                              type="radio"
                              name="edit-correct-option"
                              checked={editCorrectOptionId === option.id}
                              onChange={() => setEditCorrectOptionId(option.id)}
                              className="h-3.5 w-3.5 accent-green-600"
                              aria-label={`Mark option ${index + 1} as correct`}
                            />
                            Correct
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEditOption(option.id)}
                          className="px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 text-xs font-semibold disabled:opacity-50"
                          disabled={editOptions.length <= 1}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={option.fr}
                          onChange={(event) => updateEditOption(option.id, "fr", event.target.value)}
                          placeholder="Option FR"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                        />
                        <input
                          type="text"
                          value={option.en}
                          onChange={(event) => updateEditOption(option.id, "en", event.target.value)}
                          placeholder="Option EN"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                        />
                        <input
                          type="text"
                          value={option.ar}
                          onChange={(event) => updateEditOption(option.id, "ar", event.target.value)}
                          placeholder="Option AR"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
