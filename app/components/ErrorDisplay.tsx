interface ErrorDisplayProps {
  error: any;
  suggestions?: string[];
}

export default function ErrorDisplay({
  error,
  suggestions,
}: ErrorDisplayProps) {
  if (!error) return null;

  const isContentBlocked =
    error?.message?.includes('Content blocked') ||
    error?.message?.includes('CONTENT_BLOCKED') ||
    (typeof error === 'string' && error.toLowerCase().includes('blocked'));

  const isSecurityBlocked =
    error?.message?.includes('Security threat detected') ||
    error?.message?.includes('SECURITY_BLOCKED') ||
    (typeof error === 'string' && error.toLowerCase().includes('security'));

  let guardrailSuggestions: string[] =
    suggestions && suggestions.length > 0
      ? suggestions
      : error?.suggestions && Array.isArray(error.suggestions)
        ? error.suggestions
        : [
            '🎬 Search for safe and family-friendly films',
            '😊 Try comedies, documentaries, or uplifting stories',
            '🌟 Ask for fun, exciting, or heartwarming movies',
            '👨‍👩‍👧‍👦 Request movies suitable for all ages',
            '💕 Look for romantic comedies or feel-good dramas',
            '🚀 Find action movies or sci-fi adventures (family-friendly)',
          ];

  if (isSecurityBlocked) {
    return (
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <span className="text-red-400 text-3xl mr-4 mt-1">🛡️</span>
          <div className="flex-1">
            <h3 className="text-red-300 font-semibold text-lg mb-3">
              Security Alert: Unauthorized Activity Detected 🚫
            </h3>
            <p className="text-red-200 mb-4 leading-relaxed">
              We detected suspicious activity that could compromise our system
              security. This service is designed for legitimate movie
              recommendations only. Please use this platform responsibly and
              within its intended purpose.
            </p>
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-400/30">
              <h4 className="text-red-300 font-medium mb-3 flex items-center">
                <span className="mr-2">⚠️</span>
                What you can do instead:
              </h4>
              <ul className="text-red-200 text-sm space-y-2">
                {guardrailSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-red-400 mr-2 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-400/30">
              <p className="text-yellow-200 text-sm">
                <span className="font-medium">🔒 Security Notice:</span> All
                activities are monitored for security purposes. Repeated
                violations may result in service restrictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isContentBlocked) {
    return (
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <span className="text-blue-400 text-3xl mr-4 mt-1">🎭</span>
          <div className="flex-1">
            <h3 className="text-blue-300 font-semibold text-lg mb-3">
              Let&apos;s Find Something Great for You! 🎬
            </h3>
            <p className="text-blue-200 mb-4 leading-relaxed">
              We want to make sure everyone has a wonderful movie experience!
              Your request didn&apos;t quite match our family-friendly
              guidelines, but we&apos;d love to help you discover amazing films
              that everyone can enjoy.
            </p>
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/30">
              <h4 className="text-blue-300 font-medium mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Here are some great alternatives:
              </h4>
              <ul className="text-blue-200 text-sm space-y-2">
                {guardrailSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-400/30">
              <p className="text-green-200 text-sm">
                <span className="font-medium">💚 Our Promise:</span> We&apos;re
                here to help you discover incredible movies that bring joy,
                inspiration, and entertainment to everyone!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 mb-8">
      <div className="flex items-center">
        <span className="text-red-400 text-2xl mr-3">⚠️</span>
        <div>
          <h3 className="text-red-300 font-semibold">Error</h3>
          <p className="text-red-200">
            {(error as any).message ||
              'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    </div>
  );
}
