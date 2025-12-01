const REAGENT_STORY_KEY = import.meta.env.VITE_REAGENT_KEY;
const REAGENT_SUGGEST_KEY = import.meta.env.VITE_REAGENT_SUGGEST_KEY;

export async function getNextPart(theme, history, msg) {
  const response = await fetch(
    'https://noggin.rea.gent/heavy-clam-4742',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REAGENT_STORY_KEY}`,
      },
      body: JSON.stringify({
        "theme": theme,
        "history": history,
        "msg": msg,
      }),
    }
  ).then(response => response.text());
  return response;
}

export async function getSuggestion(messages) {
  const response = await fetch(
    'https://noggin.rea.gent/careful-stoat-5141',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REAGENT_SUGGEST_KEY}`,
      },
      body: JSON.stringify({
        "messages": messages,
      }),
    }
  ).then(response => response.text());
  return response;
}