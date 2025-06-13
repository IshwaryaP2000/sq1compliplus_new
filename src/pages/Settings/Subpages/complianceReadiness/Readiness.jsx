import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getApi, postApi } from "../../../../services/apiService";
import usePageTitle from "../../../../utils/usePageTitle";
import { toast } from "react-toastify";
import { LeftarrowIcon, RightarrowIcon } from "../../../../components/Icons/Icons";

const Readiness = () => {
  usePageTitle("Readiness");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [mainQuestionNumber, setMainQuestionNumber] = useState(1);
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSurveyFinished, setIsSurveyFinished] = useState(false);
  const [unsavedAnswers, setUnsavedAnswers] = useState({});
  const [questionsData, setQuestionsData] = useState({ questions: {} });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isFetchingNextSection, setIsFetchingNextSection] = useState(false);
  const [isSubQuestionLoading, setIsSubQuestionLoading] = useState(false);
  const [mainQuestionAnswers, setMainQuestionAnswers] = useState({});
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [readinessStatus, setReadinessStatus] = useState(null);
  const [sectionsCache, setSectionsCache] = useState({});
  const [isNextSectionAvailable, setIsNextSectionAvailable] = useState(true);
  const [isLastSubQuestionModified, setIsLastSubQuestionModified] =
    useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [subQuestion, setSubQuestion] = useState({ key: { answer: [] } });
  const isChangingSections = useRef(false);
  const savedAnswersRef = useRef(new Set());
  const navigate = useNavigate();
  const originalSubQuestionRef = useRef({});
  const userEditedAnswersRef = useRef({});
  const previousAnswersRef = useRef({});

  useEffect(() => {
    const currentSubQuestionKey = Object.keys(subQuestion)[currentStep];
    if (currentSubQuestionKey && subQuestion[currentSubQuestionKey]) {
      const question = subQuestion[currentSubQuestionKey];
      if (
        question.field_type === "tools" &&
        question.answer &&
        !selectedAnswers // Only set if selectedAnswers is not already set
      ) {
        // If the answer is "skip" and readinessStatus is "yes", do not prefill
        if (readinessStatus === "yes" && question.answer === "skip") {
          setSelectedAnswers(""); // Ensure dropdown defaults to "Select an option"
          setSubQuestion((prev) => ({
            ...prev,
            [currentSubQuestionKey]: {
              ...prev[currentSubQuestionKey],
              answer: "", // Reset answer to empty to avoid pre-filling
            },
          }));
        } else {
          // Handle other cases (e.g., "self", "others") as before
          setSelectedAnswers(question.answer);
          originalSubQuestionRef.current[currentSubQuestionKey] = {
            answer: question.answer,
            evidence: question.evidence,
          };
          if (question.answer === "others" && question.evidence) {
            setSubQuestion((prev) => ({
              ...prev,
              [currentSubQuestionKey]: {
                ...prev[currentSubQuestionKey],
                answer: question.evidence,
              },
            }));
          } else {
            setSubQuestion((prev) => ({
              ...prev,
              [currentSubQuestionKey]: {
                ...prev[currentSubQuestionKey],
                answer: question.answer,
              },
            }));
          }
        }
      }
    }
  }, [subQuestion, currentStep, selectedAnswers, readinessStatus]);

  useEffect(() => {
    fetchReadinessStatus();
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (!isFetchingNextSection && !dataLoaded && !isChangingSections.current) {
      fetchQuestions(currentSection + 1);
    }
    isChangingSections.current = false;
  }, [isFetchingNextSection]);

  const saveAnswer = async ({
    organization_id,
    question_type,
    question_id,
    answer,
    evidence = null,
    other_tool_name = null,
  }) => {
    if (
      savedAnswersRef.current.has(`${question_type}-${question_id}-${answer}`)
    )
      return;

    try {
      const payload = {
        organization_id,
        question_type,
        question_id,
        answer: Array.isArray(answer) ? answer.join(", ") : answer,
      };
      if (evidence) payload.evidence = evidence;
      if (other_tool_name) payload.other_tool_name = other_tool_name;

      toast.dismiss();
      const response = await postApi("/save-answer", payload);
      if (response.data.success) {
        savedAnswersRef.current.add(
          `${question_type}-${question_id}-${answer}`
        );
        previousAnswersRef.current[`${question_type}-${question_id}`] = answer;
      } else {
        console.error("Failed to save answer:", response.data.message);
      }
    } catch (error) {
      toast.error("Error saving answer. Please try again.");
      console.error("Error saving answer:", error);
    }
  };

  const hasAnswerChanged = (question_type, question_id, newAnswer) => {
    const previousAnswer =
      previousAnswersRef.current[`${question_type}-${question_id}`];
    return previousAnswer !== newAnswer || previousAnswer === undefined;
  };

  const handleViewAnswers = () => {
    navigate("/settings/readiness-answers");
  };

  const countSubQuestions = (subQs) => {
    if (!subQs || typeof subQs !== "object") return 0;
    let count = 0;
    for (const key in subQs) {
      count++;
      if (subQs[key].sub_questions) {
        count += countSubQuestions(subQs[key].sub_questions.yes);
        count += countSubQuestions(subQs[key].sub_questions.no);
      }
    }
    return count;
  };

  const getQuestionCounts = () => {
    if (!questionsData?.questions) return { mainCount: 0, subCount: 0 };
    const mainCount = Object.keys(questionsData.questions).length;
    let subCount = 0;
    if (currentQuestion && currentQuestion.sub_question) {
      subCount += countSubQuestions(currentQuestion.sub_question.yes);
      subCount += countSubQuestions(currentQuestion.sub_question.no);
    }
    return { mainCount, subCount };
  };

  const { mainCount, subCount } = getQuestionCounts();

  const isNextDisabled = () => {
    if (readinessStatus === "yes") return false;
    const subQuestionKeys = Object.keys(subQuestion);
    if (!subQuestionKeys.length || currentStep >= subQuestionKeys.length)
      return true;

    const currentSubQuestionKey = subQuestionKeys[currentStep];
    const currentSubQuestion = subQuestion[currentSubQuestionKey];
    if (!currentSubQuestion || !currentSubQuestion.field_type) return true;

    const unsavedAnswer = unsavedAnswers[currentSubQuestionKey];
    const savedAnswer = currentSubQuestion.answer;

    switch (currentSubQuestion.field_type) {
      case "file":
        return !(
          unsavedAnswer instanceof File ||
          (savedAnswer && savedAnswer !== "skip")
        );
      case "dropdown":
      case "tools":
        if (selectedAnswers === "others") {
          return !savedAnswer || savedAnswer.trim() === "";
        } else if (selectedAnswers === "self") {
          return false;
        }
        return !selectedAnswers && (!savedAnswer || savedAnswer === "skip");
      case "radio":
      case "radio_with_sub_action":
        return !savedAnswer && !unsavedAnswer;
      case "checkbox":
        return (
          (!savedAnswer || savedAnswer.length === 0) &&
          (!unsavedAnswer || unsavedAnswer.length === 0)
        );
      case "text":
        return !savedAnswer || savedAnswer.trim() === "";
      default:
        return true;
    }
  };

  const loadNestedSubQuestions = (subQs) => {
    let updatedSubQs = { ...subQs };
    Object.keys(updatedSubQs).forEach((key) => {
      const subQ = updatedSubQs[key];
      if (
        subQ.field_type === "radio_with_sub_action" &&
        subQ.answer &&
        subQ.sub_questions?.[subQ.answer.toLowerCase()]
      ) {
        const nestedSubQs = subQ.sub_questions[subQ.answer.toLowerCase()];
        updatedSubQs = { ...updatedSubQs, ...nestedSubQs };
      }
    });
    return updatedSubQs;
  };

  const fetchQuestions = async (sectionNo = currentSection + 1) => {
    if (
      questionsData &&
      Object.keys(sectionsCache).length > 0 &&
      sectionsCache[sectionNo]
    ) {
      const cachedData = sectionsCache[sectionNo];
      setQuestionsData(cachedData);
      setTotalQuestions(cachedData.total_questions);
      setQuestionNumber(cachedData.question_no);

      const questionKeys = Object.keys(cachedData.questions);
      let foundNull = false;

      for (let i = 0; i < questionKeys.length; i++) {
        const questionKey = questionKeys[i];
        const question = cachedData.questions[questionKey];
        const mainAnswer =
          question.answer || mainQuestionAnswers[questionKey] || null;

        if (mainAnswer === null) {
          setCurrentQuestion({ ...question, question_no: Number(questionKey) });
          setCurrentQuestionIndex(i);
          setSelectedAnswer(null);
          setSubQuestion({});
          setCurrentStep(0);
          foundNull = true;
          break;
        }

        if (
          mainAnswer &&
          question.sub_question &&
          question.sub_question[mainAnswer.toLowerCase()]
        ) {
          let subQs = question.sub_question[mainAnswer.toLowerCase()];
          const subQuestionKeys = Object.keys(subQs);

          if (readinessStatus === "yes") {
            subQs = loadNestedSubQuestions(subQs);
          }

          for (let j = 0; j < subQuestionKeys.length; j++) {
            const subKey = subQuestionKeys[j];
            if (subQs[subKey].answer === null) {
              setCurrentQuestion({
                ...question,
                question_no: Number(questionKey),
              });
              setCurrentQuestionIndex(i);
              setSelectedAnswer(mainAnswer);
              setSubQuestion(subQs);
              setCurrentStep(j);
              foundNull = true;
              break;
            }
          }
          if (foundNull) break;

          if (readinessStatus === "yes") {
            setCurrentQuestion({
              ...question,
              question_no: Number(questionKey),
            });
            setCurrentQuestionIndex(i);
            setSelectedAnswer(mainAnswer);
            setSubQuestion(subQs);
            setCurrentStep(0);
            foundNull = true;
            break;
          }
        }
      }

      if (!foundNull) {
        const firstQuestionKey = questionKeys[0];
        const firstQuestion = cachedData.questions[firstQuestionKey];
        setCurrentQuestion({
          ...firstQuestion,
          question_no: Number(firstQuestionKey),
        });
        setCurrentQuestionIndex(0);
        setSelectedAnswer(firstQuestion.answer || null);
        let subQs =
          firstQuestion.sub_question?.[firstQuestion.answer?.toLowerCase()] ||
          {};
        if (readinessStatus === "yes") {
          subQs = loadNestedSubQuestions(subQs);
        }
        setSubQuestion(subQs);
        setCurrentStep(0);
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getApi("/get-readiness-questions", {
        params: {
          section_no: currentSection + 1,
        },
      });

      if (response.data.success) {
        if (response.data.message === "Assessment Completed") {
          setTimeout(() => {
            setIsLoading(false);
            navigate("/dashboard");
          }, 1000);

          return;
        }

        const data = response.data.data;
        setSectionsCache((prev) => ({ ...prev, [sectionNo]: data }));
        setQuestionsData(data);
        setTotalQuestions(data.total_questions);
        setQuestionNumber(data.question_no);
        setDataLoaded(true);

        const questionKeys = Object.keys(data?.questions || {});
        let foundNull = false;

        for (let i = 0; i < questionKeys.length; i++) {
          const questionKey = questionKeys[i];
          const question = data.questions[questionKey];
          const mainAnswer =
            question.answer || mainQuestionAnswers[questionKey] || null;

          if (mainAnswer === null) {
            setCurrentQuestion({
              ...question,
              question_no: Number(questionKey),
            });
            setCurrentQuestionIndex(i);
            setSelectedAnswer(null);
            setSubQuestion({});
            setCurrentStep(0);
            foundNull = true;
            break;
          }

          if (
            mainAnswer &&
            question.sub_question &&
            question.sub_question[mainAnswer.toLowerCase()]
          ) {
            let subQs = question.sub_question[mainAnswer.toLowerCase()];
            const subQuestionKeys = Object.keys(subQs);

            if (readinessStatus === "yes") {
              subQs = loadNestedSubQuestions(subQs);
            }

            for (let j = 0; j < subQuestionKeys.length; j++) {
              const subKey = subQuestionKeys[j];
              if (subQs[subKey].answer === null) {
                setCurrentQuestion({
                  ...question,
                  question_no: Number(questionKey),
                });
                setCurrentQuestionIndex(i);
                setSelectedAnswer(mainAnswer);
                setSubQuestion(subQs);
                setCurrentStep(j);
                foundNull = true;
                break;
              }
            }
            if (foundNull) break;

            if (readinessStatus === "yes") {
              setCurrentQuestion({
                ...question,
                question_no: Number(questionKey),
              });
              setCurrentQuestionIndex(i);
              setSelectedAnswer(mainAnswer);
              setSubQuestion(subQs);
              setCurrentStep(0);
              foundNull = true;
              break;
            }
          }
        }

        if (!foundNull && data?.questions) {
          const firstQuestionKey = questionKeys[0];
          const firstQuestion = data.questions[firstQuestionKey];
          setCurrentQuestion({
            ...firstQuestion,
            question_no: Number(firstQuestionKey),
          });
          setCurrentQuestionIndex(0);
          setSelectedAnswer(firstQuestion.answer || null);
          let subQs =
            firstQuestion.sub_question?.[firstQuestion.answer?.toLowerCase()] ||
            {};
          if (readinessStatus === "yes") {
            subQs = loadNestedSubQuestions(subQs);
          }
          setSubQuestion(subQs);
          setCurrentStep(0);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePreviousSection = async () => {
    if (currentSection > 0) {
      const previousSection = currentSection - 1;
      setIsNextSectionAvailable(true);
      const firstQuestionId = Object.keys(questionsData.questions)[0];

      try {
        const response = await getApi("/get-readiness-questions", {
          params: { question_id: firstQuestionId, action: "previous" },
        });

        if (response.data.success) {
          if (response.data.message === "No Previous Section") {
            return;
          }

          const data = response.data.data;
          setCurrentSection((prev) => prev - 1);
          setQuestionsData(data);
          const questionKeys = Object.keys(data.questions);

          for (let i = 0; i < questionKeys.length; i++) {
            const questionKey = questionKeys[i];
            const question = data.questions[questionKey];
            const mainAnswer =
              question.answer || mainQuestionAnswers[questionKey] || null;

            if (mainAnswer) setSelectedAnswer(mainAnswer);
            setCurrentQuestion({
              ...question,
              question_no: Number(questionKey),
            });
            setCurrentQuestionIndex(i);
            if (selectedAnswer) {
              const firstQuestionKey = questionKeys[0];
              const firstQuestion = data.questions[firstQuestionKey];
              setCurrentQuestionIndex(0);
              let subQs =
                firstQuestion.sub_question?.[
                  firstQuestion.answer?.toLowerCase()
                ] || {};
              if (readinessStatus === "yes") {
                subQs = loadNestedSubQuestions(subQs);
              }
              setSubQuestion(subQs);
            }
          }

          const firstQuestionKey = questionKeys[0];
          const firstQuestion = data.questions[firstQuestionKey];
          setCurrentQuestion({
            ...firstQuestion,
            question_no: Number(firstQuestionKey),
          });
          setCurrentStep(0);
          setSelectedAnswer(firstQuestion.answer || null);
        }
      } catch (error) {
        console.error("Error fetching previous section:", error);
      }
    } else {
    }
  };

  const handleNextSection = async () => {
    const questionKeys = Object.keys(questionsData?.questions || {});
    const lastQuestionId = questionKeys[questionKeys.length - 1];

    const currentSubQuestionKey = Object.keys(subQuestion)[currentStep];
    if (currentSubQuestionKey) {
      const currentSubQuestion = subQuestion[currentSubQuestionKey];

      if (
        (currentSubQuestion?.field_type === "radio" ||
          currentSubQuestion?.field_type === "radio_with_sub_action") &&
        currentSubQuestion?.answer &&
        hasAnswerChanged(
          "sub",
          currentSubQuestionKey,
          currentSubQuestion.answer
        )
      ) {
        await saveAnswer({
          question_type: "sub",
          question_id: currentSubQuestionKey,
          answer: currentSubQuestion.answer,
        });
      } else if (
        currentSubQuestion?.field_type === "checkbox" &&
        currentSubQuestion?.answer &&
        hasAnswerChanged(
          "sub",
          currentSubQuestionKey,
          currentSubQuestion.answer
        )
      ) {
        await saveAnswer({
          question_type: "sub",
          question_id: currentSubQuestionKey,
          answer: currentSubQuestion.answer,
        });
      } else if (
        currentSubQuestion?.field_type === "tools" &&
        selectedAnswers === "others" &&
        currentSubQuestion?.answer &&
        hasAnswerChanged("sub", currentSubQuestionKey, "others")
      ) {
        await saveAnswer({
          question_type: "sub",
          question_id: currentSubQuestionKey,
          answer: "others",
          other_tool_name: currentSubQuestion.answer,
        });
      } else if (
        currentSubQuestion?.field_type === "tools" &&
        selectedAnswers === "self"
      ) {
        if (unsavedAnswers[currentSubQuestionKey] instanceof File) {
          const file = unsavedAnswers[currentSubQuestionKey];
          const formData = new FormData();
          formData.append("question_type", "sub");
          formData.append("question_id", currentSubQuestionKey);
          formData.append("answer", "self");
          formData.append("evidence", file);
          await postApi("/save-answer", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await saveAnswer({
            question_type: "sub",
            question_id: currentSubQuestionKey,
            answer: "self",
          });
        }
      } else if (
        currentSubQuestion?.field_type === "file" &&
        unsavedAnswers[currentSubQuestionKey] instanceof File
      ) {
        const file = unsavedAnswers[currentSubQuestionKey];
        const formData = new FormData();
        formData.append("question_type", "sub");
        formData.append("question_id", currentSubQuestionKey);
        formData.append("answer", "file");
        formData.append("evidence", file);
        await postApi("/save-answer", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (
        selectedAnswers &&
        selectedAnswers !== "others" &&
        selectedAnswers !== "self" &&
        hasAnswerChanged("sub", currentSubQuestionKey, selectedAnswers)
      ) {
        await saveAnswer({
          question_type: "sub",
          question_id: currentSubQuestionKey,
          answer: selectedAnswers,
        });
      }

      setUnsavedAnswers({});
    }

    try {
      const response = await getApi("/get-readiness-questions", {
        params: { question_id: lastQuestionId, action: "next" },
      });

      if (response.data.success) {
        if (response.data.message === "No Next Section") {
          setIsNextSectionAvailable(false);
          return;
        }

        setCurrentSection((prev) => prev + 1);
        setQuestionsData(response.data.data);
        setIsNextSectionAvailable(true);

        const questionKeys = Object.keys(response.data.data.questions || {});
        let foundNull = false;

        for (let i = 0; i < questionKeys.length; i++) {
          const questionKey = questionKeys[i];
          const question = response.data.data.questions[questionKey];
          const mainAnswer =
            question.answer || mainQuestionAnswers[questionKey] || null;

          if (mainAnswer) setSelectedAnswer(mainAnswer);
          setCurrentQuestion({ ...question, question_no: Number(questionKey) });
          setCurrentQuestionIndex(i);
          if (mainAnswer && question.sub_question?.[mainAnswer.toLowerCase()]) {
            let subQs = question.sub_question[mainAnswer.toLowerCase()];
            if (readinessStatus === "yes") {
              subQs = loadNestedSubQuestions(subQs);
            }
            setSubQuestion(subQs);
            setCurrentStep(0);
          } else {
            setSubQuestion({});
            setCurrentStep(0);
          }
          foundNull = true;
          break;
        }

        if (!foundNull) {
          const firstQuestionKey = questionKeys[0];
          const firstQuestion = response.data.data.questions[firstQuestionKey];
          setCurrentQuestion({
            ...firstQuestion,
            question_no: Number(firstQuestionKey),
          });
          setCurrentQuestionIndex(0);
          setSelectedAnswer(firstQuestion.answer || null);
          let subQs =
            firstQuestion.sub_question?.[firstQuestion.answer?.toLowerCase()] ||
            {};
          if (readinessStatus === "yes") {
            subQs = loadNestedSubQuestions(subQs);
          }
          setSubQuestion(subQs);
          setCurrentStep(0);
        }
      }
    } catch (error) {
      console.error("Error fetching next section:", error);
    }
  };

  const isFirstQuestion = () => currentQuestionIndex === 0;
  const isLastQuestion = () => {
    const questionKeys = Object.keys(questionsData.questions);
    return currentQuestionIndex === questionKeys.length - 1;
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    } else {
      handlePreviousQuestion();
    }
  };

  const handlePreviousQuestion = () => {
    const questionKeys = Object.keys(questionsData.questions);
    if (currentQuestionIndex > 0) {
      const previousQuestionKey = questionKeys[currentQuestionIndex - 1];
      const previousQuestion = questionsData.questions[previousQuestionKey];
      const questionId = Number(previousQuestionKey);

      setCurrentQuestion({ ...previousQuestion, question_no: questionId });
      const previousAnswer =
        mainQuestionAnswers[questionId] || previousQuestion.answer || "No";
      setSelectedAnswer(previousAnswer);

      if (
        previousQuestion.sub_question &&
        previousQuestion.sub_question[previousAnswer.toLowerCase()]
      ) {
        let subQs = previousQuestion.sub_question[previousAnswer.toLowerCase()];
        if (readinessStatus === "yes") {
          subQs = loadNestedSubQuestions(subQs);
        }
        if (Object.keys(subQs).length > 0) {
          setSubQuestion(subQs);
          setCurrentStep(Object.keys(subQs).length - 1);
        } else {
          setSubQuestion({});
          setCurrentStep(0);
        }
      } else {
        setSubQuestion({});
        setCurrentStep(0);
      }
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNextStep = async () => {
    const currentSubQuestionKey = Object.keys(subQuestion)[currentStep];
    let answerToSave = null;

    if (currentSubQuestionKey) {
      const currentSubQuestion = subQuestion[currentSubQuestionKey];
      answerToSave =
        currentSubQuestion?.answer ||
        unsavedAnswers[currentSubQuestionKey] ||
        selectedAnswers;

      if (
        answerToSave ||
        (currentSubQuestion.field_type === "tools" &&
          selectedAnswers === "self")
      ) {
        try {
          if (
            (currentSubQuestion.field_type === "radio" ||
              currentSubQuestion.field_type === "radio_with_sub_action") &&
            hasAnswerChanged("sub", currentSubQuestionKey, answerToSave)
          ) {
            await saveAnswer({
              question_type: "sub",
              question_id: currentSubQuestionKey,
              answer: answerToSave,
            });
          } else if (
            currentSubQuestion.field_type === "checkbox" &&
            hasAnswerChanged("sub", currentSubQuestionKey, answerToSave)
          ) {
            await saveAnswer({
              question_type: "sub",
              question_id: currentSubQuestionKey,
              answer: answerToSave,
            });
          } else if (
            currentSubQuestion.field_type === "tools" &&
            selectedAnswers === "others" &&
            hasAnswerChanged("sub", currentSubQuestionKey, "others")
          ) {
            await saveAnswer({
              question_type: "sub",
              question_id: currentSubQuestionKey,
              answer: "others",
              other_tool_name: answerToSave,
            });
          } else if (
            currentSubQuestion.field_type === "tools" &&
            selectedAnswers === "self"
          ) {
            if (unsavedAnswers[currentSubQuestionKey] instanceof File) {
              const file = unsavedAnswers[currentSubQuestionKey];
              const formData = new FormData();
              formData.append("question_type", "sub");
              formData.append("question_id", currentSubQuestionKey);
              formData.append("answer", "self");
              formData.append("evidence", file);
              await postApi("/save-answer", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            } else {
              await saveAnswer({
                question_type: "sub",
                question_id: currentSubQuestionKey,
                answer: "self",
              });
            }
          } else if (
            currentSubQuestion.field_type === "file" &&
            unsavedAnswers[currentSubQuestionKey] instanceof File
          ) {
            const file = unsavedAnswers[currentSubQuestionKey];
            const formData = new FormData();
            formData.append("question_type", "sub");
            formData.append("question_id", currentSubQuestionKey);
            formData.append("answer", "file");
            formData.append("evidence", file);
            await postApi("/save-answer", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } else if (
            selectedAnswers &&
            selectedAnswers !== "others" &&
            selectedAnswers !== "self" &&
            hasAnswerChanged("sub", currentSubQuestionKey, selectedAnswers)
          ) {
            await saveAnswer({
              question_type: "sub",
              question_id: currentSubQuestionKey,
              answer: selectedAnswers,
            });
          }
        } catch (error) {
          console.error("Error saving sub-question:", error);
          return; 
        }
      }
    }

    setUnsavedAnswers({});

    // Always move forward after a successful save
    if (currentStep < Object.keys(subQuestion).length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
      setSelectedAnswers("");
      setIsLastSubQuestionModified(false);
    } else {
      if (currentSubQuestionKey) {
        const currentSubQuestion = subQuestion[currentSubQuestionKey];
        if (
          answerToSave ||
          (currentSubQuestion.field_type === "tools" &&
            selectedAnswers === "self")
        ) {
          try {
            if (
              hasAnswerChanged("sub", currentSubQuestionKey, answerToSave) ||
              unsavedAnswers[currentSubQuestionKey] ||
              (currentSubQuestion.field_type === "tools" &&
                selectedAnswers === "self")
            ) {
              if (
                currentSubQuestion.field_type === "file" ||
                (currentSubQuestion.field_type === "tools" &&
                  selectedAnswers === "self" &&
                  unsavedAnswers[currentSubQuestionKey] instanceof File)
              ) {
                const file = unsavedAnswers[currentSubQuestionKey];
                const formData = new FormData();
                formData.append("question_type", "sub");
                formData.append("question_id", currentSubQuestionKey);
                formData.append(
                  "answer",
                  currentSubQuestion.field_type === "file" ? "file" : "self"
                );
                formData.append("evidence", file);
                await postApi("/save-answer", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
              } else if (
                currentSubQuestion.field_type === "tools" &&
                selectedAnswers === "others"
              ) {
                await saveAnswer({
                  question_type: "sub",
                  question_id: currentSubQuestionKey,
                  answer: "others",
                  other_tool_name: answerToSave,
                });
              } else if (
                currentSubQuestion.field_type === "tools" &&
                selectedAnswers === "self"
              ) {
                await saveAnswer({
                  question_type: "sub",
                  question_id: currentSubQuestionKey,
                  answer: "self",
                });
              } else {
                await saveAnswer({
                  question_type: "sub",
                  question_id: currentSubQuestionKey,
                  answer: answerToSave || selectedAnswers,
                });
              }
            }
          } catch (error) {
            console.error("Error saving last sub-question:", error);
            return; // Prevent navigation if save fails
          }
        }
      }

      // Simplified navigation logic
      if (readinessStatus === "yes" && isLastQuestion()) {
        if (isNextSectionAvailable) {
          await handleNextSection();
        } else {
          setIsLastSubQuestionModified(false);
        }
      } else {
        await moveToNextQuestion();
      }
    }
  };

  const handleInputChange = (key, value) => {
    setSubQuestion((prev) => ({
      ...prev,
      [key]: { ...prev[key], answer: value },
    }));
    setUnsavedAnswers((prev) => ({ ...prev, [key]: value }));
    userEditedAnswersRef.current[key] = value;
    if (
      readinessStatus === "yes" &&
      isLastQuestion() &&
      currentStep === Object.keys(subQuestion).length - 1 &&
      !isNextSectionAvailable
    ) {
      setIsLastSubQuestionModified(true);
    }
  };

  const handleFileUpload = (file, question_id) => {
    if (!file) return;
    setUnsavedAnswers((prev) => ({ ...prev, [question_id]: file }));
    setSelectedAnswers("self");
    if (
      readinessStatus === "yes" &&
      isLastQuestion() &&
      currentStep === Object.keys(subQuestion).length - 1 &&
      !isNextSectionAvailable
    ) {
      setIsLastSubQuestionModified(true);
    }
  };

  const handleBlurSave = async (key) => {
    const answer = subQuestion[key]?.answer;
    if (answer && hasAnswerChanged("sub", key, answer)) {
      await saveAnswer({
        question_type: "sub",
        question_id: key,
        answer,
      });
    }
  };

  const fetchNextSection = async () => {
    try {
      setCurrentQuestion({});
      setSubQuestion({});
      setCurrentStep(0);
      setCurrentSection((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      await fetchQuestions();
    } catch (error) {
      console.error("Error fetching the next section:", error);
    }
  };

  const fetchReadinessStatus = async () => {
    try {
      const response = await getApi("/get-readiness-status");
      if (response.data.success) {
        setReadinessStatus(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching readiness status:", error);
    }
  };

  const moveToNextQuestion = async () => {
    const subQuestionKeys = Object.keys(subQuestion);
    const lastSubQuestionKey = subQuestionKeys[subQuestionKeys.length - 1];

    if (lastSubQuestionKey) {
      const currentSubQuestion = subQuestion[lastSubQuestionKey];
      if (
        currentSubQuestion?.answer &&
        (hasAnswerChanged(
          "sub",
          lastSubQuestionKey,
          currentSubQuestion.answer
        ) ||
          unsavedAnswers[lastSubQuestionKey])
      ) {
        try {
          if (
            currentSubQuestion.field_type === "file" ||
            (currentSubQuestion.field_type === "tools" &&
              selectedAnswers === "self" &&
              unsavedAnswers[lastSubQuestionKey] instanceof File)
          ) {
            const file = unsavedAnswers[lastSubQuestionKey];
            const formData = new FormData();
            formData.append("question_type", "sub");
            formData.append("question_id", lastSubQuestionKey);
            formData.append(
              "answer",
              currentSubQuestion.field_type === "file" ? "file" : "self"
            );
            formData.append("evidence", file);
            await postApi("/save-answer", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } else {
            await saveAnswer({
              question_type: "sub",
              question_id: lastSubQuestionKey,
              answer:
                currentSubQuestion.field_type === "tools" &&
                selectedAnswers === "others"
                  ? "others"
                  : currentSubQuestion.answer,
              ...(currentSubQuestion.field_type === "tools" &&
              selectedAnswers === "others"
                ? { other_tool_name: currentSubQuestion.answer }
                : {}),
            });
          }
        } catch (error) {
          console.error("Error saving in moveToNextQuestion:", error);
          return; // Prevent navigation if save fails
        }
      }

      setUnsavedAnswers((prev) => {
        const updated = { ...prev };
        delete updated[lastSubQuestionKey];
        return updated;
      });
    }

    const questionKeys = Object.keys(questionsData.questions);
    if (currentQuestionIndex < questionKeys.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      const nextQuestion =
        questionsData.questions[questionKeys[currentQuestionIndex + 1]];
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(nextQuestion.answer || null);
      let subQs =
        nextQuestion.sub_question?.[nextQuestion.answer?.toLowerCase()] || {};
      if (readinessStatus === "yes" && subQs) {
        subQs = loadNestedSubQuestions(subQs);
      }
      setSubQuestion(subQs);
      setCurrentStep(0);
      setSelectedAnswers("");
    } else {
      if (!isFetchingNextSection) {
        setIsFetchingNextSection(true);
        await fetchNextSection().finally(() =>
          setTimeout(() => setIsFetchingNextSection(false), 500)
        );
      }
    }
  };

  const handleButtonClick = async (answer) => {
    if (!currentQuestion) return;

    const questionId =
      currentQuestion.id ||
      Object.keys(questionsData.questions)[currentQuestionIndex];
    const previousAnswer =
      mainQuestionAnswers[questionId] || currentQuestion.answer;

    if (previousAnswer === answer) {
      const subQs = currentQuestion.sub_question?.[answer.toLowerCase()];
      if (subQs && Object.keys(subQuestion).length > 0) {
        return;
      } else {
        if (readinessStatus === "yes" && isLastQuestion()) {
          await handleNextSection();
        } else {
          await moveToNextQuestion();
        }
        return;
      }
    }

    setSelectedAnswer(answer);

    try {
      if (hasAnswerChanged("main", questionId, answer)) {
        setIsSubQuestionLoading(true);
        await saveAnswer({
          question_type: "main",
          question_id: questionId,
          answer,
        });
        await fetchStatistics();
      }

      setMainQuestionAnswers((prev) => ({ ...prev, [questionId]: answer }));

      const subQs = currentQuestion.sub_question?.[answer.toLowerCase()];
      if (subQs && Object.keys(subQs).length > 0) {
        let updatedSubQs = subQs;
        if (readinessStatus === "yes") {
          updatedSubQs = loadNestedSubQuestions(subQs);
        }
        setSubQuestion(updatedSubQs);
        setCurrentStep(0);
      } else {
        setSubQuestion({});
        setCurrentStep(0);
        if (readinessStatus === "yes" && isLastQuestion()) {
          await handleNextSection();
        } else {
          await moveToNextQuestion();
        }
      }
    } catch (error) {
      console.error("Error saving answer or fetching sub-questions:", error);
    } finally {
      setIsSubQuestionLoading(false);
    }
  };

  const handleSkipMainQuestion = async () => {
    if (currentQuestion) {
      const questionId =
        currentQuestion.id ||
        Object.keys(questionsData.questions)[currentQuestionIndex];
      await saveAnswer({
        question_type: "main",
        question_id: questionId,
        answer: "skip",
      });
      await fetchStatistics();
      moveToNextQuestion();
    }
  };

  const handleRadioChange = (key, value) => {
    setUnsavedAnswers((prev) => ({ ...prev, [key]: value }));
    setSubQuestion((prev) => ({
      ...prev,
      [key]: { ...prev[key], answer: value },
    }));
    if (
      readinessStatus === "yes" &&
      isLastQuestion() &&
      currentStep === Object.keys(subQuestion).length - 1 &&
      !isNextSectionAvailable
    ) {
      setIsLastSubQuestionModified(true);
    }

    if (subQuestion[key]?.field_type === "radio_with_sub_action") {
      const subQs =
        subQuestion[key]?.sub_questions?.[value?.toLowerCase()] || null;
      if (subQs) {
        setSubQuestion((prev) => ({ ...prev, ...subQs }));
      }
    }
  };

  const handleCheckboxChange = (key, value, isChecked) => {
    setUnsavedAnswers((prev) => {
      const currentAnswers = prev[key] || [];
      const updatedAnswers = isChecked
        ? [...currentAnswers, value]
        : currentAnswers.filter((answer) => answer !== value);
      return { ...prev, [key]: updatedAnswers };
    });

    setSubQuestion((prev) => {
      const previousAnswers = Array.isArray(prev[key]?.answer)
        ? prev[key].answer
        : [];
      const updatedAnswers = isChecked
        ? [...previousAnswers, value]
        : previousAnswers.filter((answer) => answer !== value);
      return { ...prev, [key]: { ...prev[key], answer: updatedAnswers } };
    });

    if (
      readinessStatus === "yes" &&
      isLastQuestion() &&
      currentStep === Object.keys(subQuestion).length - 1 &&
      !isNextSectionAvailable
    ) {
      setIsLastSubQuestionModified(true);
    }
  };

  const handleSkipSubQuestion = async () => {
    const currentSubQuestionKey = Object.keys(subQuestion)[currentStep];
    if (currentSubQuestionKey) {
      await saveAnswer({
        question_type: "sub",
        question_id: currentSubQuestionKey,
        answer: "skip",
      });
    }
    if (currentStep < Object.keys(subQuestion).length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      moveToNextQuestion();
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getApi("/get-statistics-chart");
      if (response.data.success) {
        const { yes_count, no_count, skip } = response.data.data;
        setYesCount(parseInt(yes_count, 10));
        setNoCount(parseInt(no_count, 10));
        setSkipCount(parseInt(skip, 10));
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const percentage = isFinite(
    readinessStatus === "yes"
      ? ((yesCount + noCount) / totalQuestions) * 100
      : ((questionNumber - 1) / totalQuestions) * 100
  )
    ? Math.round(
        readinessStatus === "yes"
          ? ((yesCount + noCount) / totalQuestions) * 100
          : ((questionNumber - 1) / totalQuestions) * 100
      )
    : 0;

  return (
    <div>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : isSurveyFinished ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <h2>Your survey has been completed!</h2>
            <button
              className="btn btn-success mt-3"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : Object.keys(questionsData?.questions || {}).length > 0 &&
        currentQuestion ? (
        <div className="row w-100 py-4 px-5">
          <div className="col-lg-9">
            <p className="question-cont mb-1">
              <span>
                {isSurveyFinished
                  ? "All questions completed"
                  : readinessStatus === "yes"
                  ? `${
                      yesCount + noCount
                    }/${totalQuestions} Questions Completed`
                  : `${
                      questionNumber - 1
                    }/${totalQuestions} Questions Completed`}
              </span>
            </p>
            <div className="progress-bar--count">
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${percentage}%` }}
                ></div>
                <div
                  className="progress-count"
                  style={{ left: `${percentage}%` }}
                >
                  {percentage}%
                </div>
              </div>
            </div>
            <div>
              <p className="data-protect">
                Section
                {readinessStatus === "yes"
                  ? currentSection + 1
                  : questionsData?.section_no}
                : <span>{questionsData?.category || "Loading..."}</span>
              </p>
            </div>
            <div>
              <h3 className="asking-que align-content-center mb-0">
                {readinessStatus === "yes"
                  ? `${currentQuestionIndex + 1}. `
                  : `${questionNumber}. `}
                {currentQuestion?.questions || "Loading question..."}
              </h3>
              <div className="mb-3 mt-3">
                <button
                  onClick={() => handleButtonClick("Yes")}
                  className={`select--questions ${
                    selectedAnswer === "Yes" ? "select--questions-active" : ""
                  }`}
                  disabled={
                    mainQuestionAnswers[
                      currentQuestion.id ||
                        Object.keys(questionsData.questions)[
                          currentQuestionIndex
                        ]
                    ] === "Yes"
                  }
                >
                  Yes
                </button>
                <button
                  onClick={() => handleButtonClick("No")}
                  className={`select--questions ${
                    selectedAnswer === "No" ? "select--questions-active" : ""
                  }`}
                  disabled={
                    mainQuestionAnswers[
                      currentQuestion.id ||
                        Object.keys(questionsData.questions)[
                          currentQuestionIndex
                        ]
                    ] === "No"
                  }
                >
                  No
                </button>
                {readinessStatus !== "yes" && (
                  <button
                    onClick={handleSkipMainQuestion}
                    className={`select--questions ${
                      selectedAnswer === "Skip"
                        ? "select--questions-active"
                        : ""
                    }`}
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>

            {Object.keys(subQuestion).length > 0 && (
              <form>
                {isSubQuestionLoading ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-success" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="step-container">
                    {Object.keys(subQuestion)
                      .slice(currentStep, currentStep + 1)
                      .map((key) => {
                        const question = subQuestion[key];
                        return (
                          <div key={key} className="question-item">
                            <span className="d-flex asking-que">
                              {readinessStatus === "yes"
                                ? `${currentQuestionIndex + 1}.${
                                    currentStep + 1
                                  }. `
                                : `${questionNumber}.${
                                    currentQuestionIndex + currentStep + 1
                                  }. `}
                              <p>{question.question}</p>
                            </span>
                            {question.field_type === "file" && (
                              <input
                                type="file"
                                className="styled-file-upload"
                                onChange={(e) =>
                                  handleFileUpload(e.target.files[0], key)
                                }
                              />
                            )}
                            {question.field_type === "dropdown" && (
                              <div>
                                {question.dropdown_options &&
                                question.dropdown_options.length > 0 ? (
                                  <select
                                    className="styled-dropdown"
                                    value={
                                      subQuestion[key]?.answer?.trim() || ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(key, e.target.value)
                                    }
                                  >
                                    <option value="" disabled>
                                      Select an option
                                    </option>
                                    {question.dropdown_options
                                      .filter(
                                        (option) =>
                                          option !== null &&
                                          option?.trim() !== ""
                                      )
                                      .map((option, index) => (
                                        <option key={index} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                  </select>
                                ) : (
                                  <p>No options available for this question.</p>
                                )}
                              </div>
                            )}
                            {question.field_type === "radio" && (
                              <div>
                                {question.dropdown_options.map(
                                  (option, index) => (
                                    <label
                                      key={index}
                                      className={`select--questions ${
                                        subQuestion[key]?.answer === option
                                          ? "select--questions-active"
                                          : ""
                                      }`}
                                      style={{
                                        display: "inline-block",
                                        marginRight: "10px",
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={`${mainQuestionNumber}.${key}`}
                                        value={option}
                                        checked={
                                          subQuestion[key]?.answer === option
                                        }
                                        onChange={() =>
                                          handleRadioChange(key, option)
                                        }
                                        style={{ display: "none" }}
                                      />
                                      {option}
                                    </label>
                                  )
                                )}
                              </div>
                            )}
                            {question.field_type === "tools" && (
                              <div>
                                <select
                                  className="styled-dropdown"
                                  value={selectedAnswers || ""}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setSelectedAnswers(newValue);
                                    const originalData =
                                      originalSubQuestionRef.current[key] || {};
                                    const userEditedAnswer =
                                      userEditedAnswersRef.current[key];

                                    if (newValue === "others") {
                                      const answerToSet =
                                        userEditedAnswer !== undefined
                                          ? userEditedAnswer
                                          : originalData.answer === "others" &&
                                            originalData.evidence
                                          ? originalData.evidence
                                          : "";
                                      setSubQuestion((prev) => ({
                                        ...prev,
                                        [key]: {
                                          ...prev[key],
                                          answer: answerToSet,
                                        },
                                      }));
                                    } else if (newValue === "self") {
                                      setSubQuestion((prev) => ({
                                        ...prev,
                                        [key]: { ...prev[key], answer: "self" },
                                      }));
                                    } else {
                                      setSubQuestion((prev) => ({
                                        ...prev,
                                        [key]: {
                                          ...prev[key],
                                          answer: newValue,
                                        },
                                      }));
                                    }
                                  }}
                                >
                                  <option value="" disabled>
                                    Select an option
                                  </option>
                                  {question.dropdown_options
                                    .filter((option) => option !== null)
                                    .map((option, index) => (
                                      <option key={index} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                </select>
                                {selectedAnswers === "others" && (
                                  <div>
                                    <textarea
                                      className="styled-textarea w-25"
                                      placeholder="Enter your response here"
                                      value={subQuestion[key]?.answer || ""}
                                      onChange={(e) =>
                                        handleInputChange(key, e.target.value)
                                      }
                                    />
                                  </div>
                                )}
                                {selectedAnswers === "self" && (
                                  <input
                                    type="file"
                                    accept=".pdf, .xlsx, .xls, .csv, .jpg, .jpeg, .doc, .text, .docx"
                                    className="styled-file-upload"
                                    onChange={(e) =>
                                      handleFileUpload(e.target.files[0], key)
                                    }
                                  />
                                )}
                              </div>
                            )}
                            {question.field_type ===
                              "radio_with_sub_action" && (
                              <div>
                                {question.dropdown_options.map(
                                  (option, index) => (
                                    <label
                                      key={index}
                                      className={`select--questions ${
                                        subQuestion[key]?.answer === option
                                          ? "select--questions-active"
                                          : ""
                                      }`}
                                      style={{
                                        display: "inline-block",
                                        marginRight: "10px",
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={key}
                                        value={option}
                                        checked={
                                          subQuestion[key]?.answer === option
                                        }
                                        onChange={() =>
                                          handleRadioChange(key, option)
                                        }
                                        style={{ display: "none" }}
                                      />
                                      {option}
                                    </label>
                                  )
                                )}
                              </div>
                            )}
                            {question.field_type === "text" && (
                              <textarea
                                className="styled-textarea w-50"
                                placeholder="Enter your response here"
                                value={question.answer || ""}
                                onChange={(e) =>
                                  handleInputChange(key, e.target.value)
                                }
                                onBlur={() => handleBlurSave(key)}
                              />
                            )}
                            {question.field_type === "checkbox" && (
                              <div className="checkbox-container">
                                {question.dropdown_options.map(
                                  (option, index) => (
                                    <label
                                      key={index}
                                      className="checkbox-label"
                                    >
                                      <input
                                        type="checkbox"
                                        name={key}
                                        value={option}
                                        checked={
                                          subQuestion[key]?.answer?.includes(
                                            option
                                          ) || false
                                        }
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            key,
                                            option,
                                            e.target.checked
                                          )
                                        }
                                      />
                                      <span className="checkbox-custom"></span>
                                      {option}
                                    </label>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                <div className="navigation-buttons">
                  {currentSection > 0 &&
                  isFirstQuestion() &&
                  currentStep === 0 &&
                  readinessStatus === "yes" ? (
                    <button
                      type="button"
                      onClick={handlePreviousSection}
                      className="btn btn-prev w-auto btn-sm"
                      disabled={
                        currentSection === 0 && currentQuestionIndex === 0
                      } // Disable only for first question of first section
                    >
                     <LeftarrowIcon/> Previous
                      Section
                    </button>
                  ) : (
                    (currentStep > 0 || currentQuestionIndex > 0) && (
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="btn btn-prev w-auto btn-sm"
                      >
                       <LeftarrowIcon/> Previous
                      </button>
                    )
                  )}

                  {currentStep < Object.keys(subQuestion).length - 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="btn btn-auth w-auto btn-sm"
                        disabled={isNextDisabled()}
                      >
                        Next <RightarrowIcon />
                      </button>
                      {readinessStatus !== "yes" && (
                        <button
                          type="button"
                          onClick={handleSkipSubQuestion}
                          className="btn btn-skip w-auto btn-sm"
                        >
                          Skip <RightarrowIcon />
                        </button>
                      )}
                    </>
                  )}

                  {currentStep === Object.keys(subQuestion).length - 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="btn btn-auth w-auto btn-sm"
                        disabled={
                          readinessStatus === "yes" &&
                          isLastQuestion() &&
                          !isNextSectionAvailable &&
                          !isLastSubQuestionModified
                            ? true
                            : readinessStatus !== "yes" && isNextDisabled()
                        }
                      >
                        {readinessStatus === "yes" && isLastQuestion()
                          ? "Next Section"
                          : "Next"}
                        <RightarrowIcon />
                      </button>
                      {readinessStatus !== "yes" && (
                        <button
                          type="button"
                          onClick={handleSkipSubQuestion}
                          className="btn btn-skip w-auto later-button"
                        >
                          Skip <RightarrowIcon />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </form>
            )}
          </div>

          <div className="col-lg-3">
            {readinessStatus === "yes" && (
              <div className="m-3">
                <button
                  className="btn primary-btn mx-1 p-1 mb-2 mt-2 ml-4 d-flex justify-content-center align-items-center"
                  onClick={handleViewAnswers}
                >
                  View Answers
                </button>
              </div>
            )}
            <div className="card p-3 bg-transparent">
              <p className="color-light-gray mb-1">Statistics</p>
              <p className="total-que mb-1">Total questions answered</p>
              <div>
                <div className="d-flex">
                  <div className="poll-label d-flex">
                    <p className="mb-0">Yes </p>
                    <p className="mb-0">({yesCount})</p>
                  </div>
                  <div
                    className="progress poll-bar"
                    role="progressbar"
                    aria-label="Basic example"
                    aria-valuenow={yesCount}
                    aria-valuemin="0"
                    aria-valuemax={totalQuestions}
                  >
                    <div
                      className="progress-bar progress-bgcolor-gr"
                      style={{ width: `${(yesCount / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="poll-label d-flex">
                    <p className="mb-0">No </p>
                    <p className="mb-0">({noCount})</p>
                  </div>
                  <div
                    className="progress poll-bar"
                    role="progressbar"
                    aria-label="Basic example"
                    aria-valuenow={noCount}
                    aria-valuemin="0"
                    aria-valuemax={totalQuestions}
                  >
                    <div
                      className="progress-bar progress-bgcolor-ag"
                      style={{ width: `${(noCount / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="poll-label d-flex">
                    <p className="mb-0">Skip </p>
                    <p className="mb-0">({skipCount})</p>
                  </div>
                  <div
                    className="progress poll-bar"
                    role="progressbar"
                    aria-label="Basic example"
                    aria-valuenow={skipCount}
                    aria-valuemin="0"
                    aria-valuemax={totalQuestions}
                  >
                    <div
                      className="progress-bar progress-bgcolor-tg"
                      style={{
                        width: `${(skipCount / totalQuestions) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="card p-3 mt-3 shadow-sm"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}
            >
              <p
                className="color-light-gray mb-2"
                style={{ fontWeight: "bold", fontSize: "14px" }}
              >
                Question Count
              </p>
              <div className="d-flex justify-content-between">
                <div>
                  <p
                    className="mb-1"
                    style={{ fontSize: "16px", color: "#28a745" }}
                  >
                    Main Questions:
                    <span style={{ fontWeight: "bold" }}>{mainCount}</span>
                  </p>
                </div>
                <div>
                  <p
                    className="mb-1"
                    style={{ fontSize: "16px", color: "#28a745" }}
                  >
                    Sub-Questions:
                    <span style={{ fontWeight: "bold" }}>{subCount}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="readiness-nodata">
          <div className="text-center form-card">
            No Readiness Questions Available Here.
          </div>
        </div>
      )}
    </div>
  );
};

export default Readiness;
