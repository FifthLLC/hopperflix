interface DescriptionInputProps {
  description: string;
  setDescription: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export default function DescriptionInput({
  description,
  setDescription,
  handleKeyPress,
}: DescriptionInputProps) {
  return (
    <div>
      <label
        className="block text-white font-semibold mb-3"
        htmlFor="description"
      >
        Tell us about yourself and your preferences:
      </label>
      <textarea
        className="w-full h-32 rounded-xl border-2 border-gray-600 bg-gray-800/50 p-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors resize-none"
        id="description"
        placeholder="Example: I'm a 45-year-old man from Louisiana, USA. I want to watch a cool movie with my girlfriend tonight. I'm divorced. What do you recommend?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <p className="text-sm text-gray-400 mt-2">
        Be specific about your age, interests, mood, and who you&apos;re
        watching with
      </p>
      <p className="text-sm text-yellow-400 mt-1">
        💡 Tip: Ask for genres like &ldquo;comedy&rdquo;, &ldquo;family&rdquo;,
        or &ldquo;romance&rdquo; that focus on light-hearted themes without
        violence.
      </p>
    </div>
  );
}
