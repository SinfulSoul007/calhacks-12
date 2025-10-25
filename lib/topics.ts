const DEFAULT_TOPICS = [
  'What food could you eat every day and never get sick of?',
  'Tell me about a hobby you picked up recently.',
  'Describe your perfect lazy Sunday.',
  'What is the most underrated TV show in your opinion?',
  'What is your go-to karaoke song and why?',
  'If you could teleport anywhere right now, where would you go?',
  'What pet would you get if responsibilities did not matter?',
  'What is a childhood snack you still crave?',
  'Which city has the best coffee shops?',
  'What is your favorite board game and how do you play it?',
  'Tell me about a memorable teacher you had.',
  'What small invention improved your daily routine?'
]

export function randomTopic(topics: string[] = DEFAULT_TOPICS) {
  return topics[Math.floor(Math.random() * topics.length)]
}

export const topics = DEFAULT_TOPICS
