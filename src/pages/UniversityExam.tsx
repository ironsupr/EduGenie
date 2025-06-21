import React, { useState } from 'react';
import { Upload, FileText, Download, Zap, CheckCircle, AlertCircle, BookOpen, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadSyllabus, createStudyPlan, analyzeSyllabus } from '../services/studyPlanService';
import { StudyPlan } from '../types';

const UniversityExam = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  
  const { currentUser } = useAuth();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !currentUser) return;

    setIsProcessing(true);
    try {
      // Upload file to Firebase Storage
      const fileUrl = await uploadSyllabus(uploadedFile, currentUser.uid);
      
      // Simulate reading file content (in real app, you'd extract text from the file)
      const syllabusText = "Sample syllabus content";
      
      // Analyze syllabus with AI
      const subjects = await analyzeSyllabus(syllabusText);
      
      // Create study plan
      const newStudyPlan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: currentUser.uid,
        syllabusFileName: uploadedFile.name,
        subjects,
        totalWeeks: 12,
        hoursPerWeek: 15,
        startDate: new Date(),
      };
      
      const studyPlanId = await createStudyPlan(newStudyPlan);
      
      setStudyPlan({
        ...newStudyPlan,
        id: studyPlanId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error analyzing syllabus:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            University <span className="text-purple-600">Exam Prep</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your university syllabus and get an AI-powered personalized study plan with targeted learning materials.
          </p>
        </div>

        {!analysisComplete ? (
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Upload Section */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Syllabus</h2>
                
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive 
                      ? 'border-purple-500 bg-purple-50' 
                      : uploadedFile 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{uploadedFile.name}</p>
                        <p className="text-gray-600">File uploaded successfully</p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                          Drag and drop your syllabus file here
                        </p>
                        <p className="text-gray-600 mb-4">
                          Supports PDF, DOC, DOCX, TXT formats (Max 10MB)
                        </p>
                        <label className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                          Browse Files
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <div className="mt-6">
                    <button
                      onClick={handleAnalyze}
                      disabled={isProcessing || !currentUser}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Analyzing Syllabus...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          <span>Generate Study Plan</span>
                        </>
                      )}
                    </button>
                    {!currentUser && (
                      <p className="text-sm text-red-600 mt-2 text-center">
                        Please log in to generate a study plan
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">What You'll Get</h3>
                <div className="space-y-4">
                  {[
                    { icon: Target, title: 'Topic-wise Analysis', desc: 'Detailed breakdown of all subjects and topics' },
                    { icon: BookOpen, title: 'Study Schedule', desc: 'Optimized timeline based on exam dates' },
                    { icon: Zap, title: 'AI Recommendations', desc: 'Personalized learning resources and tips' },
                    { icon: FileText, title: 'Progress Tracking', desc: 'Monitor your preparation progress' },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <feature.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sample Analysis Preview</h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Subject Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Mathematics</span>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Physics</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Study Timeline</h4>
                    <p className="text-sm text-gray-600">12-week structured plan</p>
                    <p className="text-sm text-gray-600">15 hours/week recommended</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Success Stories</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Alex Chen', exam: 'Computer Science Finals', improvement: '+28%' },
                    { name: 'Sarah Wilson', exam: 'Engineering Entrance', improvement: '+35%' },
                    { name: 'Mike Johnson', exam: 'Medical School Prep', improvement: '+42%' },
                  ].map((story, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{story.name}</p>
                        <p className="text-sm text-gray-600">{story.exam}</p>
                      </div>
                      <div className="text-green-600 font-bold">{story.improvement}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          studyPlan && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Your Personalized Study Plan</h2>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Plan</span>
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Study Duration</h3>
                  <p className="text-3xl font-bold">{studyPlan.totalWeeks} weeks</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Weekly Hours</h3>
                  <p className="text-3xl font-bold">{studyPlan.hoursPerWeek} hours</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-purple-500 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                  <p className="text-3xl font-bold">85%</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Subject Breakdown</h3>
                {studyPlan.subjects.map((subject, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-gray-900">{subject.name}</h4>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subject.difficulty === 'High' ? 'bg-red-100 text-red-800' :
                          subject.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {subject.difficulty}
                        </span>
                        <span className="text-lg font-bold text-purple-600">{subject.weightage}</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Topics to Cover</p>
                        <p className="text-2xl font-bold text-gray-900">{subject.topics.length}</p>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex space-x-2">
                          <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                            View Topics
                          </button>
                          <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors">
                            Start Learning
                          </button>
                          <button className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                            Practice Tests
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UniversityExam;