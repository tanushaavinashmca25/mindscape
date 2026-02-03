import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import Footer from "./Footer";

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

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const Message = ({ type, children }) => (
  <div className={`p-3 rounded-lg mb-4 text-sm ${
    type === 'error'
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700'
  }`}>
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
  const [message, setMessage] = useState('');

  const [classmates, setClassmates] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [noteProgress, setNoteProgress] = useState({});
  const [watchedLecturesToday, setWatchedLecturesToday] = useState({});

  const token = localStorage.getItem('token');
  const { PomodoroButton } = usePomodoroTimer();

  useEffect(() => {
    fetchCourseDetails();
    fetchClassmates();
    fetchNoteProgress();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    const [courseRes, detailsRes] = await Promise.all([
      axios.get(`/api/student/courses/${courseId}`, { headers: { authorization: token } }),
      axios.get(`/api/student/courses/${courseId}/details`, { headers: { authorization: token } }),
    ]);

   setCourse({
  ...courseRes.data.course,
  lectures: detailsRes.data.lectures || [],
  notes: detailsRes.data.notes || [],
  streak: detailsRes.data.streak || 0,
});

    setCurrentStudentId(detailsRes.data.studentId);
    setLoading(false);
  };

  const fetchClassmates = async () => {
    const res = await axios.get(`/api/student/courses/${courseId}/students`, {
      headers: { authorization: token },
    });
    setClassmates(res.data.students || []);
  };

  const fetchNoteProgress = async () => {
    const res = await axios.get(`/api/student/courses/${courseId}/note-progress`, {
      headers: { authorization: token },
    });

    const map = {};
    (res.data.progress || []).forEach(p => {
      map[p.note_id] = p.viewed || 0;
    });

    setNoteProgress(map);
  };

  const markWatch = async () => {
    const res = await axios.post(
      `/api/student/courses/${courseId}/watch`,
      {},
      { headers: { authorization: token } }
    );

    setMessage(res.data.message);
    fetchCourseDetails();
    fetchClassmates();
  };

  const markNoteAsViewed = async (noteId) => {
    await axios.post(
      `/api/student/notes/${noteId}/view`,
      {},
      { headers: { authorization: token } }
    );

    setNoteProgress(prev => ({ ...prev, [noteId]: 1 }));
  };

  const handleVideoProgress = (state, lectureId) => {
    const { accumulated, duration } = state;

    if (
      duration > 0 &&
      accumulated >= 0.75 * duration &&
      !watchedLecturesToday[lectureId]
    ) {
      setWatchedLecturesToday(prev => ({ ...prev, [lectureId]: true }));
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>

          <PomodoroButton />
        </div>

        {/* Rest of JSX remains same */}
        {/* No structural change needed */}

      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;
