import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, Target, Zap, Star, Sparkles, BookOpen, Brain, ChevronDown, Globe, Award } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Redesigned Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-purple-50/50">
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl rotate-12 animate-pulse"></div>
          <div className="absolute top-60 right-40 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full animate-bounce" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-40 left-40 w-20 h-20 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-2xl rotate-45 animate-pulse" style={{animationDelay: '2s'}}></div>
          
          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="h-full w-full" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Content Container */}
          <div className="min-h-screen flex flex-col justify-center py-20">
            
            {/* Top Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200/50 rounded-full text-blue-700 text-sm font-semibold backdrop-blur-sm">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <span>AI-Powered Learning Platform</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Column - Text Content */}
              <div className="text-left">
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-black mb-8 leading-tight">
                  <span className="block text-gray-900 mb-2">Learn</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Smarter
                  </span>
                  <span className="block text-gray-900">Not Harder</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl">
                  Transform your education with AI-powered personalized learning paths, instant feedback, and adaptive assessments that evolve with your progress.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    to="/courses"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    <span className="text-lg">Get Started Free</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <button className="group inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-blue-300 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-lg">
                    <Play className="w-5 h-5 mr-2 group-hover:text-blue-600" />
                    <span className="text-lg">Watch Demo</span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    <span>Award Winning</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-500" />
                    <span>Global Access</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-500" />
                    <span>AI Powered</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Elements */}
              <div className="relative">
                {/* Main Visual Card */}
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">AI Learning Assistant</h3>
                        <p className="text-sm text-gray-500">Personalized for you</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Mathematics</span>
                        <span className="text-blue-600 font-bold">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full animate-pulse" style={{width: '87%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Science</span>
                        <span className="text-purple-600 font-bold">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full animate-pulse" style={{width: '92%', animationDelay: '1s'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Languages</span>
                        <span className="text-green-600 font-bold">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full animate-pulse" style={{width: '78%', animationDelay: '2s'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <div className="flex space-x-2">
                    <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Fast Learner
                    </div>
                    <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      <Target className="w-3 h-3 mr-1" />
                      Goal Crusher
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg rotate-12 animate-bounce" style={{animationDuration: '3s'}}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg -rotate-12 animate-pulse">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-gray-200">
              {[
                { number: '1000+', label: 'Expert Courses', icon: BookOpen },
                { number: '150+', label: 'Universities', icon: Award },
                { number: '24/7', label: 'AI Support', icon: Brain },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600 group-hover:text-purple-600 transition-colors" />
                  <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">EduGenie</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of education with cutting-edge technology and personalized learning paths.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI-Powered Learning',
                description: 'Get personalized study recommendations and instant feedback powered by advanced AI algorithms.',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Target,
                title: 'Adaptive Assessments',
                description: 'Take quizzes that adapt to your learning pace and focus on areas that need improvement.',
                color: 'from-green-400 to-blue-500'
              },
              {
                icon: Users,
                title: 'Collaborative Learning',
                description: 'Join study groups, participate in discussions, and learn from peers around the world.',
                color: 'from-purple-400 to-pink-500'
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular <span className="text-purple-600">Categories</span>
            </h2>
            <p className="text-xl text-gray-600">
              Explore our most sought-after learning paths
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Programming', courses: '120+ Courses', icon: '💻', color: 'bg-blue-500' },
              { name: 'Mathematics', courses: '85+ Courses', icon: '📊', color: 'bg-green-500' },
              { name: 'Science', courses: '95+ Courses', icon: '🔬', color: 'bg-purple-500' },
              { name: 'Language', courses: '75+ Courses', icon: '🌍', color: 'bg-pink-500' },
              { name: 'Business', courses: '110+ Courses', icon: '💼', color: 'bg-orange-500' },
              { name: 'Design', courses: '60+ Courses', icon: '🎨', color: 'bg-red-500' },
              { name: 'Engineering', courses: '90+ Courses', icon: '⚙️', color: 'bg-indigo-500' },
              { name: 'Medicine', courses: '70+ Courses', icon: '🏥', color: 'bg-teal-500' },
            ].map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 text-2xl`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.courses}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our <span className="text-blue-600">Students Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Computer Science Student',
                content: 'EduGenie transformed my learning experience. The AI-powered recommendations helped me focus on weak areas and improve dramatically.',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Medical Student',
                content: 'The university exam prep feature is incredible. I uploaded my syllabus and got a personalized study plan that helped me ace my finals.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Engineering Student',
                content: 'The interactive quizzes and flashcards made studying engaging. I never thought learning could be this fun and effective.',
                rating: 5
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already transforming their future with EduGenie.
          </p>
          <Link
            to="/courses"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all inline-flex items-center space-x-2 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;