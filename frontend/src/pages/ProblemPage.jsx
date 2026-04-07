import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";

const langMap = { cpp: "C++", java: "Java", javascript: "JavaScript" };

const ProblemPage = () => {
  const { problemId } = useParams();

  const [problem, setProblem] = useState(null);
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [leftWidth, setLeftWidth] = useState(50);

  const isDragging = useRef(false);

  // fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(res.data);
        setCode(
          res.data.startCode.find(
            (sc) => sc.language === langMap[lang]
          )?.initialCode || ""
        );
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  // change code on language change
  useEffect(() => {
    if (!problem) return;
    setCode(
      problem.startCode.find((sc) => sc.language === langMap[lang])
        ?.initialCode || ""
    );
  }, [lang, problem]);

  // resize
  useEffect(() => {
    const move = (e) => {
      if (!isDragging.current) return;
      const w = (e.clientX / window.innerWidth) * 100;
      if (w > 25 && w < 75) setLeftWidth(w);
    };
    const up = () => (isDragging.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const runCode = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: lang,
      });
      setRunResult(res.data);
      setSubmitResult(null);
    } catch {
      setRunResult({ error: true });
    }
    setLoading(false);
  };

  const submitCode = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post(
        `/submission/submit/${problemId}`,
        { code, language: lang }
      );
      setSubmitResult(res.data);
      setRunResult(null);
    } catch {
      setSubmitResult({ error: true });
    }
    setLoading(false);
  };

  if (loading && !problem)
    return <div className="flex justify-center mt-20">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen">

      {/* LEFT */}
      <div
        className="p-4 overflow-y-auto w-full"
        style={{ width: window.innerWidth >= 768 ? `${leftWidth}%` : "100%" }}
      >
        <h2 className="text-xl font-bold">{problem?.title}</h2>
          <p className="mt-3 text-sm whitespace-pre-wrap leading-relaxed">
          {problem?.description}
        </p>
      </div>

      {/* DIVIDER */}
      <div
        onMouseDown={() => (isDragging.current = true)}
        className="hidden md:block w-[5px] bg-gray-300 cursor-col-resize"
      />

      {/* RIGHT */}
      <div
        className="flex flex-col w-full"
        style={{
          width: window.innerWidth >= 768 ? `${100 - leftWidth}%` : "100%",
        }}
      >
        {/* language */}
        <div className="p-2 flex gap-2">
          {["javascript", "java", "cpp"].map((l) => (
            <button
              key={l}
              className={`btn btn-xs ${
                lang === l ? "btn-primary" : ""
              }`}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </div>

        {/* editor */}
        <Editor
          height={window.innerWidth < 768 ? "40vh" : "100%"}
          language={lang}
          value={code}
          onChange={(v) => setCode(v || "")}
          theme="vs-dark"
        />

        {/* buttons */}
        <div className="p-2 flex gap-2 justify-end">
          <button className="btn btn-outline btn-sm" onClick={runCode}>
            Run
          </button>
          <button className="btn btn-primary btn-sm" onClick={submitCode}>
            Submit
          </button>
        </div>

        {/* RESULT */}
          <div className="p-3 text-xs md:text-sm overflow-y-auto max-h-40 bg-black/20 rounded">
          {runResult && (
            <pre className="text-green-400">
              {JSON.stringify(runResult, null, 2)}
            </pre>
          )}
          {submitResult && (
            <pre className="text-blue-400">
              {JSON.stringify(submitResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;