// src/app/guardian-guide/page.js
import { Heart, Shield, Clock, Users, CheckCircle, AlertTriangle, MessageSquare, Brain, HelpCircle } from 'lucide-react'

export default function GuardianGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-red-500 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Guardian Guide</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A complete guide to being a trusted Guardian in the Shush community
        </p>
      </div>

      {/* What is a Guardian */}
      <section className="mb-12">
        <div className="bg-blue-50 rounded-lg p-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-blue-900">What is a Guardian?</h2>
          </div>
          <p className="text-blue-800 text-lg mb-4">
            A Guardian is a trusted friend, family member, or advisor who helps someone maintain healthy digital boundaries by making thoughtful decisions about unblocking contacts.
          </p>
          <p className="text-blue-700">
            When someone you care about blocks a harmful contact, they may later feel tempted to reconnect during vulnerable moments. As their Guardian, you provide an objective perspective and accountability to help them stick to their healthy choices.
          </p>
        </div>
      </section>

      {/* Your Responsibilities */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Users className="h-8 w-8 text-green-600 mr-3" />
          Your Responsibilities
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Review Requests Thoughtfully</h3>
            </div>
            <p className="text-gray-700">
              Take time to understand why the contact was originally blocked and consider whether reconnecting serves their wellbeing.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Clock className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-semibold">Respond Promptly</h3>
            </div>
            <p className="text-gray-700">
              Aim to respond within 24-48 hours. Urgent requests should be addressed sooner, while routine requests can take a few days.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">Provide Clear Reasoning</h3>
            </div>
            <p className="text-gray-700">
              Whether approving or denying, explain your decision to help them understand and learn from the process.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">Stay Supportive</h3>
            </div>
            <p className="text-gray-700">
              Remember you're helping someone build healthier relationships. Be compassionate while maintaining healthy boundaries.
            </p>
          </div>
        </div>
      </section>

      {/* Decision Making Framework */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Brain className="h-8 w-8 text-purple-600 mr-3" />
          Decision Making Framework
        </h2>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Consider These Questions:</h3>
          <div className="space-y-3">
            {[
              "Why was this contact originally blocked?",
              "What is the user's current emotional state?",
              "Has enough time passed for healing/perspective?",
              "What are the potential risks of reconnecting?",
              "Are there safer ways to address their needs?",
              "What would be best for their long-term wellbeing?"
            ].map((question, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  <span className="text-purple-600 text-sm font-medium">{index + 1}</span>
                </div>
                <p className="text-gray-700">{question}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-green-800 font-semibold mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Consider Approving When:
            </h4>
            <ul className="text-green-700 space-y-2">
              <li>• Sufficient time has passed for healing</li>
              <li>• The user shows genuine growth and insight</li>
              <li>• They have specific, healthy reasons to reconnect</li>
              <li>• The original issue was minor or resolved</li>
              <li>• They demonstrate emotional stability</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-red-800 font-semibold mb-3 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Consider Denying When:
            </h4>
            <ul className="text-red-700 space-y-2">
              <li>• They seem emotionally vulnerable or impulsive</li>
              <li>• The original harm was severe (abuse, manipulation)</li>
              <li>• No real change in circumstances</li>
              <li>• Reconnecting could trigger relapse/harm</li>
              <li>• They're seeking contact during crisis</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Response Templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Response Templates
        </h2>

        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-800 font-semibold mb-3">Approval Response Example:</h3>
            <div className="bg-white p-4 rounded border text-gray-700 italic">
              "I can see you've taken time to reflect and have grown since the blocking. Your reasons for wanting to reconnect seem healthy and well-thought-out. I approve this unblock, but please remember the boundaries you've learned and don't hesitate to re-block if needed. I'm proud of your progress."
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-3">Denial Response Example:</h3>
            <div className="bg-white p-4 rounded border text-gray-700 italic">
              "I understand you're feeling lonely right now, but remember why you blocked them originally - the constant manipulation was affecting your mental health. You're in a vulnerable state and might not see clearly. Let's wait another month and focus on building other supportive relationships first. You've made such good progress."
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-yellow-800 font-semibold mb-3">Request for More Information:</h3>
            <div className="bg-white p-4 rounded border text-gray-700 italic">
              "I need to understand better before making this decision. Can you tell me more about what's changed since you blocked them? Have you talked to your therapist about this? What specific outcome are you hoping for from reconnecting? Let's have a call this weekend to discuss."
            </div>
          </div>
        </div>
      </section>

      {/* Boundaries and Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Shield className="h-8 w-8 text-indigo-600 mr-3" />
          Your Boundaries as a Guardian
        </h2>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-indigo-900 mb-2">You Are:</h3>
              <ul className="text-indigo-800 space-y-1">
                <li>• A trusted advisor and accountability partner</li>
                <li>• Someone who provides perspective and wisdom</li>
                <li>• A supportive voice during difficult decisions</li>
                <li>• An objective observer of their patterns</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900 mb-2">You Are NOT:</h3>
              <ul className="text-indigo-800 space-y-1">
                <li>• Responsible for their decisions or outcomes</li>
                <li>• Required to be available 24/7</li>
                <li>• A therapist or professional counselor</li>
                <li>• Obligated to approve requests</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800">Important:</h4>
              <p className="text-yellow-700 text-sm mt-1">
                If you feel overwhelmed, notice concerning patterns, or believe someone needs professional help, encourage them to speak with a therapist or counselor. You can step back from the Guardian role if needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Situations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
          Emergency Situations
        </h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-4">If someone indicates they might harm themselves or others:</h3>
          <div className="space-y-3 text-red-700">
            <div className="flex items-center">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">1</span>
              <span>Take it seriously - don't dismiss or minimize their words</span>
            </div>
            <div className="flex items-center">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">2</span>
              <span>Encourage them to contact crisis resources immediately</span>
            </div>
            <div className="flex items-center">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">3</span>
              <span>Consider contacting emergency services if you believe they're in immediate danger</span>
            </div>
            <div className="flex items-center">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">4</span>
              <span>Don't try to handle crisis situations alone</span>
            </div>
          </div>

          <div className="mt-6 bg-white p-4 rounded border">
            <h4 className="font-semibold text-red-800 mb-2">Crisis Resources:</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-medium text-gray-900">Crisis Text Line</p>
                <p className="text-gray-700">Text HOME to 741741</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">National Suicide Prevention Lifeline</p>
                <p className="text-gray-700">Call or text 988</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">National Domestic Violence Hotline</p>
                <p className="text-gray-700">1-800-799-7233</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Emergency Services</p>
                <p className="text-gray-700">Call 911 for immediate danger</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <HelpCircle className="h-8 w-8 text-gray-600 mr-3" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              question: "What if I approve an unblock request and something bad happens?",
              answer: "You are not responsible for the outcomes of their decisions. You're providing guidance based on the information available. The person making the request is ultimately responsible for their choices and wellbeing."
            },
            {
              question: "How quickly should I respond to requests?",
              answer: "Aim for 24-48 hours for most requests. Emergency or high-priority requests should be addressed sooner. Low-priority requests can take a few days. It's okay to take time to think through your response."
            },
            {
              question: "What if I don't feel qualified to make these decisions?",
              answer: "Trust your instincts and life experience. You don't need professional training - you just need to care about their wellbeing and think objectively. When in doubt, encourage them to wait longer or seek additional support."
            },
            {
              question: "Can I stop being someone's Guardian?",
              answer: "Yes, absolutely. Being a Guardian is voluntary. If it becomes too stressful or you can't fulfill the role effectively, you can step back. It's better to be honest about your limits than to provide inadequate support."
            },
            {
              question: "What if they get angry at me for denying a request?",
              answer: "This is normal and often indicates you made the right decision. They may be in an emotional state that's clouding their judgment. Stay compassionate but firm in your reasoning. Their temporary anger is less important than their long-term wellbeing."
            },
            {
              question: "Should I talk to the person they want to unblock?",
              answer: "Generally, no. Your role is to advise the person who chose you as Guardian, not to mediate between them and others. Focus on helping them make healthy decisions based on their own insights and growth."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Best Practices for Guardians
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700">Do:</h3>
            <ul className="space-y-3">
              {[
                "Read all the context carefully before responding",
                "Ask clarifying questions if you need more information",
                "Consider their emotional state and recent stressors",
                "Acknowledge their feelings while staying objective",
                "Celebrate their growth and progress",
                "Set clear boundaries about your availability",
                "Encourage professional help when appropriate"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-700">Don't:</h3>
            <ul className="space-y-3">
              {[
                "Make decisions based on your own relationship experiences alone",
                "Feel pressured to approve requests to avoid conflict",
                "Share their private information with others",
                "Take on responsibility for their mental health",
                "Ignore red flags or concerning patterns",
                "Respond when you're angry or upset",
                "Forget that saying 'no' can be the most loving response"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Support for Guardians */}
      <section className="mb-12">
        <div className="bg-blue-50 rounded-lg p-8">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-blue-900">Support for Guardians</h2>
          </div>
          <p className="text-blue-800 mb-4">
            Being a Guardian is a meaningful but sometimes challenging role. Remember to take care of yourself too.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">If You Need Help:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Trust your instincts - they're usually right</li>
                <li>• Seek input from other trusted people when unsure</li>
                <li>• Remember that "wait longer" is always an option</li>
                <li>• Consider encouraging professional counseling</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Self-Care Reminders:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Set boundaries around your availability</li>
                <li>• Don't carry the weight of their decisions</li>
                <li>• Celebrate the positive impact you're making</li>
                <li>• Step back if the role becomes overwhelming</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact and Resources */}
      <section className="text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Thank You for Being a Guardian
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            Your willingness to help others maintain healthy boundaries makes a real difference in their lives. 
            You're part of building a more supportive and accountable digital community.
          </p>
          
          <div className="space-y-2 text-gray-600">
            <p>Questions about being a Guardian?</p>
            <p>Email us at: <a href="mailto:guardians@shush.app" className="text-blue-600 hover:underline">guardians@shush.app</a></p>
          </div>
        </div>
      </section>
    </div>
  )
}