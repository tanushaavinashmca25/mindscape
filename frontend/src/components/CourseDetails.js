import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from "./Footer";
import { useParams, useNavigate } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import {
  FiVideo,
  FiFileText,
  FiUsers,
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiXCircle,
  FiDownload,
} from 'react-icons/fi';
import { usePomodoroTimer } from './PomodoroContext';
import PDFViewerAdvanced from './PDFViewerAdvanced';
import VideoPlayer from './VideoPlayer';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const Message = ({ type, children }) => (
  <div
    className={`p-3 rounded-lg mb-4 text-sm ${
      type === 'error'
        ? 'bg-red-100 text-red-700'
        : 'bg-green-100 text-green-700'
    }`}
  >
    {children}
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center mb-4">
    {icon}
    <h2 className="text-xl font-semibold ml-2">{title}</h2>
  </div>
);

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('lectures');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [classmates, setClassmates] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [watchProgress, setWatchProgress] = useState({});
  const [noteProgress, setNoteProgress] = useState({});

  const token = localStorage.getItem('token');

  // Pomodoro
  const { PomodoroButton } = usePomodoroTimer();

  useEffect(() => {
    fetchCourseDetails();
    fetchClassmates();
    fetchWatchProgress();
    fetchNoteProgress();
    // eslint-disable-next-line
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const [courseRes, detailsRes] = await Promise.all([
        axios.get(`https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}`, {
          headers: { authorization: token },
        }),
        axios.get(`https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/details`, {
          headers: { authorization: token },
        }),
      ]);

      setCourse({ ...courseRes.data.course, ...detailsRes.data });
      setCurrentStudentId(detailsRes.data.studentId);
    } catch (err) {
      setError('Failed to fetch course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassmates = async () => {
    try {
      const res = await axios.get(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/students`,
        { headers: { authorization: token } }
      );
      setClassmates(res.data.students || []);
    } catch (err) {
      console.error('Error fetching classmates:', err);
    }
  };

  const fetchWatchProgress = async () => {
    try {
      const res = await axios.get(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/progress`,
        { headers: { authorization: token } }
      );

      const progressMap = {};
      (res.data.progress || []).forEach((item) => {
        progressMap[item.lecture_id] = item.progress || 0;
      });

      setWatchProgress(progressMap);
    } catch (err) {
      console.error('Error fetching watch progress:', err);
    }
  };

  const fetchNoteProgress = async () => {
    try {
      const res = await axios.get(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/note-progress`,
        { headers: { authorization: token } }
      );

      const progressMap = {};
      (res.data.progress || []).forEach((item) => {
        progressMap[item.note_id] = item.viewed || 0;
      });

      setNoteProgress(progressMap);
    } catch (err) {
      console.error('Error fetching note progress:', err);
    }
  };

  const updateWatchProgress = async (lectureId, progress) => {
    try {
      const newProgress =
        watchProgress[lectureId] >= 0.75
          ? Math.max(progress, watchProgress[lectureId])
          : progress;

      await axios.post(
        `https://mindscape-ghx1.onrender.com/api/student/lectures/${lectureId}/progress`,
        { progress: newProgress },
        { headers: { authorization: token } }
      );

      setWatchProgress((prev) => ({
        ...prev,
        [lectureId]: newProgress,
      }));
    } catch (err) {
      console.error('Error updating watch progress:', err);
    }
  };

  const markWatch = async () => {
    try {
      const res = await axios.post(
        `https://mindscape-ghx1.onrender.com/api/student/courses/${courseId}/watch`,
        {},
        { headers: { authorization: token } }
      );
 console.log("WATCH RESPONSE:", res.data); 
      setMessage(res.data.message || 'Marked as watched');
      fetchCourseDetails();
      fetchClassmates();
    } catch (err) {
      setMessage('Error marking watch');
      console.error(err);
    }
  };

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
      console.error('Error marking note as viewed:', err);
    }
  };

  const handleVideoProgress = (state, lectureId) => {
    const { playedSeconds, accumulated, duration } = state;

    const progressFraction = duration > 0 ? playedSeconds / duration : 0;

    updateWatchProgress(lectureId, progressFraction);

    if (
      duration > 0 &&
      accumulated >= 0.75 * duration &&
      watchProgress[lectureId] < 0.75
    ) {
      markWatch();
      console.log(
        `Lecture ${lectureId} watched with ${accumulated.toFixed(
          2
        )}s accumulated watch time (75% of ${duration}s).`
      );
    }
  };

  const handleNoteView = (note) => {
    setSelectedNote(note);
    setSelectedLecture(null);
    markNoteAsViewed(note.id);
  };

  const isPDF = (filePath) => {
    return filePath && filePath.toLowerCase().endsWith('.pdf');
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!course) return <div className="p-8">Course not found</div>;

 return (
  <div className="flex flex-col min-h-screen">
    <div className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Top Bar */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <PomodoroButton />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ================= MAIN CONTENT ================= */}
          <div className="lg:col-span-3 space-y-6">

            {/* Course Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {course.title}
                  </h1>
                  <p className="text-gray-600">
                    Taught by {course.teacherName}
                  </p>
                </div>

                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-600 font-semibold">
                    Streak: {course.streak} 🔥
                  </span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            {selectedLecture && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedLecture.title}
                </h2>

                <div className="rounded-lg overflow-hidden">
                  <VideoPlayer
                    lecture={selectedLecture}
                    onProgress={(state) =>
                      handleVideoProgress(state, selectedLecture.id)
                    }
                  />
                </div>

                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <FiClock className="mr-1" />
                  {new Date(
                    selectedLecture.upload_date
                  ).toLocaleDateString()}

                  {watchProgress[selectedLecture.id] >= 0.75 && (
                    <div className="ml-4 text-green-600 flex items-center">
                      <FiCheck className="mr-2" /> Marked as watched
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PDF Viewer */}
            {selectedNote && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {selectedNote.title}
                  </h2>

                  <button
                    onClick={() => setSelectedNote(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <FiXCircle className="mr-2" /> Close
                  </button>
                </div>

                {isPDF(selectedNote.file_path) ? (
                  <div className="rounded-lg overflow-hidden">
                    <PDFViewerAdvanced filePath={selectedNote.file_path} />
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="max-w-md mx-auto">
                      <FiFileText className="text-blue-500 text-5xl mx-auto mb-4" />

                      <h3 className="text-xl font-medium text-gray-800 mb-2">
                        This file type can't be previewed
                      </h3>

                      <p className="text-gray-600 mb-6">
                        This document is available for download only.
                      </p>

                      <a
                        href={`https://mindscape-ghx1.onrender.com${selectedNote.file_path}`}
                        download
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                      >
                        <FiDownload className="mr-2" /> Download File
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <FiClock className="mr-1" />
                  {new Date(
                    selectedNote.upload_date
                  ).toLocaleDateString()}
                </div>
              </div>
            )}

           {/* Course Content Tabs */}
<div className="bg-white rounded-xl p-6 shadow-sm">

  {/* Tabs Header */}
  <div className="flex space-x-6 border-b mb-4">
    <button
      onClick={() => setActiveTab("lectures")}
      className={`pb-2 px-2 ${
        activeTab === "lectures"
          ? "border-b-2 border-blue-500 text-blue-600"
          : "text-gray-500"
      }`}
    >
      Lectures
    </button>

    <button
      onClick={() => setActiveTab("notes")}
      className={`pb-2 px-2 ${
        activeTab === "notes"
          ? "border-b-2 border-blue-500 text-blue-600"
          : "text-gray-500"
      }`}
    >
      Notes
    </button>

    <button
      onClick={() => setActiveTab("classmates")}
      className={`pb-2 px-2 ${
        activeTab === "classmates"
          ? "border-b-2 border-blue-500 text-blue-600"
          : "text-gray-500"
      }`}
    >
      Classmates
    </button>
  </div>

  {/* ===== Lectures ===== */}
  {activeTab === "lectures" && (
    <div className="space-y-4">
      {course.lectures.map((lec) => (
        <div
          key={lec.id}
          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">
                {lec.title}
              </h4>

              <p className="text-sm text-gray-500">
                {new Date(lec.upload_date).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedLecture(lec);
                setSelectedNote(null);
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Watch
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* ===== Notes ===== */}
  {activeTab === "notes" && (
    <div className="space-y-4">
      {course.notes.map((note) => (
        <div
          key={note.id}
          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">
                {note.title}
              </h4>

              <p className="text-sm text-gray-500">
                {new Date(note.upload_date).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => handleNoteView(note)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* ===== Classmates ===== */}
  {activeTab === "classmates" && (
    <div className="space-y-3">
      {classmates.length === 0 ? (
        <p className="text-gray-500 text-center">
          No other students enrolled
        </p>
      ) : (
        classmates.map((student) => (
          <div
            key={student.id}
            className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex justify-between"
          >
            <span className="font-medium">
              {student.name}
            </span>

            <span className="text-orange-600 font-semibold">
              🔥 {student.streak}
            </span>
          </div>
        ))
      )}
    </div>
  )}

</div>

          </div>

          {/* ================= SIDEBAR ================= */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <SectionHeader
                icon={<FiUsers className="text-green-500" />}
                title="Classmates"
              />

              <div className="space-y-4">
                {classmates.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No other students enrolled
                  </p>
                ) : (
                  classmates.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 rounded-lg border ${
                        student.id === currentStudentId
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            {student.name}
                            {student.id === currentStudentId && (
                              <span className="ml-2 text-sm text-blue-600">
                                (You)
                              </span>
                            )}
                          </p>

                          <p className="text-sm text-gray-500">
                            Current Course Streak
                          </p>
                        </div>

                        <div className="flex items-center">
                          <span className="text-orange-600 font-semibold">
                            {student.streak}
                          </span>
                          <span className="ml-1">🔥</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Footer */}
    <Footer />
  </div>
);
};
export default CourseDetails;
