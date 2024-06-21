# ULGIS (Universal Learning Goals Inspirational Synthesizer)

This projet holds the code behind a web app used for synthesizing learning goals for (university) educations, adhering to aspects of learning taxonomies, incl. the newer EU's DigComp 2.2 framework and the still highly used taxonomy by Bloom.

The system consists of a React frontend for UI and a FastAPI backend.

The UI lets the user tune parameters and input settings to generate a prompt and thereby a response with learning goals that can be used as a seed of inspiration for further discussions at study boards, among staff teachers etc.

The backend server compiles the prompt based on input and communicates with a Large Language Model to generate the learning goals.

For system overview and technical documentation, see the `docs/` folder.