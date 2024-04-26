interface Evaluation {
    communicationAndCollaboration: number,
    digitalContentCreation: number,
    informationAndDataLiteracy: number,
    problemSolving: number,
    safety: number
}

export async function evaluate(text: string): Promise<Evaluation> {
    try {
        const response = await fetch(
            "http://localhost:8000/evaluate",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    learningOutcomes: text
                })
            }
        );

        return await response.json();
    } catch (error) {
        throw error;
    }
}