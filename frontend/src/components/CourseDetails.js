import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { pdfjs } from "react-pdf";

import Footer from "./Footer";
import PDFViewerAdvanced from "./PDFViewerAdvanced";
import VideoPlayer from "./VideoPlayer";
import { usePomodoroTimer } from "./PomodoroContext";

import {
  FiVideo,
  FiFileText,
  FiUsers,
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiXCircle,
  FiDownload,
} from "react-icons/fi";

/* ---------- PDF worker ---------- */
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

/* ---------- Message ---------- */
const Message = ({ type, children }) => (
  <div
    className={`p-3 rounded-lg mb-4 text-sm ${
      type === "error"
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {children}
  </div>
);

/* ---------- Section Header ---------- */
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center mb-4">
    {icon}
    <h2 className="text-xl font-semibold ml-2">{title}</h2>
  </div>
);

/* ================= COMPONENT ================= */
const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [classmates, setClassmates] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [watchProgress, setWatchProgress] = useState({});
  const [noteProgress, setNoteProgress] = useState({});
  const [watchedLecturesToday, setWatchedLecturesToday] = useState({});

  const token = localStorage.getItem("token");
  const { PomodoroButton } = usePomodoroTimer();

  /* ---------- Initial Load ---------- */
  useEffect(() => {
    fetchCourseDetails();
    fetchClassmates();
    fetchWatchProgress();
    fetchNoteProgress();
  }, [courseId]);

  /* ---------- Course ---------- */
  const fetchCourseDetails = async () => {
    try {
      const [courseRes, detailsRes] = await Promise.all([
        axios.get(
          `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}`,
          { headers: { authorization: token } }
        ),
        axios.get(
          `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/details`,
          { headers: { authorization: token } }
        ),
      ]);

      setCourse({
  ...courseRes.data.course,
  lectures: detailsRes.data.lectures || [],
  notes: detailsRes.data.notes || [],
  streak: detailsRes.data.streak || 0,
});


      setCurrentStudentId(detailsRes.data.studentId);
    } catch (err) {
      setError("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Classmates ---------- */
  const fetchClassmates = async () => {
    try {
      const res = await axios.get(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/students`,
        { headers: { authorization: token } }
      );
      setClassmates(res.data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Lecture Progress ---------- */
  const fetchWatchProgress = async () => {
    try {
      const res = await axios.get(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/progress`,
        { headers: { authorization: token } }
      );

      const map = {};
      (res.data.progress || []).forEach((p) => {
        map[p.lecture_id] = p.progress || 0;
      });

      setWatchProgress(map);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Note Progress ---------- */
  const fetchNoteProgress = async () => {
    try {
      const res = await axios.get(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/note-progress`,
        { headers: { authorization: token } }
      );

      const map = {};
      (res.data.progress || []).forEach((p) => {
        map[p.note_id] = p.viewed || 0;
      });

      setNoteProgress(map);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Update Progress ---------- */
  const updateWatchProgress = async (lectureId, progress) => {
    try {
      await axios.post(
        `https://mindscape-ghx1.onrender.com/api/student/lectures/${lectureId}/progress`,
        { progress },
        { headers: { authorization: token } }
      );

      setWatchProgress((prev) => ({
        ...prev,
        [lectureId]: progress,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Mark Watched ---------- */
  const markWatch = async () => {
    try {
      const res = await axios.post(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/watch`,
        {},
        { headers: { authorization: token } }
      );

      setMessage(res.data.message || "Marked as watched");
      fetchCourseDetails();
      fetchClassmates();
    } catch (err) {
      setMessage("Error marking watch");
    }
  };

  /* ---------- Note Viewed ---------- */
  const markNoteAsViewed = async (noteId) => {
    try {
      await axios.post(
        `https://mindscape-ghx1.onrender.com/api/student/notes/${noteId}/view`,
        {},
        { headers: { authorization: token } }
      );

      setNoteProgress((prev) => ({
        ...prev,
        [noteId]: 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoProgress = (state, lectureId) => {
    const { playedSeconds, accumulated, duration } = state;

    const fraction = duration > 0 ? playedSeconds / duration : 0;
    updateWatchProgress(lectureId, fraction);

    if (
      duration > 0 &&
      accumulated >= 0.75 * duration &&
      (!watchProgress[lectureId] ||
        watchProgress[lectureId] < 0.75)
    ) {
      setWatchedLecturesToday((p) => ({ ...p, [lectureId]: true }));
      markWatch();
    }
  };

  const handleNoteView = (note) => {
    setSelectedNote(note);
    setSelectedLecture(null);
    markNoteAsViewed(note.id);
  };

  const isPDF = (filePath) =>
    filePath && filePath.toLowerCase().endsWith(".pdf");

  if (loading) return <div className="p-8">Loading...</div>;
  if (!course) return <div className="p-8">Course not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Back + Timer */}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </button>

            <PomodoroButton />
          </div>

          {/* Remaining JSX unchanged */}
          {/* ... UI continues exactly as your structure ... */}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;
