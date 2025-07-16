export default function Features() {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
        <div className="text-3xl mb-3">🤖</div>
        <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
        <p className="text-gray-300 text-sm">
          Advanced AI analyzes your preferences for perfect matches
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
        <div className="text-3xl mb-3">🎭</div>
        <h3 className="text-white font-semibold mb-2">Curated Selection</h3>
        <p className="text-gray-300 text-sm">
          Hand-picked classics and recent releases for quality recommendations
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
        <div className="text-3xl mb-3">🛡️</div>
        <h3 className="text-white font-semibold mb-2">Family-Friendly</h3>
        <p className="text-gray-300 text-sm">
          Safe, appropriate recommendations for all audiences
        </p>
      </div>
    </div>
  );
}
