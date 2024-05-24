interface Evaluation {
  communicationAndCollaboration: number;
  digitalContentCreation: number;
  informationAndDataLiteracy: number;
  problemSolving: number;
  safety: number;
}

export async function evaluate(text: string): Promise<Evaluation> {
  let url = '';
  if (process.env.REACT_APP_BACKEND_URL) {
    url = process.env.REACT_APP_BACKEND_URL;
  } else {
    throw Error(
      'No default generation service configured for this ' + 'environment.',
    );
  }

  try {
    const response = await fetch(url + '/evaluate/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learningOutcomes: text,
      }),
    });

    return await response.json();
  } catch (error) {
    throw error;
  }
}
